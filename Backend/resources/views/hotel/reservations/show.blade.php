@extends('layouts.hotel')

@section('title', 'Réservation ' . $reservation->code_reservation . ' - EVADIA')
@section('page_title', 'Réservation ' . $reservation->code_reservation)

@section('content')
<div class="space-y-6" x-data="{ rejectModal: false }">
    {{-- Header --}}
    <div class="flex items-center justify-between">
        <a href="{{ route('hotel.reservations.index') }}" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Retour aux réservations
        </a>
        <div class="flex gap-2">
            <a href="{{ route('hotel.reservations.messages', $reservation->id) }}"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Messages
            </a>
            @if($reservation->statut === 'en_attente')
                <button @click="rejectModal = true"
                    class="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                    Refuser
                </button>
                <form method="POST" action="{{ route('hotel.reservations.accept', $reservation->id) }}">
                    @csrf
                    @method('PATCH')
                    <button type="submit"
                        class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
                        Accepter
                    </button>
                </form>
            @endif
        </div>
    </div>

    {{-- Status Banner --}}
    @php
        $statusConfig = [
            'en_attente' => ['bg' => 'bg-amber-50 border-amber-200', 'text' => 'text-amber-700', 'label' => 'En attente de confirmation'],
            'acceptee' => ['bg' => 'bg-emerald-50 border-emerald-200', 'text' => 'text-emerald-700', 'label' => 'Confirmée'],
            'refusee' => ['bg' => 'bg-red-50 border-red-200', 'text' => 'text-red-700', 'label' => 'Refusée'],
            'terminee' => ['bg' => 'bg-gray-50 border-gray-200', 'text' => 'text-gray-700', 'label' => 'Terminée'],
            'annulee' => ['bg' => 'bg-red-50 border-red-200', 'text' => 'text-red-700', 'label' => 'Annulée'],
        ];
        $sc = $statusConfig[$reservation->statut] ?? $statusConfig['en_attente'];
    @endphp
    <div class="rounded-xl border {{ $sc['bg'] }} p-4 flex items-center gap-3">
        <span class="text-sm font-semibold {{ $sc['text'] }}">{{ $sc['label'] }}</span>
        @if($reservation->statut === 'refusee' && $reservation->raison_refus)
            <span class="text-sm {{ $sc['text'] }} opacity-75">— {{ $reservation->raison_refus }}</span>
        @endif
        @if($reservation->statut === 'annulee' && $reservation->raison_annulation)
            <span class="text-sm {{ $sc['text'] }} opacity-75">— {{ $reservation->raison_annulation }}</span>
        @endif
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {{-- Main Info --}}
        <div class="lg:col-span-2 space-y-6">
            {{-- Client --}}
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-4">Client</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs text-gray-500">Nom</p>
                        <p class="text-sm font-medium text-gray-900">{{ $reservation->client?->prenom }} {{ $reservation->client?->nom }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Email</p>
                        <p class="text-sm text-gray-700">{{ $reservation->client?->email }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Téléphone</p>
                        <p class="text-sm text-gray-700">{{ $reservation->client?->telephone ?? '-' }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Date de réservation</p>
                        <p class="text-sm text-gray-700">{{ $reservation->date_reservation?->format('d/m/Y H:i') }}</p>
                    </div>
                </div>
            </div>

            {{-- Séjour --}}
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-4">Détails du séjour</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs text-gray-500">Propriété</p>
                        <p class="text-sm font-medium text-gray-900">{{ $reservation->propriete?->nom }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Type</p>
                        <p class="text-sm text-gray-700">{{ ucfirst($reservation->propriete?->type_propriete) }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Arrivée</p>
                        <p class="text-sm font-medium text-gray-900">{{ $reservation->date_debut?->format('d/m/Y') }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Départ</p>
                        <p class="text-sm font-medium text-gray-900">{{ $reservation->date_fin?->format('d/m/Y') }}</p>
                    </div>
                    @if($reservation->date_debut && $reservation->date_fin)
                    <div>
                        <p class="text-xs text-gray-500">Durée</p>
                        <p class="text-sm text-gray-700">{{ $reservation->date_debut->diffInDays($reservation->date_fin) }} nuit(s)</p>
                    </div>
                    @endif
                    <div>
                        <p class="text-xs text-gray-500">Voyageurs</p>
                        <p class="text-sm text-gray-700">
                            {{ $reservation->nb_adultes ?? 0 }} adulte(s)
                            @if($reservation->nb_enfants) , {{ $reservation->nb_enfants }} enfant(s) @endif
                            @if($reservation->nb_bebes) , {{ $reservation->nb_bebes }} bébé(s) @endif
                        </p>
                    </div>
                </div>
                @if($reservation->demande_speciale)
                    <div class="mt-4 pt-4 border-t border-gray-100">
                        <p class="text-xs text-gray-500 mb-1">Demande spéciale</p>
                        <p class="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{{ $reservation->demande_speciale }}</p>
                    </div>
                @endif
            </div>

            {{-- Facture --}}
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-4">Facture</h3>
                @if($reservation->facture)
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-900">{{ $reservation->facture->numero_facture }}</p>
                            <p class="text-xs text-gray-500">Émise le {{ $reservation->facture->date_emission->format('d/m/Y') }}</p>
                        </div>
                        <span class="text-sm font-medium text-gray-900">{{ number_format((float) $reservation->facture->montant_total, 0, ',', ' ') }} {{ $reservation->facture->devise }}</span>
                    </div>
                @else
                    <p class="text-sm text-gray-400 text-center py-4">Aucune facture — générée automatiquement lorsque la réservation est acceptée</p>
                @endif
            </div>
        </div>

        {{-- Sidebar --}}
        <div class="space-y-6">
            {{-- Résumé --}}
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-4">Résumé</h3>
                <div class="space-y-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Prix total</span>
                        <span class="font-bold text-gray-900">{{ number_format($reservation->prix_total ?? 0, 0, ',', ' ') }} {{ $reservation->devise ?? '' }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Code</span>
                        <span class="font-mono text-gray-700">{{ $reservation->code_reservation }}</span>
                    </div>
                </div>
            </div>

            @if($reservation->statut === 'refusee' && $reservation->repondueParUser)
                <div class="bg-red-50 rounded-xl border border-red-200 p-6">
                    <h3 class="text-sm font-semibold text-red-800 mb-2">Refus</h3>
                    <p class="text-sm text-red-700">Refusée par : {{ $reservation->repondueParUser->prenom }} {{ $reservation->repondueParUser->nom }}</p>
                    @if($reservation->raison_refus)
                        <p class="text-sm text-red-600 mt-1">{{ $reservation->raison_refus }}</p>
                    @endif
                </div>
            @endif

            @if($reservation->statut === 'annulee' && $reservation->annuleePar)
                <div class="bg-red-50 rounded-xl border border-red-200 p-6">
                    <h3 class="text-sm font-semibold text-red-800 mb-2">Annulation</h3>
                    <p class="text-sm text-red-700">Annulée par : {{ $reservation->annuleePar->prenom }} {{ $reservation->annuleePar->nom }}</p>
                    @if($reservation->raison_annulation)
                        <p class="text-sm text-red-600 mt-1">{{ $reservation->raison_annulation }}</p>
                    @endif
                </div>
            @endif
        </div>
    </div>

    {{-- Reject Modal --}}
    <div x-show="rejectModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @keydown.escape.window="rejectModal = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" @click.away="rejectModal = false">
            <h3 class="text-lg font-semibold text-red-700 mb-4">Refuser la réservation</h3>
            <form method="POST" action="{{ route('hotel.reservations.reject', $reservation->id) }}">
                @csrf
                @method('PATCH')
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Raison du refus *</label>
                    <textarea name="raison_refus" required rows="3"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500"
                        placeholder="Indiquez la raison du refus..."></textarea>
                </div>
                <div class="flex justify-end gap-3">
                    <button type="button" @click="rejectModal = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Retour</button>
                    <button type="submit" class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Confirmer le refus</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
