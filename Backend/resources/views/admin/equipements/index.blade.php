@extends('layouts.admin')
@section('title', 'Équipements - EVADIA Admin')
@section('page_title', 'Équipements')

@section('content')
<div class="space-y-6" x-data="{
    showForm: false,
    categorie: '',
    nouvelleCategorie: '',
    usesNewCategorie: false,
    get categorieFinale() { return this.usesNewCategorie ? this.nouvelleCategorie : this.categorie; }
}">

    {{-- Flash --}}
    @if(session('success'))
        <div class="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
            {{ session('success') }}
        </div>
    @endif

    @if($errors->any())
        <div class="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <ul class="list-disc list-inside space-y-1">
                @foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach
            </ul>
        </div>
    @endif

    {{-- Header --}}
    <div class="flex items-center justify-between">
        <div>
            <p class="text-sm text-gray-500 mt-0.5">
                {{ $equipements->flatten()->count() }} équipement(s) répartis en {{ $equipements->count() }} catégorie(s)
            </p>
        </div>
        <button @click="showForm = !showForm"
            class="flex items-center gap-2 rounded-xl bg-evadia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 transition-all active:scale-95">
            <svg class="h-4 w-4 transition-transform duration-200" :class="showForm ? 'rotate-45' : ''" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            <span x-text="showForm ? 'Annuler' : 'Nouvel équipement'"></span>
        </button>
    </div>

    {{-- Formulaire d'ajout --}}
    <div x-show="showForm" x-cloak x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 -translate-y-2" x-transition:enter-end="opacity-100 translate-y-0">
        <form method="POST" action="{{ route('admin.equipements.store') }}"
              class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
            @csrf
            <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                <h3 class="text-sm font-semibold text-gray-800">Ajouter un équipement</h3>
            </div>
            <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">

                {{-- Nom --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom <span class="text-red-400 text-xs">*</span></label>
                    <input type="text" name="nom" value="{{ old('nom') }}" required placeholder="ex: WiFi, Piscine…"
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none @error('nom') border-red-400 bg-red-50/40 @enderror">
                    @error('nom')<p class="mt-1 text-xs text-red-500">{{ $message }}</p>@enderror
                </div>

                {{-- Catégorie --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Catégorie <span class="text-red-400 text-xs">*</span></label>
                    <div x-show="!usesNewCategorie">
                        <select x-model="categorie" @change="usesNewCategorie = (categorie === '__new__')"
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                            <option value="">Sélectionner une catégorie…</option>
                            @foreach($categories as $cat)
                                <option value="{{ $cat }}">{{ $cat }}</option>
                            @endforeach
                            <option value="__new__">+ Nouvelle catégorie</option>
                        </select>
                    </div>
                    <div x-show="usesNewCategorie" class="flex gap-2">
                        <input type="text" x-model="nouvelleCategorie" placeholder="Nom de la nouvelle catégorie"
                            class="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                        <button type="button" @click="usesNewCategorie = false; nouvelleCategorie = ''; categorie = ''"
                            class="rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50">
                            ✕
                        </button>
                    </div>
                    <input type="hidden" name="categorie" :value="categorieFinale">
                    @error('categorie')<p class="mt-1 text-xs text-red-500">{{ $message }}</p>@enderror
                </div>

                {{-- Icône --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Icône <span class="text-gray-400 text-xs font-normal">(optionnel)</span></label>
                    <input type="text" name="icone" value="{{ old('icone') }}" placeholder="ex: wifi, pool, parking…"
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                    <p class="mt-1 text-xs text-gray-400">Identifiant d'icône (Lucide, Material…)</p>
                </div>

            </div>
            <div class="border-t border-gray-100 bg-gray-50/40 px-6 py-4 flex justify-end">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 active:scale-95 transition-all">
                    Ajouter l'équipement
                </button>
            </div>
        </form>
    </div>

    {{-- Grille par catégorie --}}
    @forelse($equipements as $categorie => $eqs)
        <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
            {{-- En-tête catégorie --}}
            <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-lg bg-evadia-100 flex items-center justify-center">
                        <svg class="h-4 w-4 text-evadia-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-gray-900">{{ $categorie ?: 'Sans catégorie' }}</h3>
                        <p class="text-xs text-gray-400">{{ $eqs->count() }} équipement(s)</p>
                    </div>
                </div>
            </div>

            {{-- Liste équipements --}}
            <div class="divide-y divide-gray-50">
                @foreach($eqs as $eq)
                    <div class="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50 transition-colors group">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-500 text-xs font-mono group-hover:bg-evadia-50 group-hover:text-evadia-600 transition-colors">
                                @if($eq->icone)
                                    {{ Str::limit($eq->icone, 3, '') }}
                                @else
                                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                                    </svg>
                                @endif
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-800">{{ $eq->nom }}</p>
                                @if($eq->icone)
                                    <p class="text-xs text-gray-400 font-mono">{{ $eq->icone }}</p>
                                @endif
                            </div>
                        </div>

                        <div class="flex items-center gap-2 shrink-0">
                            <span class="text-xs text-gray-300">id {{ $eq->id }}</span>
                            <form method="POST" action="{{ route('admin.equipements.destroy', $eq) }}"
                                  onsubmit="return confirm('Supprimer « {{ addslashes($eq->nom) }} » ? Cette action le retirera aussi de toutes les chambres.')">
                                @csrf @method('DELETE')
                                <button type="submit"
                                    class="rounded-lg p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Supprimer">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    @empty
        <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 py-16 text-center">
            <svg class="h-12 w-12 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p class="text-sm text-gray-400">Aucun équipement défini.</p>
            <button @click="showForm = true" class="mt-3 text-sm text-evadia-600 hover:underline">Ajouter le premier équipement</button>
        </div>
    @endforelse

</div>
@endsection
