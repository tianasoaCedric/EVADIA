@extends('layouts.hotel')
@section('title', 'Équipements & Services - EVADIA')
@section('page_title', 'Équipements & Services')

@section('content')
<div class="max-w-4xl mx-auto space-y-6" x-data="{
    showForm: false,
    search: '',
    selected: null,
    type: '',
    nouveauType: '',
    usesNewType: false,
    get typeFinale() { return this.usesNewType ? this.nouveauType : this.type; },
    allEquipements: @js($allEquipements->flatten()->values()),
    get results() {
        if (!this.search.trim()) return [];
        const q = this.search.toLowerCase();
        return this.allEquipements.filter(e => e.nom.toLowerCase().includes(q)).slice(0, 10);
    },
    get noMatch() { return this.search.trim().length > 1 && this.results.length === 0; },
    pick(eq) {
        this.selected = eq;
        this.search = eq.nom;
        if (!this.type && !this.usesNewType) this.type = eq.categorie ?? '';
    },
    clear() { this.selected = null; this.search = ''; }
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
            Ces éléments s'affichent dans la section <strong class="text-gray-700">« Inclus dans le logement »</strong> sur votre page hôtel.
        </p>
        <button @click="showForm = !showForm; if(!showForm){ clear(); }"
            class="flex items-center gap-2 rounded-lg bg-hotel-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-hotel-700 transition-all active:scale-95 shrink-0">
            <svg class="h-4 w-4 transition-transform duration-200" :class="showForm ? 'rotate-45' : ''" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            <span x-text="showForm ? 'Annuler' : 'Ajouter'"></span>
        </button>
    </div>

    {{-- Formulaire d'ajout --}}
    <div x-show="showForm" x-cloak
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="opacity-0 -translate-y-2"
         x-transition:enter-end="opacity-100 translate-y-0">
        <form method="POST" action="{{ route('hotel.content.services.store') }}"
              class="bg-white rounded-xl border border-hotel-200 shadow-sm overflow-hidden">
            @csrf
            <div class="border-b border-gray-100 bg-hotel-50/40 px-5 py-4">
                <h3 class="text-sm font-semibold text-gray-800">Ajouter un équipement</h3>
            </div>
            <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">

                {{-- Recherche équipement --}}
                <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">
                        Équipement <span class="text-red-400">*</span>
                        <span class="text-gray-400 font-normal ml-1">— recherchez dans la liste</span>
                    </label>
                    <div class="relative">
                        <div class="flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all"
                             :class="selected ? 'border-hotel-400 bg-hotel-50/30' : 'border-gray-200 focus-within:border-hotel-400 focus-within:ring-2 focus-within:ring-hotel-400/20'">
                            <svg class="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z"/>
                            </svg>
                            <input type="text" x-model="search"
                                :readonly="selected !== null"
                                placeholder="ex: Wi-Fi, Piscine, Petit-déjeuner…"
                                class="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400">
                            <button type="button" x-show="search" @click="clear()" class="text-gray-300 hover:text-gray-500">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        {{-- input caché pour le nom --}}
                        <input type="hidden" name="nom" :value="selected ? selected.nom : search">

                        {{-- Dropdown résultats --}}
                        <div x-show="results.length > 0 && !selected"
                             class="absolute z-20 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                            <template x-for="eq in results" :key="eq.id">
                                <button type="button" @click="pick(eq)"
                                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-hotel-50 transition-colors border-b border-gray-50 last:border-0">
                                    <div class="h-6 w-6 rounded-md bg-hotel-100 flex items-center justify-center shrink-0">
                                        <svg class="h-3 w-3 text-hotel-600" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <span class="font-medium text-gray-800" x-text="eq.nom"></span>
                                        <span class="text-xs text-gray-400 ml-1.5" x-text="eq.categorie ?? ''"></span>
                                    </div>
                                </button>
                            </template>
                            <div x-show="noMatch" class="px-4 py-3 text-sm text-gray-400 text-center">
                                Aucun équipement trouvé — le texte saisi sera utilisé tel quel.
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Type --}}
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Catégorie <span class="text-gray-400 font-normal">(optionnel)</span></label>
                    <div x-show="!usesNewType">
                        <select x-model="type" @change="if(type === '__new__') { usesNewType = true; type = ''; }"
                            class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                            <option value="">Sans catégorie</option>
                            @foreach($types as $t)
                                <option value="{{ $t }}">{{ $t }}</option>
                            @endforeach
                            @foreach($allEquipements->keys() as $cat)
                                @if(!$types->contains($cat))
                                    <option value="{{ $cat }}">{{ $cat }}</option>
                                @endif
                            @endforeach
                            <option value="__new__">+ Nouvelle catégorie</option>
                        </select>
                    </div>
                    <div x-show="usesNewType" class="flex gap-2">
                        <input type="text" x-model="nouveauType" placeholder="ex: Restauration, Bien-être…"
                            class="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                        <button type="button" @click="usesNewType = false; nouveauType = ''"
                            class="rounded-lg border border-gray-200 px-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50">✕</button>
                    </div>
                    <input type="hidden" name="type_service" :value="typeFinale">
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
    @forelse($services as $type => $items)
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 px-5 py-3.5">
                <div class="h-7 w-7 rounded-lg bg-hotel-100 flex items-center justify-center shrink-0">
                    <svg class="h-3.5 w-3.5 text-hotel-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-semibold text-gray-800">{{ $type ?: 'Sans catégorie' }}</p>
                    <p class="text-xs text-gray-400">{{ $items->count() }} élément(s)</p>
                </div>
            </div>

            <div class="divide-y divide-gray-50">
                @foreach($items as $service)
                    <div class="group flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors"
                         x-data="{ editing: false }">

                        <div x-show="!editing" class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-800">{{ $service->nom }}</p>
                        </div>

                        <div x-show="editing" x-cloak class="flex-1">
                            <form method="POST" action="{{ route('hotel.content.services.update', $service->id) }}" class="flex items-center gap-2">
                                @csrf @method('PUT')
                                <input type="hidden" name="type_service" value="{{ $service->type_service }}">
                                <input type="text" name="nom" value="{{ $service->nom }}" required
                                    class="flex-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-hotel-500 focus:outline-none">
                                <button type="submit" class="rounded-lg bg-hotel-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-hotel-700">OK</button>
                                <button type="button" @click="editing = false" class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">✕</button>
                            </form>
                        </div>

                        <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" x-show="!editing" @click="editing = true"
                                class="rounded-lg p-1.5 text-gray-400 hover:text-hotel-600 hover:bg-hotel-50 transition-colors" title="Modifier">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
                                </svg>
                            </button>
                            <form method="POST" action="{{ route('hotel.content.services.destroy', $service->id) }}"
                                  onsubmit="return confirm('Supprimer « {{ addslashes($service->nom) }} » ?')">
                                @csrf @method('DELETE')
                                <button type="submit"
                                    class="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Supprimer">
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
        <div class="rounded-xl bg-white border border-gray-200 py-14 text-center">
            <svg class="h-10 w-10 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/>
            </svg>
            <p class="text-sm text-gray-400 mb-2">Aucun équipement défini.</p>
            <button @click="showForm = true" class="text-sm text-hotel-600 hover:underline">Ajouter le premier →</button>
        </div>
    @endforelse

</div>
@endsection
