@extends('layouts.admin')
@section('title', 'Hôtels - EVADIA Admin')
@section('page_title', 'Hôtels')

@section('content')
    <!-- Actions Bar -->
    <div class="flex items-center justify-between mb-6">
        <div class="flex-1">
            <form method="GET" action="{{ route('admin.hotels.index') }}" class="flex flex-wrap items-end gap-3">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Rechercher un hôtel..."
                    class="w-64 rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                <select name="statut"
                    class="rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    <option value="">Tous les statuts</option>
                    <option value="actif" {{ request('statut') === 'actif' ? 'selected' : '' }}>Actif</option>
                    <option value="en_attente" {{ request('statut') === 'en_attente' ? 'selected' : '' }}>En attente</option>
                    <option value="suspendu" {{ request('statut') === 'suspendu' ? 'selected' : '' }}>Suspendu</option>
                    <option value="ferme" {{ request('statut') === 'ferme' ? 'selected' : '' }}>Fermé</option>
                </select>
                <select name="etoiles"
                    class="rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    <option value="">Étoiles</option>
                    @for($i = 1; $i <= 5; $i++)
                        <option value="{{ $i }}" {{ request('etoiles') == $i ? 'selected' : '' }}>{{ $i }} ★</option>
                    @endfor
                </select>
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-evadia-700 transition-colors">Filtrer</button>
            </form>
        </div>
        <a href="{{ route('admin.hotels.create') }}"
            class="rounded-xl bg-evadia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 transition-colors flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouvel hôtel
        </a>
    </div>

    <!-- Hotels Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        @forelse($hotels as $hotel)
            <div
                class="group rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden hover:shadow-md transition-all">
                <!-- Photo -->
                <div class="h-40 bg-gradient-to-br from-evadia-100 to-evadia-200 relative overflow-hidden">
                    @if($hotel->photos->first())
                        <img src="{{ $hotel->photos->first()->url }}" alt="{{ $hotel->nom }}"
                            class="h-full w-full object-cover">
                    @else
                        <div class="flex items-center justify-center h-full">
                            <svg class="h-12 w-12 text-evadia-300" fill="none" viewBox="0 0 24 24" stroke-width="1"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25v12A2.25 2.25 0 005.25 21z" />
                            </svg>
                        </div>
                    @endif
                    <!-- Status Badge -->
                    @if($hotel->currentStatut)
                        <span
                            class="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm
                                        {{ $hotel->currentStatut->statut === 'actif' ? 'bg-emerald-500/90 text-white' : ($hotel->currentStatut->statut === 'suspendu' ? 'bg-amber-500/90 text-white' : 'bg-gray-500/90 text-white') }}">
                            {{ ucfirst($hotel->currentStatut->statut) }}
                        </span>
                    @endif
                </div>

                <!-- Info -->
                <div class="p-4">
                    <div class="flex items-start justify-between">
                        <div>
                            <h3 class="text-sm font-semibold text-gray-900">{{ $hotel->nom }}</h3>
                            <p class="text-xs text-gray-500 mt-0.5">{{ $hotel->adresse?->ville }}, {{ $hotel->adresse?->pays }}
                            </p>
                        </div>
                        @if($hotel->etoiles)
                            <span class="text-xs text-amber-500">{{ str_repeat('★', $hotel->etoiles) }}</span>
                        @endif
                    </div>

                    <!-- Types -->
                    <div class="flex flex-wrap gap-1 mt-3">
                        @foreach($hotel->types->take(3) as $type)
                            <span
                                class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">{{ $type->nom }}</span>
                        @endforeach
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <span class="text-xs text-gray-400">{{ $hotel->date_creation?->format('d/m/Y') }}</span>
                        <div class="flex items-center gap-1">
                            <a href="{{ route('admin.hotels.show', $hotel) }}"
                                class="rounded-lg p-1.5 text-gray-400 hover:text-evadia-600 hover:bg-evadia-50 transition-colors">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </a>
                            <a href="{{ route('admin.hotels.edit', $hotel) }}"
                                class="rounded-lg p-1.5 text-gray-400 hover:text-evadia-600 hover:bg-evadia-50 transition-colors">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        @empty
            <div class="col-span-full text-center py-16">
                <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke-width="1"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0-.75 3.75m0 0-.75 3.75M17.25 7.5l-.75 3.75" />
                </svg>
                <p class="mt-2 text-sm text-gray-500">Aucun hôtel trouvé</p>
                <a href="{{ route('admin.hotels.create') }}"
                    class="mt-3 inline-block text-sm font-medium text-evadia-600 hover:text-evadia-700">Créer le premier hôtel
                    →</a>
            </div>
        @endforelse
    </div>

    <!-- Pagination -->
    <div class="mt-6">{{ $hotels->links() }}</div>
@endsection