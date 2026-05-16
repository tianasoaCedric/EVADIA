@extends('layouts.hotel')

@section('title', 'Prix - EVADIA')
@section('page_title', 'Gestion des prix')

@section('content')
<div class="space-y-6" x-data="{ priceModal: false, selectedPropriete: null, selectedMga: '', selectedEur: '' }">
    {{-- Header --}}
    <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500">Gérez les prix de vos propriétés</p>
        <a href="{{ route('hotel.offers.index') }}" class="rounded-lg border border-hotel-300 px-4 py-2 text-sm font-medium text-hotel-700 hover:bg-hotel-50 transition-colors">
            Gérer les offres
        </a>
    </div>

    {{-- Pricing Table --}}
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="min-w-full text-sm">
            <thead class="bg-gray-50">
                <tr>
                    <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Propriété</th>
                    <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Prix actuel / nuit (MGA)</th>
                    <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">EUR</th>
                    <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Depuis le</th>
                    <th class="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Historique</th>
                    <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase" colspan="2">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                @forelse($proprietes as $propriete)
                    <tr class="hover:bg-gray-50 transition-colors" x-data="{ showHistory: false }">
                        <td class="py-3 px-4 font-medium text-gray-900">{{ $propriete->nom }}</td>
                        <td class="py-3 px-4 text-gray-600">{{ ucfirst($propriete->type_propriete) }}</td>
                        <td class="py-3 px-4 text-right">
                            @if($propriete->currentPrix)
                                <span class="text-lg font-bold text-gray-900">{{ number_format($propriete->currentPrix->prix_mga, 0, ',', ' ') }}</span>
                                <span class="text-xs text-gray-500">Ar</span>
                            @else
                                <span class="text-gray-400">Non défini</span>
                            @endif
                        </td>
                        <td class="py-3 px-4 text-right">
                            @if($propriete->currentPrix?->prix_eur)
                                <span class="font-medium text-gray-700">{{ number_format($propriete->currentPrix->prix_eur, 2, ',', ' ') }}</span>
                                <span class="text-xs text-gray-500">€</span>
                            @else
                                <span class="text-xs text-gray-400">—</span>
                            @endif
                        </td>
                        <td class="py-3 px-4 text-gray-500 text-xs">{{ $propriete->currentPrix?->date_debut?->format('d/m/Y') }}</td>
                        <td class="py-3 px-4 text-center">
                            @if($propriete->prix->count() > 1)
                                <button @click="showHistory = !showHistory" class="text-hotel-600 hover:text-hotel-700 text-xs font-medium">
                                    <span x-text="showHistory ? 'Masquer' : 'Voir'"></span> ({{ $propriete->prix->count() }})
                                </button>
                            @else
                                <span class="text-xs text-gray-400">-</span>
                            @endif
                        </td>
                        <td class="py-3 px-4 text-right" colspan="2">
                            <button @click="selectedPropriete = {{ $propriete->id }}; selectedMga = '{{ $propriete->currentPrix?->prix_mga ?? '' }}'; selectedEur = '{{ $propriete->currentPrix?->prix_eur ?? '' }}'; priceModal = true"
                                class="text-hotel-600 hover:text-hotel-700 text-sm font-medium">Modifier</button>
                        </td>
                    </tr>
                    {{-- Price History (expandable) --}}
                    @if($propriete->prix->count() > 1)
                        <tr x-show="showHistory" x-cloak>
                            <td colspan="6" class="px-4 py-3 bg-gray-50/50">
                                <div class="space-y-2 pl-4 border-l-2 border-hotel-200">
                                    @foreach($propriete->prix->skip(1) as $prix)
                                        <div class="flex items-center gap-4 text-xs">
                                            <span class="text-gray-500">{{ $prix->date_debut?->format('d/m/Y') }} - {{ $prix->date_fin?->format('d/m/Y') ?? 'actuel' }}</span>
                                            <span class="font-medium text-gray-700">{{ number_format($prix->prix_mga, 0, ',', ' ') }} Ar</span>
                                            @if($prix->prix_eur)
                                                <span class="text-gray-500">/ {{ number_format($prix->prix_eur, 2, ',', ' ') }} €</span>
                                            @endif
                                            @if($prix->raison)
                                                <span class="text-gray-400">· {{ $prix->raison }}</span>
                                            @endif
                                        </div>
                                    @endforeach
                                </div>
                            </td>
                        </tr>
                    @endif
                @empty
                    <tr>
                        <td colspan="6" class="py-12 text-center text-sm text-gray-400">Aucune propriété</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- Price Update Modal --}}
    <div x-show="priceModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @keydown.escape.window="priceModal = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" @click.away="priceModal = false">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Modifier le prix</h3>
            <form method="POST" :action="'{{ url('hotel/pricing') }}/' + selectedPropriete + '/price'">
                @csrf
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Prix / nuit en Ariary (MGA) *</label>
                        <div class="relative">
                            <input type="number" name="prix_mga" x-model="selectedMga" step="1" min="0" required
                                class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Ar</span>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Prix / nuit en Euros (EUR) *</label>
                        <div class="relative">
                            <input type="number" name="prix_eur" x-model="selectedEur" step="0.01" min="0" required
                                class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Raison du changement</label>
                        <input type="text" name="raison" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500" placeholder="Ex: Haute saison, promotion...">
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" @click="priceModal = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Annuler</button>
                    <button type="submit" class="rounded-lg bg-hotel-600 px-4 py-2 text-sm font-medium text-white hover:bg-hotel-700">Enregistrer</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
