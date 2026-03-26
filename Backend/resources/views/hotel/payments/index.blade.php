@extends('layouts.hotel')

@section('title', 'Paiements - EVADIA')
@section('page_title', 'Paiements')

@section('content')
<div class="space-y-6">
    {{-- Stats Cards --}}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-xs text-gray-500 mb-1">Revenus du mois</p>
            <p class="text-2xl font-bold text-gray-900">{{ number_format($stats['total_mois'], 0, ',', ' ') }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ $hotel->devise_principale ?? 'EUR' }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-xs text-gray-500 mb-1">Revenus de l'année</p>
            <p class="text-2xl font-bold text-gray-900">{{ number_format($stats['total_annee'], 0, ',', ' ') }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ $hotel->devise_principale ?? 'EUR' }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-xs text-gray-500 mb-1">Transactions ce mois</p>
            <p class="text-2xl font-bold text-gray-900">{{ $stats['nb_transactions_mois'] }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-xs text-gray-500 mb-1">En attente</p>
            <p class="text-2xl font-bold text-amber-600">{{ number_format($stats['en_attente'], 0, ',', ' ') }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ $hotel->devise_principale ?? 'EUR' }}</p>
        </div>
    </div>

    {{-- Filters --}}
    <div class="bg-white rounded-xl border border-gray-200 p-4">
        <form method="GET" class="flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-[200px]">
                <label class="block text-xs font-medium text-gray-500 mb-1">Rechercher</label>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Transaction ID, code réservation..."
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Statut</label>
                <select name="statut" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    <option value="">Tous</option>
                    @foreach(['completed', 'pending', 'failed', 'refunded'] as $s)
                        <option value="{{ $s }}" {{ request('statut') === $s ? 'selected' : '' }}>{{ ucfirst($s) }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Du</label>
                <input type="date" name="date_debut" value="{{ request('date_debut') }}"
                    class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Au</label>
                <input type="date" name="date_fin" value="{{ request('date_fin') }}"
                    class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
            </div>
            <button type="submit" class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 transition-colors">Filtrer</button>
            @if(request()->hasAny(['search', 'statut', 'date_debut', 'date_fin']))
                <a href="{{ route('hotel.payments.index') }}" class="text-sm text-gray-500 hover:text-gray-700">Réinitialiser</a>
            @endif
            <a href="{{ route('hotel.payments.export', request()->all()) }}"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Export CSV
            </a>
        </form>
    </div>

    {{-- Table --}}
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Transaction</th>
                        <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Réservation</th>
                        <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Propriété</th>
                        <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Montant</th>
                        <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($paiements as $paiement)
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="py-3 px-4 text-gray-600">{{ $paiement->date_paiement?->format('d/m/Y') }}</td>
                            <td class="py-3 px-4 font-mono text-xs text-gray-500">{{ Str::limit($paiement->transaction_id, 16) }}</td>
                            <td class="py-3 px-4 text-gray-600">{{ $paiement->reservation?->code_reservation }}</td>
                            <td class="py-3 px-4 text-gray-600">{{ $paiement->reservation?->client?->prenom }} {{ $paiement->reservation?->client?->nom }}</td>
                            <td class="py-3 px-4 text-gray-600">{{ $paiement->reservation?->propriete?->nom }}</td>
                            <td class="py-3 px-4">
                                @php
                                    $payStatusColors = ['completed' => 'bg-emerald-50 text-emerald-700', 'pending' => 'bg-amber-50 text-amber-700', 'failed' => 'bg-red-50 text-red-700', 'refunded' => 'bg-blue-50 text-blue-700'];
                                @endphp
                                <span class="px-2.5 py-1 rounded-full text-xs font-medium {{ $payStatusColors[$paiement->statut] ?? 'bg-gray-100 text-gray-700' }}">{{ ucfirst($paiement->statut) }}</span>
                            </td>
                            <td class="py-3 px-4 text-right font-semibold text-gray-900">{{ number_format($paiement->montant, 0, ',', ' ') }} {{ $paiement->devise_montant }}</td>
                            <td class="py-3 px-4 text-right">
                                <a href="{{ route('hotel.payments.show', $paiement->id) }}" class="text-hotel-600 hover:text-hotel-700 text-sm font-medium">Détail</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="py-12 text-center text-sm text-gray-400">Aucun paiement trouvé</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    {{ $paiements->links() }}
</div>
@endsection
