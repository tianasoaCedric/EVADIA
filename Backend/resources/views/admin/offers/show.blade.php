@extends('layouts.admin')
@section('title', $offer->titre . ' - EVADIA Admin')
@section('page_title', 'Détail offre')

@section('content')
    <div class="mb-6 flex items-center justify-between">
        <a href="{{ route('admin.offers.index') }}" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">←
            Retour</a>
        <a href="{{ route('admin.offers.edit', $offer) }}"
            class="rounded-xl bg-evadia-600 px-4 py-2 text-sm font-medium text-white hover:bg-evadia-700">Modifier</a>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
            <!-- Info Card -->
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <div class="flex items-start justify-between">
                    <div>
                        <h2 class="text-xl font-bold text-gray-900">{{ $offer->titre }}</h2>
                        @if($offer->code_promo)
                            <span
                                class="mt-2 inline-block rounded-lg bg-amber-50 px-3 py-1 text-sm font-mono font-medium text-amber-700">{{ $offer->code_promo }}</span>
                        @endif
                    </div>
                    <span
                        class="rounded-full px-3 py-1 text-xs font-medium
                            {{ $offer->statut === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700' }}">
                        {{ ucfirst($offer->statut) }}
                    </span>
                </div>
                @if($offer->description)
                    <p class="mt-4 text-sm text-gray-600">{{ $offer->description }}</p>
                @endif
                <div class="mt-4 flex gap-6 text-sm text-gray-500">
                    <span>📅 {{ $offer->date_debut?->format('d/m/Y') }} → {{ $offer->date_fin?->format('d/m/Y') }}</span>
                    <span>👤 Créé par {{ $offer->createdBy?->prenom }} {{ $offer->createdBy?->nom }}</span>
                </div>
            </div>

            <!-- Avantages -->
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h3 class="text-sm font-semibold text-gray-900 mb-4">Avantages ({{ $offer->avantages->count() }})</h3>
                <div class="space-y-3">
                    @foreach($offer->avantages as $avantage)
                        <div class="rounded-xl border border-gray-200 p-4">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium text-gray-900">{{ $avantage->type?->nom }}</span>
                                <span class="text-sm font-bold text-evadia-600">{{ $avantage->valeur }}</span>
                            </div>
                            @if($avantage->quantite_max)
                                <p class="text-xs text-gray-400 mt-1">Max: {{ $avantage->quantite_max }} utilisations</p>
                            @endif
                        </div>
                    @endforeach
                </div>
            </div>
        </div>

        <!-- Utilisations -->
        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Utilisations</h3>
            <div class="space-y-3">
                @forelse($offer->utilisations as $util)
                    <div class="text-sm border-l-2 border-evadia-200 pl-3">
                        <p class="font-medium text-gray-700">{{ $util->client?->prenom }} {{ $util->client?->nom }}</p>
                        <p class="text-xs text-gray-400">{{ $util->date_utilisation?->format('d/m/Y H:i') }}</p>
                        <p class="text-xs text-gray-400">Réservation: {{ $util->reservation?->code_reservation }}</p>
                    </div>
                @empty
                    <p class="text-sm text-gray-400 text-center py-4">Aucune utilisation</p>
                @endforelse
            </div>
        </div>
    </div>
@endsection