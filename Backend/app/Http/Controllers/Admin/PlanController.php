<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Abonnement;
use App\Models\Plan;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Formules d'abonnement (Explore, Select, Signature…).
 *
 * Le code est la référence stockée dans chaque abonnement : il n'est plus
 * modifiable après la création, et une formule ne se supprime pas, elle se
 * désactive (elle disparaît des choix, les abonnements existants la gardent).
 * Changer un prix ne touche pas les abonnements en cours.
 */
class PlanController extends Controller
{
    use LogsAdminAction;

    /** Couleurs proposées : classes Tailwind du badge et de la bordure. */
    public const COULEURS = [
        'gris'     => ['label' => 'Gris',     'badge_bg' => 'bg-gray-100',    'badge_text' => 'text-gray-700',    'border' => 'border-gray-400'],
        'evadia'   => ['label' => 'Evadia',   'badge_bg' => 'bg-evadia-100',  'badge_text' => 'text-evadia-700',  'border' => 'border-evadia-500'],
        'ambre'    => ['label' => 'Ambre',    'badge_bg' => 'bg-amber-100',   'badge_text' => 'text-amber-700',   'border' => 'border-amber-500'],
        'emeraude' => ['label' => 'Émeraude', 'badge_bg' => 'bg-emerald-100', 'badge_text' => 'text-emerald-700', 'border' => 'border-emerald-500'],
        'bleu'     => ['label' => 'Bleu',     'badge_bg' => 'bg-sky-100',     'badge_text' => 'text-sky-700',     'border' => 'border-sky-500'],
        'violet'   => ['label' => 'Violet',   'badge_bg' => 'bg-violet-100',  'badge_text' => 'text-violet-700',  'border' => 'border-violet-500'],
        'rose'     => ['label' => 'Rose',     'badge_bg' => 'bg-rose-100',    'badge_text' => 'text-rose-700',    'border' => 'border-rose-500'],
    ];

    public function index()
    {
        $plans = Plan::orderBy('ordre')->orderBy('nom')->get();

        // Abonnements par formule (dernier abonnement de chaque hôtel)
        $utilisation = Abonnement::whereIn('id', fn($q) => $q->selectRaw('max(id)')->from('abonnements')->groupBy('hotel_id'))
            ->selectRaw('type_abonnement, count(*) as total')
            ->groupBy('type_abonnement')
            ->pluck('total', 'type_abonnement');

        return view('admin.plans.index', compact('plans', 'utilisation'));
    }

    public function create()
    {
        return view('admin.plans.form', [
            'plan'     => new Plan(['devise' => 'MGA', 'est_actif' => true, 'ordre' => (Plan::max('ordre') ?? 0) + 1, 'features' => []]),
            'couleurs' => self::COULEURS,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->valider($request, null);
        $plan = Plan::create($data);

        $this->logAction('plan_created', "Formule {$plan->nom} ({$plan->code}) créée");

        return redirect()->route('admin.plans.index')->with('success', "Formule « {$plan->nom} » créée.");
    }

    public function edit(Plan $plan)
    {
        return view('admin.plans.form', ['plan' => $plan, 'couleurs' => self::COULEURS]);
    }

    public function update(Request $request, Plan $plan)
    {
        $data = $this->valider($request, $plan);
        $ancienPrix = $plan->prix;
        $plan->update($data);

        $this->logAction('plan_updated', "Formule {$plan->nom} ({$plan->code}) modifiée");

        $message = "Formule « {$plan->nom} » mise à jour.";
        if ((float) $ancienPrix !== (float) $plan->prix) {
            $message .= ' Le nouveau prix s\'applique aux prochains abonnements ; les abonnements en cours gardent leur prix.';
        }

        return redirect()->route('admin.plans.index')->with('success', $message);
    }

    public function toggle(Plan $plan)
    {
        if ($plan->est_actif && Plan::where('est_actif', true)->count() <= 1) {
            return back()->with('error', 'Il doit rester au moins une formule active.');
        }

        $plan->update(['est_actif' => !$plan->est_actif]);
        $this->logAction('plan_toggled', "Formule {$plan->code} " . ($plan->est_actif ? 'activée' : 'désactivée'));

        return back()->with('success', $plan->est_actif
            ? "Formule « {$plan->nom} » activée."
            : "Formule « {$plan->nom} » désactivée : elle n'est plus proposée, les abonnements existants la conservent.");
    }

    private function valider(Request $request, ?Plan $plan): array
    {
        $rules = [
            'nom'         => 'required|string|max:100',
            'label'       => 'required|string|max:50',
            'description' => 'nullable|string|max:255',
            'prix'        => 'required|numeric|min:0',
            'devise'      => 'required|string|size:3',
            'couleur'     => ['required', Rule::in(array_keys(self::COULEURS))],
            'ordre'       => 'required|integer|min:0|max:255',
            'est_actif'   => 'boolean',
            'features'    => 'nullable|array',
            'features.*.texte'  => 'nullable|string|max:255',
            'features.*.inclus' => 'nullable|boolean',
        ];

        // Le code n'est saisi qu'à la création : il identifie la formule dans les abonnements.
        if (!$plan) {
            $rules['code'] = ['required', 'string', 'max:50', 'regex:/^[a-z0-9_-]+$/', 'unique:plans,code'];
        }

        $valides = $request->validate($rules, [
            'code.regex' => 'Le code ne peut contenir que des minuscules, chiffres, tirets et underscores.',
        ]);

        $couleur = self::COULEURS[$valides['couleur']];

        $features = collect($valides['features'] ?? [])
            ->filter(fn($f) => filled($f['texte'] ?? null))
            ->map(fn($f) => ['inclus' => (bool) ($f['inclus'] ?? false), 'texte' => trim($f['texte'])])
            ->values()
            ->all();

        return array_merge(
            collect($valides)->only(['code', 'nom', 'label', 'description', 'prix', 'ordre'])->all(),
            [
                'devise'     => strtoupper($valides['devise']),
                'est_actif'  => $request->boolean('est_actif'),
                'features'   => $features,
                'badge_bg'   => $couleur['badge_bg'],
                'badge_text' => $couleur['badge_text'],
                'border'     => $couleur['border'],
            ],
        );
    }

    /** Clé de couleur correspondant aux classes d'une formule (pour pré-remplir le formulaire). */
    public static function couleurDe(Plan $plan): string
    {
        foreach (self::COULEURS as $cle => $c) {
            if ($c['badge_bg'] === $plan->badge_bg) {
                return $cle;
            }
        }
        return 'gris';
    }
}
