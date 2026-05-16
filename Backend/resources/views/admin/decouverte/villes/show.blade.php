@extends('layouts.admin')
@section('title', $ville->nom . ' - EVADIA Admin')
@section('page_title', $ville->nom)

@section('content')
    <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.decouverte.villes.index') }}"
                class="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 flex items-center gap-2">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Retour
            </a>
            <span class="rounded-full px-2.5 py-0.5 text-xs font-medium
                {{ $ville->actif ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500' }}">
                {{ $ville->actif ? 'Active' : 'Inactive' }}
            </span>
        </div>
        <div class="flex gap-2">
            <a href="{{ route('admin.decouverte.villes.lieux.create', $ville) }}"
                class="rounded-xl bg-evadia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 flex items-center gap-2">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Ajouter un lieu
            </a>
            <a href="{{ route('admin.decouverte.villes.edit', $ville) }}"
                class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Modifier
            </a>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {{-- Infos ville --}}
        <div class="lg:col-span-1 space-y-4">
            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
                @if($ville->image)
                    <img src="{{ Storage::disk('s3')->url($ville->image) }}" alt="{{ $ville->nom }}"
                        class="w-full h-48 object-cover">
                @else
                    <div class="w-full h-48 bg-gradient-to-br from-evadia-100 to-evadia-200 flex items-center justify-center">
                        <svg class="h-16 w-16 text-evadia-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                @endif
                <div class="p-5 space-y-3">
                    <div>
                        <p class="text-xs text-gray-400 uppercase tracking-wide">Slug</p>
                        <p class="text-sm font-mono text-gray-600">{{ $ville->slug }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                        <div>
                            <p class="text-xs text-gray-400">Ordre</p>
                            <p class="text-sm font-medium text-gray-700">{{ $ville->ordre }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">Lieux</p>
                            <p class="text-sm font-medium text-gray-700">{{ $ville->lieux->count() }}</p>
                        </div>
                    </div>
                    @if($ville->createdBy)
                        <div class="pt-2 border-t border-gray-100">
                            <p class="text-xs text-gray-400">Créé par</p>
                            <p class="text-sm text-gray-600">{{ $ville->createdBy->name ?? $ville->createdBy->prenom . ' ' . $ville->createdBy->nom }}</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        {{-- Liste des lieux --}}
        <div class="lg:col-span-2">
            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 class="text-sm font-semibold text-gray-700">Lieux & Monuments ({{ $ville->lieux->count() }})</h2>
                </div>

                @forelse($ville->lieux as $lieu)
                    <div class="px-6 py-4 border-b border-gray-50 last:border-0 flex items-center justify-between gap-4">
                        <div class="flex items-center gap-4 min-w-0">
                            @if($lieu->images && count($lieu->images) > 0)
                                <img src="{{ Storage::disk('s3')->url($lieu->images[0]) }}" alt="{{ $lieu->nom }}"
                                    class="h-12 w-16 object-cover rounded-lg flex-shrink-0">
                            @else
                                <div class="h-12 w-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                                    <svg class="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                                    </svg>
                                </div>
                            @endif
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-gray-800 truncate">{{ $lieu->nom }}</p>
                                <p class="text-xs text-gray-400">
                                @if($lieu->emplacement) {{ $lieu->emplacement }} · @endif
                                {{ count($lieu->images ?? []) }} photo(s) carrousel
                            </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0">
                            <span class="rounded-full px-2 py-0.5 text-xs font-medium
                                {{ $lieu->actif ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500' }}">
                                {{ $lieu->actif ? 'Actif' : 'Inactif' }}
                            </span>
                            <a href="{{ route('admin.decouverte.villes.lieux.edit', [$ville, $lieu]) }}"
                                class="rounded-lg p-1.5 text-gray-400 hover:text-evadia-600 hover:bg-evadia-50 transition-colors">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                </svg>
                            </a>
                            <form method="POST" action="{{ route('admin.decouverte.villes.lieux.destroy', [$ville, $lieu]) }}"
                                class="inline" onsubmit="return confirm('Supprimer ce lieu ?')">
                                @csrf @method('DELETE')
                                <button type="submit" class="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                @empty
                    <div class="px-6 py-12 text-center">
                        <p class="text-sm text-gray-400">Aucun lieu ajouté pour cette ville.</p>
                        <a href="{{ route('admin.decouverte.villes.lieux.create', $ville) }}"
                            class="mt-3 inline-flex items-center gap-1 text-sm text-evadia-600 hover:underline">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Ajouter le premier lieu
                        </a>
                    </div>
                @endforelse
            </div>
        </div>
    </div>
@endsection
