@extends('layouts.hotel')

@section('title', 'Paiement - EVADIA')
@section('page_title', 'Détail du paiement')

@section('content')
<div class="space-y-6">
    {{-- Header --}}
    <a href="{{ route('hotel.payments.index') }}" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Retour aux paiements
    </a>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {{-- Paiement Details --}}
        <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-4">Informations du paiement</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs text-gray-500">Montant</p>
                        <p class="text-2xl font-bold text-gray-900">{{ number_format($paiement->montant, 2, ',', ' ') }} <span class="text-sm font-normal text-gray-500">{{ $paiement->devise_montant }}</span></p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Statut</p>
                        @php
                            $payStatusColors = ['completed' => 'bg-emerald-50 text-emerald-700', 'pending' => 'bg-amber-50 text-amber-700', 'failed' => 'bg-red-50 text-red-700', 'refunded' => 'bg-blue-50 text-blue-700'];
                        @endphp
                        <span class="inline-flex mt-1 px-3 py-1 rounded-full text-sm font-medium {{ $payStatusColors[$paiement->statut] ?? 'bg-gray-100 text-gray-700' }}">{{ ucfirst($paiement->statut) }}</span>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Transaction ID</p>
                        <p class="text-sm font-mono text-gray-700">{{ $paiement->transaction_id }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Date du paiement</p>
                        <p class="text-sm text-gray-700">{{ $paiement->date_paiement?->format('d/m/Y H:i') }}</p>
                    </div>
                    @if($paiement->methodePaiement)
                    <div>
                        <p class="text-xs text-gray-500">Méthode de paiement</p>
                        <p class="text-sm text-gray-700">{{ $paiement->methodePaiement->nom ?? '-' }}</p>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        {{-- Reservation Sidebar --}}
        <div class="space-y-6">
            @if($paiement->reservation)
                <div class="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 class="text-sm font-semibold text-gray-900 mb-4">Réservation associée</h3>
                    <div class="space-y-3">
                        <div>
                            <p class="text-xs text-gray-500">Code</p>
                            <a href="{{ route('hotel.reservations.show', $paiement->reservation->id) }}" class="text-sm font-medium text-hotel-600 hover:underline">{{ $paiement->reservation->code_reservation }}</a>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">Client</p>
                            <p class="text-sm text-gray-700">{{ $paiement->reservation->client?->prenom }} {{ $paiement->reservation->client?->nom }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">Propriété</p>
                            <p class="text-sm text-gray-700">{{ $paiement->reservation->propriete?->nom }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">Séjour</p>
                            <p class="text-sm text-gray-700">{{ $paiement->reservation->date_debut?->format('d/m/Y') }} - {{ $paiement->reservation->date_fin?->format('d/m/Y') }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">Prix total</p>
                            <p class="text-sm font-semibold text-gray-900">{{ number_format($paiement->reservation->prix_total ?? 0, 0, ',', ' ') }} {{ $paiement->reservation->devise ?? '' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">Statut réservation</p>
                            @php
                                $resStatusColors = ['draft' => 'bg-gray-100 text-gray-700', 'pending' => 'bg-amber-50 text-amber-700', 'paid' => 'bg-emerald-50 text-emerald-700', 'cancelled' => 'bg-red-50 text-red-700'];
                            @endphp
                            <span class="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium {{ $resStatusColors[$paiement->reservation->statut] ?? 'bg-gray-100 text-gray-700' }}">{{ ucfirst($paiement->reservation->statut) }}</span>
                        </div>
                    </div>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
