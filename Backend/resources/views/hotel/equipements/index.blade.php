@extends('layouts.hotel')
@section('title', 'Mes équipements - EVADIA')
@section('page_title', 'Mes équipements')

@section('content')
<div class="max-w-4xl mx-auto space-y-6" x-data="{
    showForm: false,
    usesNewCategorie: false,
    categorie: '',
    nouvelleCategorie: '',
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
        <p class="text-sm text-gray-500">
            {{ $equipements->flatten()->count() }} équipement(s) répartis en {{ $equipements->count() }} catégorie(s)
        </p>
        <button @click="showForm = !showForm"
            class="flex items-center gap-2 rounded-lg bg-hotel-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-hotel-700 transition-all active:scale-95">
            <svg class="h-4 w-4 transition-transform duration-200" :class="showForm ? 'rotate-45' : ''" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            <span x-text="showForm ? 'Annuler' : 'Ajouter un équipement'"></span>
        </button>
    </div>

    {{-- Formulaire d'ajout --}}
    <div x-show="showForm" x-cloak
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="opacity-0 -translate-y-2"
         x-transition:enter-end="opacity-100 translate-y-0">
        <form method="POST" action="{{ route('hotel.equipements.store') }}"
              class="bg-white rounded-xl border border-hotel-200 shadow-sm overflow-hidden">
            @csrf
            <div class="border-b border-gray-100 bg-hotel-50/40 px-5 py-4">
                <h3 class="text-sm font-semibold text-gray-800">Nouvel équipement</h3>
            </div>
            <div class="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Nom <span class="text-red-400">*</span></label>
                    <input type="text" name="nom" value="{{ old('nom') }}" required placeholder="ex: WiFi, Piscine, Parking…"
                        class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none @error('nom') border-red-400 @enderror">
                    @error('nom')<p class="mt-1 text-xs text-red-500">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Catégorie <span class="text-red-400">*</span></label>
                    <div x-show="!usesNewCategorie">
                        <select x-model="categorie" @change="if(categorie === '__new__') { usesNewCategorie = true; categorie = ''; }"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                            <option value="">Choisir une catégorie…</option>
                            @foreach($categories as $cat)
                                <option value="{{ $cat }}">{{ $cat }}</option>
                            @endforeach
                            <option value="__new__">+ Nouvelle catégorie</option>
                        </select>
                    </div>
                    <div x-show="usesNewCategorie" class="flex gap-2">
                        <input type="text" x-model="nouvelleCategorie" placeholder="Nom de la catégorie"
                            class="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                        <button type="button" @click="usesNewCategorie = false; nouvelleCategorie = ''"
                            class="rounded-lg border border-gray-200 px-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-sm">✕</button>
                    </div>
                    <input type="hidden" name="categorie" :value="categorieFinale">
                    @error('categorie')<p class="mt-1 text-xs text-red-500">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Icône <span class="text-gray-400 font-normal">(optionnel)</span></label>
                    <input type="text" name="icone" value="{{ old('icone') }}" placeholder="ex: wifi, pool…"
                        class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                    <p class="mt-1 text-xs text-gray-400">Identifiant d'icône</p>
                </div>
            </div>
            <div class="border-t border-gray-100 bg-gray-50/40 px-5 py-3 flex justify-end">
                <button type="submit"
                    class="rounded-lg bg-hotel-600 px-5 py-2 text-sm font-semibold text-white hover:bg-hotel-700 transition-colors active:scale-95">
                    Ajouter
                </button>
            </div>
        </form>
    </div>

    {{-- Liste par catégorie --}}
    @forelse($equipements as $categorie => $eqs)
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 px-5 py-3.5">
                <div class="h-7 w-7 rounded-lg bg-hotel-100 flex items-center justify-center shrink-0">
                    <svg class="h-3.5 w-3.5 text-hotel-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                </div>
                <div>
                    <p class="text-sm font-semibold text-gray-800">{{ $categorie ?: 'Sans catégorie' }}</p>
                    <p class="text-xs text-gray-400">{{ $eqs->count() }} équipement(s)</p>
                </div>
            </div>

            <div class="flex flex-wrap gap-2 p-4">
                @foreach($eqs as $eq)
                    <div class="group flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 hover:border-red-200 hover:bg-red-50 transition-colors">
                        <span>{{ $eq->nom }}</span>
                        <form method="POST" action="{{ route('hotel.equipements.destroy', $eq) }}"
                              onsubmit="return confirm('Supprimer « {{ addslashes($eq->nom) }} » ?')">
                            @csrf @method('DELETE')
                            <button type="submit"
                                class="ml-0.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Supprimer">
                                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </form>
                    </div>
                @endforeach
            </div>
        </div>
    @empty
        <div class="rounded-xl bg-white border border-gray-200 py-14 text-center">
            <svg class="h-10 w-10 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p class="text-sm text-gray-400 mb-2">Aucun équipement défini.</p>
            <button @click="showForm = true" class="text-sm text-hotel-600 hover:underline">Ajouter le premier équipement →</button>
        </div>
    @endforelse

</div>
@endsection
