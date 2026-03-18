@extends('layouts.hotel')

@section('title', $propriete->nom . ' - EVADIA')
@section('page_title', $propriete->nom)

@section('content')
<div class="space-y-6" x-data="{ statusModal: false, activeTab: 'infos' }">
    {{-- Header --}}
    <div class="flex items-center justify-between">
        <a href="{{ route('hotel.rooms.index') }}" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Retour aux chambres
        </a>
        <div class="flex gap-2">
            <button @click="statusModal = true"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Changer le statut
            </button>
            <a href="{{ route('hotel.rooms.edit', $propriete->id) }}"
                class="rounded-lg bg-hotel-600 px-4 py-2 text-sm font-medium text-white hover:bg-hotel-700 transition-colors">
                Modifier
            </a>
        </div>
    </div>

    {{-- Stats Cards --}}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-xs text-gray-500 mb-1">Réservations</p>
            <p class="text-2xl font-bold text-gray-900">{{ $stats['total_reservations'] }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-xs text-gray-500 mb-1">Revenu total</p>
            <p class="text-2xl font-bold text-gray-900">{{ number_format($stats['revenu_total'], 0, ',', ' ') }} <span class="text-sm font-normal text-gray-500">{{ $hotel->devise_principale ?? 'EUR' }}</span></p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-xs text-gray-500 mb-1">Note moyenne</p>
            <p class="text-2xl font-bold text-gray-900">{{ $stats['note_moyenne'] ? number_format($stats['note_moyenne'], 1) : 'N/A' }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <p class="text-xs text-gray-500 mb-1">Taux d'occupation (30j)</p>
            <p class="text-2xl font-bold text-gray-900">{{ $stats['taux_occupation'] }}%</p>
        </div>
    </div>

    {{-- Main Content --}}
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {{-- Tabs --}}
        <div class="border-b border-gray-200 px-6">
            <nav class="flex gap-6 -mb-px">
                <button @click="activeTab = 'infos'" :class="activeTab === 'infos' ? 'border-hotel-600 text-hotel-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="py-3 border-b-2 text-sm font-medium transition-colors">Informations</button>
                <button @click="activeTab = 'photos'" :class="activeTab === 'photos' ? 'border-hotel-600 text-hotel-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="py-3 border-b-2 text-sm font-medium transition-colors">Photos ({{ $propriete->photos->count() }})</button>
                <button @click="activeTab = 'equipements'" :class="activeTab === 'equipements' ? 'border-hotel-600 text-hotel-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="py-3 border-b-2 text-sm font-medium transition-colors">Équipements ({{ $propriete->equipements->count() }})</button>
                <button @click="activeTab = 'reservations'" :class="activeTab === 'reservations' ? 'border-hotel-600 text-hotel-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="py-3 border-b-2 text-sm font-medium transition-colors">Réservations ({{ $propriete->reservations->count() }})</button>
                <button @click="activeTab = 'historique'" :class="activeTab === 'historique' ? 'border-hotel-600 text-hotel-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="py-3 border-b-2 text-sm font-medium transition-colors">Historique</button>
            </nav>
        </div>

        {{-- Tab: Infos --}}
        <div x-show="activeTab === 'infos'" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <div>
                        <p class="text-xs text-gray-500">Type</p>
                        <p class="text-sm font-medium text-gray-900">{{ ucfirst($propriete->type_propriete) }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Capacité</p>
                        <p class="text-sm font-medium text-gray-900">{{ $propriete->capacite }} personne(s)</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Chambres / Lits / Salles de bain</p>
                        <p class="text-sm font-medium text-gray-900">{{ $propriete->nb_chambres ?? '-' }} / {{ $propriete->nb_lits ?? '-' }} / {{ $propriete->nb_salles_bain ?? '-' }}</p>
                    </div>
                    @if($propriete->superficie)
                    <div>
                        <p class="text-xs text-gray-500">Superficie</p>
                        <p class="text-sm font-medium text-gray-900">{{ $propriete->superficie }} m²</p>
                    </div>
                    @endif
                </div>
                <div class="space-y-4">
                    <div>
                        <p class="text-xs text-gray-500">Statut actuel</p>
                        @if($propriete->currentStatut)
                            @php
                                $statusColors = ['disponible' => 'bg-emerald-50 text-emerald-700', 'indisponible' => 'bg-red-50 text-red-700', 'maintenance' => 'bg-amber-50 text-amber-700', 'hors_service' => 'bg-gray-100 text-gray-700'];
                            @endphp
                            <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium {{ $statusColors[$propriete->currentStatut->statut] ?? 'bg-gray-100 text-gray-700' }}">
                                {{ ucfirst(str_replace('_', ' ', $propriete->currentStatut->statut)) }}
                            </span>
                        @endif
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Prix actuel</p>
                        @if($propriete->currentPrix)
                            <p class="text-lg font-bold text-gray-900">{{ number_format($propriete->currentPrix->prix, 0, ',', ' ') }} {{ $propriete->currentPrix->devise }}<span class="text-sm font-normal text-gray-500">/nuit</span></p>
                        @else
                            <p class="text-sm text-gray-400">Non défini</p>
                        @endif
                    </div>
                    @if($propriete->description)
                    <div>
                        <p class="text-xs text-gray-500">Description</p>
                        <p class="text-sm text-gray-700">{{ $propriete->description }}</p>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        {{-- Tab: Photos --}}
        <div x-show="activeTab === 'photos'" x-cloak class="p-6">
            @if($propriete->photos->count())
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    @foreach($propriete->photos->sortBy('ordre') as $photo)
                        <div class="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                            <img src="{{ Storage::disk('s3')->url($photo->url_photo) }}" class="h-full w-full object-cover">
                            @if($photo->est_principale)
                                <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-hotel-600 text-white text-xs font-medium">Principale</span>
                            @endif
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-center text-sm text-gray-400 py-8">Aucune photo</p>
            @endif
        </div>

        {{-- Tab: Equipements --}}
        <div x-show="activeTab === 'equipements'" x-cloak class="p-6">
            @if($propriete->equipements->count())
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    @foreach($propriete->equipements as $eq)
                        <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-sm">
                            <svg class="h-4 w-4 text-hotel-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            <span class="text-gray-700">{{ $eq->nom }}</span>
                            @if($eq->pivot->quantite > 1)
                                <span class="text-xs text-gray-400">x{{ $eq->pivot->quantite }}</span>
                            @endif
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-center text-sm text-gray-400 py-8">Aucun équipement</p>
            @endif
        </div>

        {{-- Tab: Reservations --}}
        <div x-show="activeTab === 'reservations'" x-cloak class="p-6">
            @if($propriete->reservations->count())
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-100">
                                <th class="text-left py-2 px-3 text-xs font-medium text-gray-500">Code</th>
                                <th class="text-left py-2 px-3 text-xs font-medium text-gray-500">Client</th>
                                <th class="text-left py-2 px-3 text-xs font-medium text-gray-500">Dates</th>
                                <th class="text-left py-2 px-3 text-xs font-medium text-gray-500">Statut</th>
                                <th class="text-right py-2 px-3 text-xs font-medium text-gray-500">Montant</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            @foreach($propriete->reservations->sortByDesc('date_reservation') as $reservation)
                                <tr class="hover:bg-gray-50">
                                    <td class="py-2.5 px-3 font-medium text-gray-900">
                                        <a href="{{ route('hotel.reservations.show', $reservation->id) }}" class="text-hotel-600 hover:underline">{{ $reservation->code_reservation }}</a>
                                    </td>
                                    <td class="py-2.5 px-3 text-gray-600">{{ $reservation->client?->prenom }} {{ $reservation->client?->nom }}</td>
                                    <td class="py-2.5 px-3 text-gray-600">{{ $reservation->date_debut?->format('d/m/Y') }} - {{ $reservation->date_fin?->format('d/m/Y') }}</td>
                                    <td class="py-2.5 px-3">
                                        @php
                                            $resStatusColors = ['draft' => 'bg-gray-100 text-gray-700', 'pending' => 'bg-amber-50 text-amber-700', 'paid' => 'bg-emerald-50 text-emerald-700', 'cancelled' => 'bg-red-50 text-red-700'];
                                        @endphp
                                        <span class="px-2 py-0.5 rounded-full text-xs font-medium {{ $resStatusColors[$reservation->statut] ?? 'bg-gray-100 text-gray-700' }}">{{ ucfirst($reservation->statut) }}</span>
                                    </td>
                                    <td class="py-2.5 px-3 text-right font-medium text-gray-900">{{ number_format($reservation->prix_total ?? 0, 0, ',', ' ') }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @else
                <p class="text-center text-sm text-gray-400 py-8">Aucune réservation</p>
            @endif
        </div>

        {{-- Tab: Historique --}}
        <div x-show="activeTab === 'historique'" x-cloak class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {{-- Historique statuts --}}
                <div>
                    <h4 class="text-sm font-semibold text-gray-900 mb-3">Historique des statuts</h4>
                    <div class="space-y-3">
                        @forelse($propriete->statuts->sortByDesc('date_debut') as $statut)
                            <div class="flex items-start gap-3 text-sm">
                                <div class="h-2 w-2 rounded-full mt-1.5 {{ $statut->statut === 'disponible' ? 'bg-emerald-500' : ($statut->statut === 'indisponible' ? 'bg-red-500' : 'bg-amber-500') }}"></div>
                                <div>
                                    <p class="font-medium text-gray-900">{{ ucfirst(str_replace('_', ' ', $statut->statut)) }}</p>
                                    <p class="text-xs text-gray-500">{{ $statut->date_debut?->format('d/m/Y H:i') }} {{ $statut->changedBy ? '- ' . $statut->changedBy->prenom . ' ' . $statut->changedBy->nom : '' }}</p>
                                    @if($statut->raison) <p class="text-xs text-gray-400 mt-0.5">{{ $statut->raison }}</p> @endif
                                </div>
                            </div>
                        @empty
                            <p class="text-sm text-gray-400">Aucun historique</p>
                        @endforelse
                    </div>
                </div>

                {{-- Historique prix --}}
                <div>
                    <h4 class="text-sm font-semibold text-gray-900 mb-3">Historique des prix</h4>
                    <div class="space-y-3">
                        @forelse($propriete->prix->sortByDesc('date_debut') as $prix)
                            <div class="flex items-start gap-3 text-sm">
                                <div class="h-2 w-2 rounded-full mt-1.5 bg-hotel-500"></div>
                                <div>
                                    <p class="font-medium text-gray-900">{{ number_format($prix->prix, 0, ',', ' ') }} {{ $prix->devise }}/nuit</p>
                                    <p class="text-xs text-gray-500">{{ $prix->date_debut?->format('d/m/Y H:i') }} {{ $prix->changedBy ? '- ' . $prix->changedBy->prenom . ' ' . $prix->changedBy->nom : '' }}</p>
                                    @if($prix->raison) <p class="text-xs text-gray-400 mt-0.5">{{ $prix->raison }}</p> @endif
                                </div>
                            </div>
                        @empty
                            <p class="text-sm text-gray-400">Aucun historique</p>
                        @endforelse
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Status Change Modal --}}
    <div x-show="statusModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @keydown.escape.window="statusModal = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" @click.away="statusModal = false">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Changer le statut</h3>
            <form method="POST" action="{{ route('hotel.rooms.update-status', $propriete->id) }}">
                @csrf
                @method('PATCH')
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau statut</label>
                        <select name="statut" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                            @foreach(['disponible', 'indisponible', 'maintenance', 'hors_service'] as $s)
                                <option value="{{ $s }}" {{ $propriete->currentStatut?->statut === $s ? 'selected' : '' }}>{{ ucfirst(str_replace('_', ' ', $s)) }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Raison (optionnel)</label>
                        <input type="text" name="raison" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500" placeholder="Raison du changement...">
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" @click="statusModal = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Annuler</button>
                    <button type="submit" class="rounded-lg bg-hotel-600 px-4 py-2 text-sm font-medium text-white hover:bg-hotel-700">Confirmer</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
