@extends('layouts.hotel')

@section('title', 'Chambres - EVADIA')
@section('page_title', 'Chambres')

@section('content')
<div class="space-y-6">
    {{-- Header --}}
    <div class="flex items-center justify-between">
        <div>
            <p class="text-sm text-gray-500">{{ $proprietes->total() }} chambre(s) au total</p>
        </div>
        <a href="{{ route('hotel.rooms.create') }}"
            class="rounded-lg bg-gradient-to-r from-hotel-600 to-hotel-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-hotel-700 hover:to-hotel-800 transition-all flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouvelle chambre
        </a>
    </div>

    {{-- Filters --}}
    <div class="bg-white rounded-xl border border-gray-200 p-4">
        <form method="GET" class="flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-[200px]">
                <label class="block text-xs font-medium text-gray-500 mb-1">Rechercher</label>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Nom de la chambre..."
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Type</label>
                <select name="type" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    <option value="">Tous</option>
                    @foreach(['chambre','suite','villa','appartement','bungalow','studio'] as $t)
                        <option value="{{ $t }}" {{ request('type') === $t ? 'selected' : '' }}>{{ ucfirst($t) }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Statut</label>
                <select name="statut" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    <option value="">Tous</option>
                    @foreach(['disponible','indisponible','maintenance','hors_service'] as $s)
                        <option value="{{ $s }}" {{ request('statut') === $s ? 'selected' : '' }}>{{ ucfirst(str_replace('_', ' ', $s)) }}</option>
                    @endforeach
                </select>
            </div>
            <button type="submit" class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 transition-colors">Filtrer</button>
            @if(request()->hasAny(['search', 'type', 'statut']))
                <a href="{{ route('hotel.rooms.index') }}" class="text-sm text-gray-500 hover:text-gray-700">Réinitialiser</a>
            @endif
        </form>
    </div>

    {{-- Grid --}}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @forelse($proprietes as $propriete)
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                {{-- Photo --}}
                <div class="h-48 bg-gray-100 relative overflow-hidden">
                    @if($propriete->photos->where('est_principale', true)->first())
                        <img src="{{ $propriete->photos->where('est_principale', true)->first()->url }}"
                            class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300">
                    @elseif($propriete->photos->first())
                        <img src="{{ $propriete->photos->first()->url }}"
                            class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300">
                    @else
                        <div class="h-full w-full flex items-center justify-center text-gray-300">
                            <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 18.75h.008v.008H18v-.008zm-6 0h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                    @endif

                    {{-- Status badge --}}
                    @if($propriete->currentStatut)
                        @php
                            $statusColors = [
                                'disponible' => 'bg-emerald-500',
                                'indisponible' => 'bg-red-500',
                                'maintenance' => 'bg-amber-500',
                                'hors_service' => 'bg-gray-500',
                            ];
                        @endphp
                        <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium text-white {{ $statusColors[$propriete->currentStatut->statut] ?? 'bg-gray-500' }}">
                            {{ ucfirst(str_replace('_', ' ', $propriete->currentStatut->statut)) }}
                        </span>
                    @endif
                </div>

                {{-- Info --}}
                <div class="p-4">
                    <div class="flex items-start justify-between mb-2">
                        <h3 class="font-semibold text-gray-900">{{ $propriete->nom }}</h3>
                        <span class="px-2 py-0.5 rounded-full bg-hotel-50 text-hotel-700 text-xs font-medium">{{ ucfirst($propriete->type_propriete) }}</span>
                    </div>

                    <div class="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span>{{ $propriete->capacite }} pers.</span>
                        @if($propriete->nb_chambres) <span>{{ $propriete->nb_chambres }} ch.</span> @endif
                        @if($propriete->superficie) <span>{{ $propriete->superficie }} m²</span> @endif
                    </div>

                    @if($propriete->currentPrix)
                        <p class="text-lg font-bold text-gray-900">
                            {{ number_format($propriete->currentPrix->prix, 0, ',', ' ') }}
                            <span class="text-sm font-normal text-gray-500">{{ $propriete->currentPrix->devise }}/nuit</span>
                        </p>
                    @endif

                    <div class="flex gap-2 mt-4">
                        <a href="{{ route('hotel.rooms.show', $propriete->id) }}"
                            class="flex-1 text-center rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">Voir</a>
                        <a href="{{ route('hotel.rooms.edit', $propriete->id) }}"
                            class="flex-1 text-center rounded-lg bg-hotel-600 px-3 py-2 text-xs font-medium text-white hover:bg-hotel-700 transition-colors">Modifier</a>
                    </div>
                </div>
            </div>
        @empty
            <div class="col-span-3 py-16 text-center">
                <svg class="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                </svg>
                <p class="text-gray-500 mb-4">Aucune chambre trouvée</p>
                <a href="{{ route('hotel.rooms.create') }}" class="text-hotel-600 font-medium hover:text-hotel-700">Créer votre première chambre</a>
            </div>
        @endforelse
    </div>

    {{ $proprietes->links() }}
</div>
@endsection
