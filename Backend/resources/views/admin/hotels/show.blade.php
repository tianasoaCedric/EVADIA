@extends('layouts.admin')
@section('title', $hotel->nom . ' - EVADIA Admin')
@section('page_title', $hotel->nom)

@section('content')
    <div class="mb-6 flex items-center justify-between">
        <a href="{{ route('admin.hotels.index') }}" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">← Retour à la liste</a>
        <a href="{{ route('admin.hotels.edit', $hotel) }}" class="rounded-xl bg-evadia-600 px-4 py-2 text-sm font-medium text-white hover:bg-evadia-700 transition-colors">Modifier</a>
    </div>

    <!-- Header Card -->
    <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 mb-6">
        <div class="flex items-start gap-5">
            <div class="h-20 w-20 rounded-2xl bg-gradient-to-br from-evadia-100 to-evadia-200 overflow-hidden shrink-0">
                @if($hotel->photos->first())
                    <img src="{{ $hotel->photos->first()->url }}" class="h-full w-full object-cover">
                @endif
            </div>
            <div class="flex-1">
                <div class="flex items-center gap-3">
                    <h2 class="text-xl font-bold text-gray-900">{{ $hotel->nom }}</h2>
                    @if($hotel->etoiles)
                        <span class="text-amber-500">{{ str_repeat('★', $hotel->etoiles) }}</span>
                    @endif
                    @if($hotel->currentStatut)
                        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium
                            {{ $hotel->currentStatut->statut === 'actif' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700' }}">
                            {{ ucfirst($hotel->currentStatut->statut) }}
                        </span>
                    @endif
                </div>
                <p class="text-sm text-gray-500 mt-1">{{ $hotel->adresse?->adresse_ligne1 }}, {{ $hotel->adresse?->ville }}, {{ $hotel->adresse?->pays }}</p>
                <div class="flex items-center gap-6 mt-3 text-sm">
                    <span class="inline-flex items-center gap-1.5 text-gray-500">
                        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                        {{ $hotel->email_contact ?? '—' }}
                    </span>
                    <span class="inline-flex items-center gap-1.5 text-gray-500">
                        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                        {{ $hotel->telephone ?? '—' }}
                    </span>
                    <span class="inline-flex items-center gap-1.5 text-gray-500">
                        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                        {{ $hotel->site_web ?? '—' }}
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 text-center">
            <p class="text-2xl font-bold text-gray-900">{{ $hotel->proprietes->count() }}</p>
            <p class="text-xs text-gray-500">Propriétés</p>
        </div>
        <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 text-center">
            <p class="text-2xl font-bold text-gray-900">{{ $stats['nb_reservations'] }}</p>
            <p class="text-xs text-gray-500">Réservations</p>
        </div>
        <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 text-center">
            <p class="text-2xl font-bold text-gray-900">{{ $stats['note_moyenne'] ? number_format($stats['note_moyenne'], 1) : '—' }}</p>
            <p class="text-xs text-gray-500">Note moyenne</p>
        </div>
        <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 text-center">
            <p class="text-2xl font-bold text-gray-900">{{ $hotel->photos->count() }}</p>
            <p class="text-xs text-gray-500">Photos</p>
        </div>
    </div>

    <!-- Status Change -->
    <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 mb-6" x-data="{ open: false }">
        <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Changer le statut</h3>
            <button @click="open = !open" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">
                <span x-text="open ? 'Fermer' : 'Modifier'"></span>
            </button>
        </div>
        <div x-show="open" x-cloak class="mt-4">
            <form method="POST" action="{{ route('admin.hotels.update-status', $hotel) }}" class="flex items-end gap-3">
                @csrf @method('PATCH')
                <div class="flex-1">
                    <select name="statut" class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm">
                        <option value="actif">Actif</option>
                        <option value="en_attente">En attente</option>
                        <option value="suspendu">Suspendu</option>
                        <option value="ferme">Fermé</option>
                    </select>
                </div>
                <div class="flex-1">
                    <input type="text" name="raison" placeholder="Raison (optionnel)" class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm">
                </div>
                <button type="submit" class="rounded-xl bg-evadia-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-evadia-700">Appliquer</button>
            </form>
        </div>

        <!-- Timeline -->
        <div class="mt-4 space-y-2">
            @foreach($hotel->statuts->take(5) as $statut)
                <div class="flex items-center gap-3 text-sm">
                    <span class="h-2 w-2 rounded-full {{ $statut->date_fin ? 'bg-gray-300' : 'bg-emerald-500' }}"></span>
                    <span class="font-medium text-gray-700">{{ ucfirst($statut->statut) }}</span>
                    <span class="text-gray-400">{{ $statut->date_debut->format('d/m/Y H:i') }}</span>
                    @if($statut->date_fin) <span class="text-gray-400">→ {{ $statut->date_fin->format('d/m/Y H:i') }}</span> @endif
                    @if($statut->raison) <span class="text-gray-400 italic">— {{ $statut->raison }}</span> @endif
                </div>
            @endforeach
        </div>
    </div>
@endsection
