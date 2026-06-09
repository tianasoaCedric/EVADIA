@extends('layouts.admin')
@section('title', 'Lieux — ' . $ville->nom . ' - EVADIA Admin')
@section('page_title', 'Lieux : ' . $ville->nom)

@section('content')
    <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.decouverte.villes.show', $ville) }}"
                class="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 flex items-center gap-2">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                {{ $ville->nom }}
            </a>
            <form method="GET" action="{{ route('admin.decouverte.villes.lieux.index', $ville) }}" class="flex gap-2">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Rechercher un lieu..."
                    class="w-48 rounded-xl border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                <button type="submit"
                    class="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200">Filtrer</button>
            </form>
        </div>
        <a href="{{ route('admin.decouverte.villes.lieux.create', $ville) }}"
            class="rounded-xl bg-evadia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouveau lieu
        </a>
    </div>

    <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        @forelse($lieux as $lieu)
            <div class="px-6 py-4 border-b border-gray-50 last:border-0 flex items-center justify-between gap-4">
                <div class="flex items-center gap-4 min-w-0">
                    @if($lieu->images && count($lieu->images) > 0)
                        <img src="{{ Storage::disk('s3')->url($lieu->images[0]) }}" alt="{{ $lieu->nom }}"
                            class="h-14 w-20 object-cover rounded-xl flex-shrink-0">
                    @else
                        <div class="h-14 w-20 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                            <svg class="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                            </svg>
                        </div>
                    @endif
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-gray-900 truncate">{{ $lieu->nom }}</p>
                        <p class="text-xs text-gray-400 mt-0.5">
                            {{ $lieu->emplacement ?? '—' }} ·
                            {{ count($lieu->images ?? []) }} photo(s) carrousel ·
                            Ordre {{ $lieu->ordre }}
                        </p>
                        @if($lieu->description)
                            <p class="text-xs text-gray-500 mt-1 line-clamp-1">{{ $lieu->description }}</p>
                        @endif
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="rounded-full px-2.5 py-0.5 text-xs font-medium
                        {{ $lieu->actif ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500' }}">
                        {{ $lieu->actif ? 'Actif' : 'Inactif' }}
                    </span>
                    <a href="{{ route('admin.decouverte.villes.lieux.edit', [$ville, $lieu]) }}"
                        class="rounded-lg p-1.5 text-gray-400 hover:text-evadia-600 hover:bg-evadia-50 transition-colors" title="Modifier">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                    </a>
                    <form method="POST" action="{{ route('admin.decouverte.villes.lieux.toggle', [$ville, $lieu]) }}" class="inline">
                        @csrf @method('PATCH')
                        <button type="submit" class="rounded-lg p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="{{ $lieu->actif ? 'Désactiver' : 'Activer' }}">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                            </svg>
                        </button>
                    </form>
                    <form method="POST" action="{{ route('admin.decouverte.villes.lieux.destroy', [$ville, $lieu]) }}" class="inline"
                        onsubmit="return confirm('Supprimer ce lieu ?')">
                        @csrf @method('DELETE')
                        <button type="submit" class="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Supprimer">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        @empty
            <div class="text-center py-16">
                <p class="text-sm text-gray-400">Aucun lieu pour cette ville.</p>
            </div>
        @endforelse
    </div>

    <div class="mt-6">{{ $lieux->links() }}</div>
@endsection
