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
                <a href="{{ route('admin.subscriptions.edit', $subscription) }}" class="rounded-xl bg-evadia-600 px-4 py-2 text-sm font-medium text-white hover:bg-evadia-700">Modifier</a>
            </div>
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
                        <p class="font-medium text-gray-700">{{ ucfirst($hist->statut) }}</p>
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
    </div>
@endsection
