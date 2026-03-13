<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAbonnementRequest;
use App\Models\Abonnement;
use App\Models\AbonnementHistorique;
use App\Models\Hotel;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AbonnementController extends Controller
{
    use LogsAdminAction;

    public function index(Request $request)
    {
        $abonnements = Abonnement::with('hotel')
            ->when($request->type, fn($q, $t) => $q->where('type_abonnement', $t))
            ->when($request->statut === 'actif', fn($q) => $q->where(fn($sq) => $sq->whereNull('date_fin')->orWhere('date_fin', '>=', now())))
            ->when($request->statut === 'expire', fn($q) => $q->where('date_fin', '<', now()))
            ->when($request->hotel, fn($q, $h) => $q->where('hotel_id', $h))
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();

        return view('admin.subscriptions.index', compact('abonnements'));
    }

    public function create()
    {
        $hotels = Hotel::orderBy('nom')->get(['id', 'nom']);

        return view('admin.subscriptions.create', compact('hotels'));
    }

    public function store(StoreAbonnementRequest $request)
    {
        DB::transaction(function () use ($request) {
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
        });

        return redirect()->route('admin.subscriptions.index')
            ->with('success', 'Abonnement créé avec succès.');
    }

    public function show(Abonnement $subscription)
    {
        $subscription->load(['hotel', 'historique.changedBy']);

        return view('admin.subscriptions.show', compact('subscription'));
    }

    public function edit(Abonnement $subscription)
    {
        $subscription->load('hotel');
        $hotels = Hotel::orderBy('nom')->get(['id', 'nom']);

        return view('admin.subscriptions.edit', compact('subscription', 'hotels'));
    }

    public function update(Request $request, Abonnement $subscription)
    {
        $request->validate([
            'type_abonnement' => 'required|string|max:50',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut',
            'prix_mensuel' => 'required|numeric|min:0',
            'devise' => 'nullable|string|max:3',
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

        return redirect()->route('admin.subscriptions.show', $subscription)
            ->with('success', 'Abonnement mis à jour avec succès.');
    }
}
