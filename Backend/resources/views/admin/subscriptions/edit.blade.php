@extends('layouts.admin')
@section('title', 'Modifier abonnement - EVADIA Admin')
@section('page_title', 'Modifier abonnement')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.subscriptions.show', $subscription) }}"
            class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">← Retour</a>
    </div>

    <div class="max-w-2xl mx-auto">
        <form method="POST" action="{{ route('admin.subscriptions.update', $subscription) }}" class="space-y-6">
            @csrf @method('PUT')

            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <h3 class="text-sm font-semibold text-gray-800">Modifier l'abonnement</h3>
                </div>
                <div class="p-6 space-y-5">

                    <div class="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                        <svg class="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5M3.75 3v18m16.5-18v18M5.25 3h13.5M5.25 21V10.5m0 0h3v3h-3v-3zm0-4.5h3v3h-3V6zm6 4.5h3v3h-3v-3zm0-4.5h3v3h-3V6zm6 4.5h3v3h-3v-3zm0-4.5h3v3h-3V6z" />
                        </svg>
                        <span class="text-sm font-semibold text-gray-800">{{ $subscription->hotel?->nom }}</span>
                    </div>

                    @include('admin.subscriptions.partials.formule', [
                        'plans'           => $plans,
                        'selection'       => old('type_abonnement', $subscription->type_abonnement),
                        'prix'            => old('prix_mensuel', $subscription->prix_mensuel),
                        'devise'          => old('devise', $subscription->devise ?: 'MGA'),
                        'formuleActuelle' => $subscription->type_abonnement,
                    ])

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Date début <span class="text-red-400 text-xs">*</span></label>
                            <input type="date" name="date_debut" value="{{ $subscription->date_debut?->format('Y-m-d') }}" required
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Date fin</label>
                            <input type="date" name="date_fin" value="{{ $subscription->date_fin?->format('Y-m-d') }}"
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                        </div>
                    </div>

                    <p class="text-xs text-gray-500">
                        Repousser la date de fin accorde un délai (sans paiement). Pour enregistrer un mois payé, utilisez plutôt « Enregistrer un paiement » sur la fiche.
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-3 pt-1">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 active:scale-95 transition-all">
                    Enregistrer
                </button>
                <a href="{{ route('admin.subscriptions.show', $subscription) }}"
                    class="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection
