@extends('layouts.admin')
@section('title', 'Abonnement #' . $subscription->id . ' - EVADIA Admin')
@section('page_title', 'Détail abonnement')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.subscriptions.index') }}" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">← Retour</a>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">Abonnement #{{ $subscription->id }}</h3>
                <div class="flex items-center gap-2">
                    <form method="POST" action="{{ route('admin.subscriptions.paiement', $subscription) }}"
                        data-confirm="Enregistrer un paiement de {{ number_format($subscription->prix_mensuel, 2, ',', ' ') }} {{ $subscription->devise }} et prolonger l'abonnement d'un mois ?"
                        onsubmit="return confirm(this.dataset.confirm)">
                        @csrf
                        <button type="submit" class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Enregistrer un paiement</button>
                    </form>
                    <a href="{{ route('admin.subscriptions.create', ['hotel_id' => $subscription->hotel_id]) }}"
                        class="rounded-xl px-4 py-2 text-sm font-medium text-evadia-700 ring-1 ring-evadia-200 hover:bg-evadia-50">Changer de formule</a>
                    <a href="{{ route('admin.subscriptions.edit', $subscription) }}" class="rounded-xl bg-evadia-600 px-4 py-2 text-sm font-medium text-white hover:bg-evadia-700">Modifier</a>
                </div>
            </div>

            @php
                $jours = $subscription->joursAvantExpiration();
                $suspension = $subscription->dateSuspensionPrevue();
            @endphp
            @if($subscription->statut === \App\Models\Abonnement::STATUT_PAUSE)
                <div class="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
                    <strong>En pause.</strong> L'hôtel n'est pas visible sur le site. Pas de relance ni de suspension pendant la pause ; les jours payés non utilisés seront reportés à la reprise.
                </div>
            @elseif($subscription->statut === \App\Models\Abonnement::STATUT_SUSPENDU)
                <div class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    <strong>Suspendu pour impayé.</strong> L'hôtel n'est plus visible sur le site. Enregistrer un paiement le réactive et prolonge l'abonnement d'un mois à partir d'aujourd'hui.
                </div>
            @elseif($subscription->statut === \App\Models\Abonnement::STATUT_RETARD)
                <div class="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <strong>En retard de paiement</strong> depuis le {{ $subscription->date_fin->format('d/m/Y') }}.
                    Suspension automatique le <strong>{{ $suspension->format('d/m/Y') }}</strong> sans paiement.
                    Pour accorder plus de délai, modifiez la date de fin.
                </div>
            @elseif($jours !== null && $jours <= 7)
                <div class="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                    Échéance {{ $jours === 0 ? "aujourd'hui" : "dans {$jours} jour" . ($jours > 1 ? 's' : '') }} ({{ $subscription->date_fin->format('d/m/Y') }}).
                </div>
            @endif
            <dl class="grid grid-cols-2 gap-4">
                <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase">Hôtel</dt>
                    <dd class="mt-1 text-sm font-medium text-gray-900">{{ $subscription->hotel?->nom }}</dd>
                </div>
                <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase">Type</dt>
                    <dd class="mt-1"><span class="rounded-full bg-evadia-50 px-2.5 py-0.5 text-xs font-medium text-evadia-700">{{ ucfirst($subscription->type_abonnement) }}</span></dd>
                </div>
                <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase">Date début</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ $subscription->date_debut?->format('d/m/Y') }}</dd>
                </div>
                <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase">Date fin</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ $subscription->date_fin?->format('d/m/Y') ?? 'Illimité' }}</dd>
                </div>
                <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase">Statut</dt>
                    <dd class="mt-1">
                        @switch($subscription->statut)
                            @case('retard')
                                <span class="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">En retard</span>
                                @break
                            @case('suspendu')
                                <span class="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">Suspendu (impayé)</span>
                                @break
                            @case('pause')
                                <span class="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">En pause</span>
                                @break
                            @default
                                <span class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">À jour</span>
                        @endswitch
                    </dd>
                </div>
                <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase">Prix mensuel</dt>
                    <dd class="mt-1 text-sm font-bold text-gray-900">{{ number_format($subscription->prix_mensuel, 2, ',', ' ') }} {{ $subscription->devise }}</dd>
                </div>
            </dl>
        </div>

        <!-- History -->
        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Historique</h3>
            <div class="space-y-3">
                @forelse($subscription->historique as $hist)
                    <div class="text-sm border-l-2 border-evadia-200 pl-3">
                        <p class="font-medium text-gray-700">{{ ['paiement' => 'Paiement reçu', 'retard' => 'Passé en retard', 'suspendu' => 'Suspendu (impayé)', 'pause' => 'Mise en pause', 'reprise' => 'Fin de pause'][$hist->statut] ?? ucfirst($hist->statut) }}</p>
                        @if(in_array($hist->statut, ['paiement', 'actif']) && $hist->date_fin)
                            <p class="text-xs text-gray-500">Jusqu'au {{ $hist->date_fin->format('d/m/Y') }}</p>
                        @endif
                        <p class="text-xs text-gray-400">{{ $hist->created_at?->format('d/m/Y H:i') }}</p>
                        @if($hist->changedBy)
                            <p class="text-xs text-gray-400">Par {{ $hist->changedBy->prenom }} {{ $hist->changedBy->nom }}</p>
                        @endif
                    </div>
                @empty
                    <p class="text-sm text-gray-400">Aucun historique</p>
                @endforelse
            </div>
        </div>

        <!-- Pause -->
        <div class="lg:col-span-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-gray-900">Pause</h3>
                <p class="text-xs text-gray-500">
                    Déjà <strong class="{{ $joursPause12Mois > 90 ? 'text-red-600' : 'text-gray-700' }}">{{ $joursPause12Mois }} jour(s)</strong> de pause sur les 12 derniers mois
                </p>
            </div>

            @if(session('reservations_bloquantes'))
                <div class="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p class="text-sm font-semibold text-red-800 mb-2">Réservations qui bloquent la pause</p>
                    <p class="text-xs text-red-700 mb-3">L'hôtel doit refuser les demandes en attente et honorer ou annuler avec le client les séjours acceptés, ou choisissez d'autres dates.</p>
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead>
                                <tr class="text-left text-xs font-medium uppercase text-red-700">
                                    <th class="py-1.5 pr-4">Réservation</th>
                                    <th class="py-1.5 pr-4">Client</th>
                                    <th class="py-1.5 pr-4">Chambre</th>
                                    <th class="py-1.5 pr-4">Séjour</th>
                                    <th class="py-1.5">Statut</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-red-100">
                                @foreach(session('reservations_bloquantes') as $r)
                                    <tr class="text-red-900">
                                        <td class="py-1.5 pr-4 font-medium">{{ $r['code'] }}</td>
                                        <td class="py-1.5 pr-4">{{ $r['client'] }}</td>
                                        <td class="py-1.5 pr-4">{{ $r['chambre'] }}</td>
                                        <td class="py-1.5 pr-4">{{ $r['arrivee'] }} → {{ $r['depart'] }}</td>
                                        <td class="py-1.5">{{ $r['statut'] === 'acceptee' ? 'Acceptée' : 'En attente' }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            @endif

            @if($pauseActive)
                <div class="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                    <p class="text-sm text-indigo-900">
                        <strong>{{ $pauseActive->statut === 'en_cours' ? 'En pause' : 'Pause planifiée' }}</strong>
                        du {{ $pauseActive->date_debut->format('d/m/Y') }} au {{ $pauseActive->date_reprise->format('d/m/Y') }}
                        ({{ $pauseActive->duree() }} jours){{ $pauseActive->raison ? ' — ' . $pauseActive->raison : '' }}
                    </p>
                    <div class="mt-3 flex flex-wrap items-end gap-3">
                        <form method="POST" action="{{ route('admin.pauses.update', $pauseActive) }}" class="flex items-end gap-2">
                            @csrf @method('PATCH')
                            <label class="text-xs text-indigo-800">Nouvelle date de reprise
                                <input type="date" name="date_reprise" value="{{ $pauseActive->date_reprise->toDateString() }}" required
                                    class="mt-1 block rounded-lg border-indigo-200 text-sm">
                            </label>
                            <button class="rounded-lg bg-white px-3 py-2 text-sm font-medium text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-100">Modifier</button>
                        </form>
                        @if($pauseActive->statut === 'en_cours')
                            <form method="POST" action="{{ route('admin.pauses.reprendre', $pauseActive) }}"
                                data-confirm="Terminer la pause maintenant ? L'hôtel redevient visible sur le site aujourd'hui."
                                onsubmit="return confirm(this.dataset.confirm)">
                                @csrf
                                <button class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Reprendre maintenant</button>
                            </form>
                        @else
                            <form method="POST" action="{{ route('admin.pauses.destroy', $pauseActive) }}"
                                data-confirm="Annuler cette pause planifiée ?" onsubmit="return confirm(this.dataset.confirm)">
                                @csrf @method('DELETE')
                                <button class="rounded-lg bg-white px-3 py-2 text-sm font-medium text-red-600 ring-1 ring-red-200 hover:bg-red-50">Annuler la pause</button>
                            </form>
                        @endif
                    </div>
                </div>
            @elseif($subscription->statut === 'actif' && $subscription->hotel?->currentStatut?->statut === 'actif')
                <form method="POST" action="{{ route('admin.subscriptions.pause', $subscription) }}" class="flex flex-wrap items-end gap-3">
                    @csrf
                    <label class="text-xs text-gray-600">Début
                        <input type="date" name="date_debut" value="{{ old('date_debut', today()->toDateString()) }}" required
                            min="{{ today()->toDateString() }}" @if($subscription->date_fin) max="{{ $subscription->date_fin->toDateString() }}" @endif
                            class="mt-1 block rounded-lg border-gray-300 text-sm">
                    </label>
                    <label class="text-xs text-gray-600">Reprise (l'hôtel réapparaît ce jour-là)
                        <input type="date" name="date_reprise" value="{{ old('date_reprise') }}" required
                            class="mt-1 block rounded-lg border-gray-300 text-sm">
                    </label>
                    <label class="text-xs text-gray-600 flex-1 min-w-[200px]">Raison (optionnel)
                        <input type="text" name="raison" value="{{ old('raison') }}" maxlength="500" placeholder="Ex. travaux, fermeture saisonnière"
                            class="mt-1 block w-full rounded-lg border-gray-300 text-sm">
                    </label>
                    <button class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Mettre en pause</button>
                </form>
                <p class="mt-2 text-xs text-gray-500">
                    Gratuit. La pause doit commencer au plus tard le jour de l'échéance{{ $subscription->date_fin ? ' (' . $subscription->date_fin->format('d/m/Y') . ')' : '' }}.
                    Refusée s'il reste des réservations en attente ou acceptées sur la période.
                </p>
            @else
                <p class="text-sm text-gray-500">Pause possible uniquement pour un hôtel actif dont l'abonnement est à jour.</p>
            @endif

            @php $anciennes = $subscription->pauses->reject(fn($p) => $pauseActive && $p->id === $pauseActive->id); @endphp
            @if($anciennes->isNotEmpty())
                <div class="mt-4 border-t border-gray-100 pt-3 space-y-1">
                    @foreach($anciennes as $p)
                        <p class="text-xs text-gray-500">
                            {{ $p->date_debut->format('d/m/Y') }} → {{ $p->date_reprise->format('d/m/Y') }}
                            · {{ $p->statut === 'annulee' ? 'Annulée' : 'Terminée' }}
                            @if($p->jours_reportes !== null) · {{ $p->jours_reportes }} jour(s) reporté(s) @endif
                            @if($p->raison) · {{ $p->raison }} @endif
                        </p>
                    @endforeach
                </div>
            @endif
        </div>

        <!-- Périodes payées -->
        <div class="lg:col-span-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Périodes payées</h3>
            @if($subscription->paiements->isEmpty())
                <p class="text-sm text-gray-400">Aucun paiement enregistré</p>
            @else
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead>
                            <tr class="text-left text-xs font-medium uppercase text-gray-500">
                                <th class="py-2 pr-4">Période</th>
                                <th class="py-2 pr-4">Montant</th>
                                <th class="py-2 pr-4">Origine</th>
                                <th class="py-2 pr-4">Enregistré le</th>
                                <th class="py-2">Par</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            @foreach($subscription->paiements as $p)
                                <tr>
                                    <td class="py-2 pr-4 font-medium text-gray-900">
                                        {{ $p->periode_debut->format('d/m/Y') }} → {{ $p->periode_fin?->format('d/m/Y') ?? 'sans fin' }}
                                    </td>
                                    <td class="py-2 pr-4 text-gray-700">
                                        {{ $p->montant !== null ? number_format($p->montant, 2, ',', ' ') . ' ' . $p->devise : '—' }}
                                    </td>
                                    <td class="py-2 pr-4 text-gray-500">
                                        {{ ['initial' => 'Début d\'abonnement', 'paiement' => 'Paiement', 'reprise' => 'Antérieur (reprise)', 'report' => 'Report après pause'][$p->source] ?? $p->source }}
                                    </td>
                                    <td class="py-2 pr-4 text-gray-500">{{ $p->created_at?->format('d/m/Y H:i') }}</td>
                                    <td class="py-2 text-gray-500">{{ $p->enregistrePar ? $p->enregistrePar->prenom . ' ' . $p->enregistrePar->nom : 'Système' }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endif
        </div>
    </div>
@endsection
