@extends('layouts.admin')
@section('title', 'Contenu Découverte - EVADIA Admin')
@section('page_title', 'Contenu Découverte — Villes')

@section('content')
    <div class="flex items-center justify-between mb-6">
        <form method="GET" action="{{ route('admin.decouverte.villes.index') }}" class="flex items-end gap-3">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Rechercher une ville..."
                class="w-56 rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
            <select name="actif"
                class="rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                <option value="">Tous statuts</option>
                <option value="1" {{ request('actif') === '1' ? 'selected' : '' }}>Actives</option>
                <option value="0" {{ request('actif') === '0' ? 'selected' : '' }}>Inactives</option>
            </select>
            <button type="submit"
                class="rounded-xl bg-evadia-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-evadia-700">Filtrer</button>
        </form>
        <a href="{{ route('admin.decouverte.villes.create') }}"
            class="rounded-xl bg-evadia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouvelle ville
        </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        @forelse($villes as $ville)
            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden hover:shadow-md transition-all">
                @if($ville->image)
                    <div class="h-36 overflow-hidden">
                        <img src="{{ Storage::disk('s3')->url($ville->image) }}" alt="{{ $ville->nom }}"
                            class="w-full h-full object-cover">
                    </div>
                @else
                    <div class="h-36 bg-gradient-to-br from-evadia-100 to-evadia-200 flex items-center justify-center">
                        <svg class="h-12 w-12 text-evadia-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                @endif

                <div class="p-5">
                    <div class="flex items-start justify-between">
                        <div>
                            <h3 class="text-sm font-semibold text-gray-900">{{ $ville->nom }}</h3>
                            <span class="text-xs text-gray-400">{{ $ville->lieux_count }} lieu(x)</span>
                        </div>
                        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium
                            {{ $ville->actif ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500' }}">
                            {{ $ville->actif ? 'Active' : 'Inactive' }}
                        </span>
                    </div>
                    <div class="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                        <span class="text-xs text-gray-400">Ordre : {{ $ville->ordre }}</span>
                        <div class="flex gap-1">
                            <a href="{{ route('admin.decouverte.villes.show', $ville) }}"
                                class="rounded-lg p-1.5 text-gray-400 hover:text-evadia-600 hover:bg-evadia-50 transition-colors" title="Voir">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </a>
                            <a href="{{ route('admin.decouverte.villes.edit', $ville) }}"
                                class="rounded-lg p-1.5 text-gray-400 hover:text-evadia-600 hover:bg-evadia-50 transition-colors" title="Modifier">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                            </a>
                            <form method="POST" action="{{ route('admin.decouverte.villes.toggle', $ville) }}" class="inline">
                                @csrf @method('PATCH')
                                <button type="submit"
                                    class="rounded-lg p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                    title="{{ $ville->actif ? 'Désactiver' : 'Activer' }}">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                                    </svg>
                                </button>
                            </form>
                            <form method="POST" action="{{ route('admin.decouverte.villes.destroy', $ville) }}" class="inline"
                                onsubmit="return confirm('Supprimer cette ville et tous ses lieux ?')">
                                @csrf @method('DELETE')
                                <button type="submit"
                                    class="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Supprimer">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        @empty
            <div class="col-span-full text-center py-16">
                <p class="text-sm text-gray-400">Aucune ville trouvée</p>
            </div>
        @endforelse
    </div>

    <div class="mt-6">{{ $villes->links() }}</div>
@endsection
