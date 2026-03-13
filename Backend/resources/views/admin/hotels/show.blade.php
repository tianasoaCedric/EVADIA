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
                    <img src="{{ $hotel->photos->first()->url_photo }}" class="h-full w-full object-cover">
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
                    <span class="text-gray-500">📧 {{ $hotel->email_contact ?? '—' }}</span>
                    <span class="text-gray-500">📞 {{ $hotel->telephone ?? '—' }}</span>
                    <span class="text-gray-500">🌐 {{ $hotel->site_web ?? '—' }}</span>
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
