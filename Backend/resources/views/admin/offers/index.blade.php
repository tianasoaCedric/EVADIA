@extends('layouts.admin')
@section('title', 'Offres - EVADIA Admin')
@section('page_title', 'Offres & Promotions')

@section('content')
    <div class="flex items-center justify-between mb-6">
        <form method="GET" action="{{ route('admin.offers.index') }}" class="flex items-end gap-3">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Rechercher une offre..."
                class="w-56 rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
            <select name="statut"
                class="rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                <option value="">Tous statuts</option>
                <option value="active" {{ request('statut') === 'active' ? 'selected' : '' }}>Active</option>
                <option value="inactive" {{ request('statut') === 'inactive' ? 'selected' : '' }}>Inactive</option>
                <option value="brouillon" {{ request('statut') === 'brouillon' ? 'selected' : '' }}>Brouillon</option>
            </select>
            <select name="periode"
                class="rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                <option value="">Toutes périodes</option>
                <option value="en_cours" {{ request('periode') === 'en_cours' ? 'selected' : '' }}>En cours</option>
                <option value="a_venir" {{ request('periode') === 'a_venir' ? 'selected' : '' }}>À venir</option>
                <option value="terminee" {{ request('periode') === 'terminee' ? 'selected' : '' }}>Terminée</option>
            </select>
            <button type="submit"
                class="rounded-xl bg-evadia-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-evadia-700">Filtrer</button>
        </form>
        <a href="{{ route('admin.offers.create') }}"
            class="rounded-xl bg-evadia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouvelle offre
        </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        @forelse($offres as $offre)
            @php
                $now = now();
                $isEnCours = $offre->date_debut <= $now && $offre->date_fin >= $now;
                $isAVenir = $offre->date_debut > $now;
            @endphp
            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden hover:shadow-md transition-all">
                <div class="p-5">
                    <div class="flex items-start justify-between">
                        <div>
                            <h3 class="text-sm font-semibold text-gray-900">{{ $offre->titre }}</h3>
                            @if($offre->code_promo)
                                <span
                                    class="mt-1 inline-block rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-mono font-medium text-amber-700">{{ $offre->code_promo }}</span>
                            @endif
                        </div>
                        <span
                            class="rounded-full px-2.5 py-0.5 text-xs font-medium
                                    {{ $offre->statut === 'active' ? 'bg-emerald-50 text-emerald-700' : ($offre->statut === 'brouillon' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-700') }}">
                            {{ ucfirst($offre->statut) }}
                        </span>
                    </div>
                    @if($offre->description)
                        <p class="mt-2 text-xs text-gray-500 line-clamp-2">{{ $offre->description }}</p>
                    @endif
                    <div class="mt-3 flex items-center gap-4 text-xs text-gray-400">
                        <span class="inline-flex items-center gap-1">
                            <svg class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                            {{ $offre->date_debut?->format('d/m') }} &rarr; {{ $offre->date_fin?->format('d/m/Y') }}
                        </span>
                        <span
                            class="{{ $isEnCours ? 'text-emerald-600 font-medium' : ($isAVenir ? 'text-blue-600' : 'text-gray-400') }}">
                            {{ $isEnCours ? '● En cours' : ($isAVenir ? '○ À venir' : '○ Terminée') }}
                        </span>
                    </div>
                    <div class="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                        <span class="text-xs text-gray-400">{{ $offre->utilisations_count ?? 0 }} utilisation(s)</span>
                        <div class="flex gap-1">
                            <a href="{{ route('admin.offers.show', $offre) }}"
                                class="rounded-lg p-1.5 text-gray-400 hover:text-evadia-600 hover:bg-evadia-50 transition-colors">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </a>
                            <a href="{{ route('admin.offers.edit', $offre) }}"
                                class="rounded-lg p-1.5 text-gray-400 hover:text-evadia-600 hover:bg-evadia-50 transition-colors">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                            </a>
                            <form method="POST" action="{{ route('admin.offers.toggle', $offre) }}" class="inline">
                                @csrf @method('PATCH')
                                <button type="submit"
                                    class="rounded-lg p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                    title="Toggle">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        @empty
            <div class="col-span-full text-center py-16">
                <p class="text-sm text-gray-400">Aucune offre trouvée</p>
            </div>
        @endforelse
    </div>

    <div class="mt-6">{{ $offres->links() }}</div>
@endsection