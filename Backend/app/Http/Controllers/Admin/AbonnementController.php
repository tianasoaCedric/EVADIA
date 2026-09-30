<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAbonnementRequest;
use App\Models\Abonnement;
use App\Models\AbonnementHistorique;
use App\Exceptions\PauseImpossibleException;
use App\Models\AbonnementPaiement;
use App\Models\AbonnementPause;
use Carbon\Carbon;
use App\Models\Hotel;
use App\Models\Plan;
use App\Services\AbonnementService;
use App\Services\PauseAbonnementService;
use App\Support\FrontendCache;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AbonnementController extends Controller
{
    use LogsAdminAction;

    public function index(Request $request)
    {
        $year = (int) ($request->year ?: now()->year);
        $search = $request->search;
        $statut = in_array($request->statut, Abonnement::STATUTS, true) ? $request->statut : null;

        $hotels = Hotel::query()
            ->with('dernierAbonnement')
            ->when($search, fn($q) => $q->where('nom', 'ilike', "%{$search}%"))
            ->when($statut, fn($q) => $q->whereHas('dernierAbonnement', fn($a) => $a->where('statut', $statut)))
            ->orderBy('nom')
            ->paginate(10)
            ->withQueryString();

        // Périodes payées qui touchent l'année affichée
        $paiements = AbonnementPaiement::with('abonnement:id,type_abonnement')
            ->whereIn('hotel_id', $hotels->pluck('id'))
            ->where('periode_debut', '<=', "{$year}-12-31")
            ->where(fn($q) => $q->whereNull('periode_fin')->orWhere('periode_fin', '>=', "{$year}-01-01"))
            ->get()
            ->groupBy('hotel_id');

        $months = [
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr',
            5 => 'Mai', 6 => 'Juin', 7 => 'Juil', 8 => 'Août',
            9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc',
        ];

        $pauses = AbonnementPause::whereIn('hotel_id', $hotels->pluck('id'))
            ->where('statut', '!=', AbonnementPause::STATUT_ANNULEE)
            ->where('date_debut', '<=', "{$year}-12-31")
            ->where('date_reprise', '>', "{$year}-01-01")
            ->get()
            ->groupBy('hotel_id');

        $cellules = $hotels->mapWithKeys(fn(Hotel $hotel) => [
            $hotel->id => collect(array_keys($months))->mapWithKeys(fn($m) => [
                $m => $this->etatDuMois(
                    $hotel->dernierAbonnement,
                    $paiements->get($hotel->id, collect()),
                    $pauses->get($hotel->id, collect()),
                    $year,
                    $m,
                ),
            ]),
        ]);

        // Compteurs sur le dernier abonnement de chaque hôtel
        $compteurs = collect(Abonnement::STATUTS)->mapWithKeys(fn($s) => [
            $s => Hotel::whereHas('dernierAbonnement', fn($a) => $a->where('statut', $s))->count(),
        ]);

        return view('admin.subscriptions.index', compact('hotels', 'cellules', 'year', 'months', 'search', 'statut', 'compteurs'));
    }

    /**
     * État d'un mois dans le tableau de suivi :
     *  paye     : couvert par une période payée
     *  a_payer  : dans la durée de l'abonnement (délai accordé), pas encore payé, mois en cours ou à venir
     *  impaye   : dans la durée de l'abonnement, jamais payé, mois passé
     *  retard   : après l'échéance, pendant le délai de grâce
     *  suspendu : après l'échéance, hôtel suspendu pour impayé
     *  pause    : mois (non payé) touché par une pause
     *  aucun    : pas d'abonnement
     *
     * @return array{etat:string, label:string, abonnement_id:?int, titre:string}
     */
    private function etatDuMois(?Abonnement $dernier, $paiements, $pauses, int $year, int $month): array
    {
        $debut = Carbon::create($year, $month, 1)->startOfDay();
        $fin = $debut->copy()->endOfMonth();
        $aujourdhui = today();

        $paye = $paiements->first(fn(AbonnementPaiement $p) => $p->chevauche($debut, $fin));
        if ($paye) {
            $type = $paye->abonnement?->type_abonnement ?? '';
            return [
                'etat'          => 'paye',
                'label'         => ucfirst(mb_substr($type, 0, 4)),
                'abonnement_id' => $paye->abonnement_id,
                'titre'         => ucfirst($type) . ' — payé du ' . $paye->periode_debut->format('d/m/Y')
                    . ($paye->periode_fin ? ' au ' . $paye->periode_fin->format('d/m/Y') : ' (sans fin)'),
            ];
        }

        // Mois (même partiellement) en pause : ni payé ni dû.
        $pause = $pauses->first(fn(AbonnementPause $p) => $p->chevauche($debut, $fin));
        if ($pause) {
            return [
                'etat'          => 'pause',
                'label'         => 'Pause',
                'abonnement_id' => $pause->abonnement_id,
                'titre'         => ($pause->statut === AbonnementPause::STATUT_PLANIFIEE ? 'Pause planifiée' : 'Pause')
                    . ' du ' . $pause->date_debut->format('d/m/Y') . ' au ' . $pause->date_reprise->format('d/m/Y'),
            ];
        }

        $aucun = ['etat' => 'aucun', 'label' => '—', 'abonnement_id' => null, 'titre' => "Pas d'abonnement"];

        // Mois pas encore commencé, ou antérieur à l'abonnement en cours : rien à signaler.
        if (!$dernier || $debut->gt($aujourdhui) || $dernier->date_debut->gt($fin)) {
            return $aucun;
        }

        $etat = match (true) {
            $dernier->date_fin === null || $debut->lte($dernier->date_fin) => $fin->lt($aujourdhui) ? 'impaye' : 'a_payer',
            $dernier->statut === Abonnement::STATUT_SUSPENDU               => 'suspendu',
            $dernier->statut === Abonnement::STATUT_RETARD                 => 'retard',
            default                                                        => null,
        };

        if (!$etat) {
            return $aucun;
        }

        [$label, $titre] = match ($etat) {
            'impaye'   => ['Impayé', 'Mois non payé'],
            'a_payer'  => ['À payer', "Délai accordé jusqu'au " . $dernier->date_fin?->format('d/m/Y') . ', paiement non reçu'],
            'retard'   => ['Retard', 'Échéance dépassée — suspension le ' . $dernier->dateSuspensionPrevue()->format('d/m/Y')],
            'suspendu' => ['Susp.', 'Hôtel suspendu pour impayé'],
        };

        return ['etat' => $etat, 'label' => $label, 'abonnement_id' => $dernier->id, 'titre' => $titre];
    }

    public function create(Request $request)
    {
        $hotels = Hotel::orderBy('nom')->get(['id', 'nom']);
        $plans = Plan::actif()->get();
        // Pré-sélection depuis la fiche d'un abonnement (« Changer de formule »)
        $hotelId = $request->integer('hotel_id') ?: null;

        return view('admin.subscriptions.create', compact('hotels', 'plans', 'hotelId'));
    }

    public function store(StoreAbonnementRequest $request, AbonnementService $service)
    {
        // Sinon la reprise de la pause, rattachée à l'ancien abonnement, ne suivrait plus le bon.
        if (AbonnementPause::active()->where('hotel_id', $request->hotel_id)->exists()) {
            return back()->withInput()
                ->with('error', "Cet hôtel a une pause planifiée ou en cours : terminez-la ou annulez-la avant de créer un nouvel abonnement.");
        }

        $reactive = DB::transaction(function () use ($request, $service) {
            $abonnement = Abonnement::create([
                'hotel_id' => $request->hotel_id,
                'type_abonnement' => $request->type_abonnement,
                'date_debut' => $request->date_debut,
                'date_fin' => $request->date_fin,
                'prix_mensuel' => $request->prix_mensuel,
                'devise' => $request->devise ?? 'EUR',
            ]);

            AbonnementHistorique::create([
                'abonnement_id' => $abonnement->id,
                'type_abonnement' => $abonnement->type_abonnement,
                'date_debut' => $abonnement->date_debut,
                'date_fin' => $abonnement->date_fin,
                'prix_mensuel' => $abonnement->prix_mensuel,
                'statut' => 'actif',
                'changed_by' => auth()->id(),
            ]);

            $this->logAction('abonnement_created', "Abonnement créé pour l'hôtel ID: {$abonnement->hotel_id}");

            // Période de départ comptée comme payée + réactivation si suspendu pour impayé
            return $service->demarrer($abonnement, auth()->id());
        });

        if ($reactive) {
            FrontendCache::purgerHotels();
        }

        return redirect()->route('admin.subscriptions.index')
            ->with('success', $reactive
                ? "Abonnement créé. L'hôtel, suspendu pour impayé, est de nouveau visible sur le site."
                : 'Abonnement créé avec succès.');
    }

    public function show(Abonnement $subscription)
    {
        $subscription->load(['hotel.currentStatut', 'historique.changedBy', 'paiements.enregistrePar', 'pauses.createdBy']);

        $pauseActive = $subscription->pauses->first(
            fn(AbonnementPause $p) => in_array($p->statut, AbonnementPause::STATUTS_ACTIVES, true)
        );
        $joursPause12Mois = app(PauseAbonnementService::class)->joursDePauseSur12Mois($subscription->hotel_id);

        return view('admin.subscriptions.show', compact('subscription', 'pauseActive', 'joursPause12Mois'));
    }

    public function edit(Abonnement $subscription)
    {
        $subscription->load('hotel');
        $plans = Plan::actif()->get();

        return view('admin.subscriptions.edit', compact('subscription', 'plans'));
    }

    public function update(Request $request, Abonnement $subscription, AbonnementService $service)
    {
        $request->validate([
            // Une formule active, ou celle que l'abonnement a déjà (même désactivée ou supprimée)
            'type_abonnement' => [
                'required',
                'string',
                Rule::in(Plan::actif()->pluck('code')->push($subscription->type_abonnement)->all()),
            ],
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut',
            'prix_mensuel' => 'required|numeric|min:0',
            'devise' => 'nullable|string|in:MGA,EUR',
        ], [
            'type_abonnement.in' => 'Formule inconnue ou désactivée.',
        ]);

        DB::transaction(function () use ($request, $subscription) {
            // Archive current state
            AbonnementHistorique::create([
                'abonnement_id' => $subscription->id,
                'type_abonnement' => $subscription->type_abonnement,
                'date_debut' => $subscription->date_debut,
                'date_fin' => now(),
                'prix_mensuel' => $subscription->prix_mensuel,
                'statut' => 'modifie',
                'changed_by' => auth()->id(),
            ]);

            // Update subscription
            $subscription->update([
                'type_abonnement' => $request->type_abonnement,
                'date_debut' => $request->date_debut,
                'date_fin' => $request->date_fin,
                'prix_mensuel' => $request->prix_mensuel,
                'devise' => $request->devise ?? $subscription->devise,
            ]);

            // Create new history entry
            AbonnementHistorique::create([
                'abonnement_id' => $subscription->id,
                'type_abonnement' => $subscription->type_abonnement,
                'date_debut' => $subscription->date_debut,
                'date_fin' => $subscription->date_fin,
                'prix_mensuel' => $subscription->prix_mensuel,
                'statut' => 'actif',
                'changed_by' => auth()->id(),
            ]);

            $this->logAction('abonnement_updated', "Abonnement ID: {$subscription->id} modifié");
        });

        // Nouvelle échéance (ex. délai prolongé) : retard / suspension recalculés.
        $service->recalerStatut($subscription, auth()->id());

        return redirect()->route('admin.subscriptions.show', $subscription)
            ->with('success', 'Abonnement mis à jour avec succès.');
    }

    // ── Pause ───────────────────────────────────────────────

    public function planifierPause(Request $request, Abonnement $subscription, PauseAbonnementService $pauses)
    {
        $data = $request->validate([
            'date_debut'   => 'required|date',
            'date_reprise' => 'required|date|after:date_debut',
            'raison'       => 'nullable|string|max:500',
        ]);

        try {
            $pause = $pauses->planifier(
                $subscription,
                Carbon::parse($data['date_debut']),
                Carbon::parse($data['date_reprise']),
                $data['raison'] ?? null,
                auth()->id(),
            );
        } catch (PauseImpossibleException $e) {
            return $this->refusPause($e);
        }

        $this->logAction('abonnement_pause', "Pause abonnement ID: {$subscription->id} du {$pause->date_debut->format('d/m/Y')} au {$pause->date_reprise->format('d/m/Y')}");

        return back()->with('success', $pause->statut === AbonnementPause::STATUT_EN_COURS
            ? "Hôtel en pause jusqu'au {$pause->date_reprise->format('d/m/Y')} : il n'est plus visible sur le site."
            : "Pause planifiée du {$pause->date_debut->format('d/m/Y')} au {$pause->date_reprise->format('d/m/Y')}.");
    }

    public function reprendrePause(AbonnementPause $pause, PauseAbonnementService $pauses)
    {
        if ($pause->statut !== AbonnementPause::STATUT_EN_COURS) {
            return back()->with('error', "Cette pause n'est pas en cours.");
        }

        $pauses->reprendre($pause, auth()->id());
        $this->logAction('abonnement_reprise', "Reprise anticipée, abonnement ID: {$pause->abonnement_id}");

        return back()->with('success', "Pause terminée : {$pause->fresh()->jours_reportes} jour(s) reporté(s), l'hôtel est de nouveau visible.");
    }

    public function modifierPause(Request $request, AbonnementPause $pause, PauseAbonnementService $pauses)
    {
        $data = $request->validate(['date_reprise' => 'required|date']);

        try {
            $pauses->modifierReprise($pause, Carbon::parse($data['date_reprise']), auth()->id());
        } catch (PauseImpossibleException $e) {
            return $this->refusPause($e);
        }

        $this->logAction('abonnement_pause_modifiee', "Reprise de la pause ID: {$pause->id} fixée au {$data['date_reprise']}");

        return back()->with('success', 'Date de reprise mise à jour.');
    }

    public function annulerPause(AbonnementPause $pause, PauseAbonnementService $pauses)
    {
        try {
            $pauses->annuler($pause, auth()->id());
        } catch (PauseImpossibleException $e) {
            return back()->with('error', $e->getMessage());
        }

        $this->logAction('abonnement_pause_annulee', "Pause ID: {$pause->id} annulée");

        return back()->with('success', 'Pause annulée.');
    }

    /** Refus de pause : message + liste des réservations bloquantes, affichée sur la fiche. */
    private function refusPause(PauseImpossibleException $e)
    {
        $reservations = $e->reservations->map(fn($r) => [
            'id'        => $r->id,
            'code'      => $r->code_reservation,
            'client'    => trim(($r->client?->prenom ?? '') . ' ' . ($r->client?->nom ?? '')),
            'chambre'   => $r->propriete?->nom,
            'arrivee'   => $r->date_debut->format('d/m/Y'),
            'depart'    => $r->date_fin->format('d/m/Y'),
            'statut'    => $r->statut,
        ])->all();

        return back()->withInput()
            ->with('error', $e->getMessage())
            ->with('reservations_bloquantes', $reservations);
    }

    public function enregistrerPaiement(Abonnement $subscription, AbonnementService $service)
    {
        $service->enregistrerPaiement($subscription, auth()->id());

        $this->logAction('abonnement_paiement', "Paiement enregistré pour l'abonnement ID: {$subscription->id} (hôtel ID: {$subscription->hotel_id})");

        return redirect()->route('admin.subscriptions.show', $subscription)
            ->with('success', "Paiement enregistré : abonnement prolongé jusqu'au {$subscription->date_fin->format('d/m/Y')}.");
    }
}
