@extends('layouts.hotel')

@section('title', 'Offres - EVADIA')
@section('page_title', 'Offres & Promotions')

@section('content')
<div class="space-y-6">
    {{-- Header --}}
    <div class="flex items-center justify-between">
        <div>
            <a href="{{ route('hotel.pricing.index') }}" class="text-sm text-gray-500 hover:text-gray-700">Prix</a>
            <span class="text-gray-300 mx-2">/</span>
            <span class="text-sm font-medium text-gray-900">Offres</span>
        </div>
        <a href="{{ route('hotel.offers.create') }}"
            class="rounded-lg bg-gradient-to-r from-hotel-600 to-hotel-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-hotel-700 hover:to-hotel-800 transition-all flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouvelle offre
        </a>
    </div>

    {{-- Mes Offres --}}
    <div>
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Mes offres</h3>
        @if($mesOffres->count())
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @foreach($mesOffres as $offre)
                    <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div class="flex items-start justify-between mb-3">
                            <div>
                                <h4 class="font-semibold text-gray-900">{{ $offre->titre }}</h4>
                                @if($offre->code_promo)
                                    <span class="inline-flex items-center mt-1 px-2 py-0.5 rounded bg-hotel-50 text-hotel-700 text-xs font-mono font-medium">{{ $offre->code_promo }}</span>
                                @endif
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-xs font-medium {{ $offre->statut === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600' }}">
                                {{ ucfirst($offre->statut) }}
                            </span>
                        </div>

                        @if($offre->description)
                            <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ $offre->description }}</p>
                        @endif

                        <div class="flex items-center gap-4 text-xs text-gray-500 mb-4">
                            <span>Du {{ \Carbon\Carbon::parse($offre->date_debut)->format('d/m/Y') }}</span>
                            <span>Au {{ \Carbon\Carbon::parse($offre->date_fin)->format('d/m/Y') }}</span>
                            <span>{{ $offre->utilisations_count }} utilisation(s)</span>
                        </div>

                        <div class="flex items-center gap-2">
                            <a href="{{ route('hotel.offers.edit', $offre->id) }}"
                                class="flex-1 text-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">Modifier</a>
                            <form method="POST" action="{{ route('hotel.offers.toggle', $offre->id) }}" class="flex-1">
                                @csrf
                                @method('PATCH')
                                <button type="submit"
                                    class="w-full rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors {{ $offre->statut === 'active' ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50' }}">
                                    {{ $offre->statut === 'active' ? 'Désactiver' : 'Activer' }}
                                </button>
                            </form>
                        </div>
                    </div>
                @endforeach
            </div>
            <div class="mt-4">{{ $mesOffres->links() }}</div>
        @else
            <div class="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p class="text-sm text-gray-400 mb-3">Aucune offre créée</p>
                <a href="{{ route('hotel.offers.create') }}" class="text-sm text-hotel-600 font-medium hover:text-hotel-700">Créer votre première offre</a>
            </div>
        @endif
    </div>

    {{-- Offres EVADIA --}}
    <div>
        <h3 class="text-sm font-semibold text-gray-900 mb-1">Offres EVADIA</h3>
        <p class="text-xs text-gray-500 mb-3">Offres créées par EVADIA qui s'appliquent à votre hôtel (lecture seule)</p>
        @if($offresEvadia->count())
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @foreach($offresEvadia as $offre)
                    <div class="bg-white rounded-xl border border-evadia-200 p-5 relative">
                        <div class="absolute top-3 right-3">
                            <span class="px-2 py-0.5 rounded-full bg-evadia-50 text-evadia-700 text-[10px] font-medium uppercase">EVADIA</span>
                        </div>
                        <h4 class="font-semibold text-gray-900 mb-1">{{ $offre->titre }}</h4>
                        @if($offre->description)
                            <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ $offre->description }}</p>
                        @endif
                        <div class="flex items-center gap-4 text-xs text-gray-500">
                            <span>Du {{ \Carbon\Carbon::parse($offre->date_debut)->format('d/m/Y') }}</span>
                            <span>Au {{ \Carbon\Carbon::parse($offre->date_fin)->format('d/m/Y') }}</span>
                            <span class="px-2 py-0.5 rounded-full {{ $offre->statut === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600' }} text-xs font-medium">{{ ucfirst($offre->statut) }}</span>
                        </div>
                    </div>
                @endforeach
            </div>
            <div class="mt-4">{{ $offresEvadia->links() }}</div>
        @else
            <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <p class="text-sm text-gray-400">Aucune offre EVADIA pour votre hôtel</p>
            </div>
        @endif
    </div>
</div>
@endsection
