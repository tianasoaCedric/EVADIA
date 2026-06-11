@extends('layouts.hotel')

@section('title', 'Nouvelle chambre - EVADIA')
@section('page_title', 'Nouvelle chambre')

@section('content')
    <div class="max-w-4xl mx-auto" x-data="{ step: 1 }">
        {{-- Stepper --}}
        <div class="flex items-center justify-center mb-8">
            @foreach(['Informations', 'Équipements', 'Photos', 'Prix'] as $i => $label)
                <div class="flex items-center">
                    <div class="flex items-center gap-2 cursor-pointer" @click="step = {{ $i + 1 }}">
                        <div class="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                            :class="step >= {{ $i + 1 }} ? 'bg-hotel-600 text-white' : 'bg-gray-200 text-gray-500'">{{ $i + 1 }}
                        </div>
                        <span class="text-sm font-medium hidden sm:inline"
                            :class="step === {{ $i + 1 }} ? 'text-hotel-600' : 'text-gray-500'">{{ $label }}</span>
                    </div>
                    @if($i < 3)
                        <div class="w-12 h-0.5 mx-2" :class="step > {{ $i + 1 }} ? 'bg-hotel-600' : 'bg-gray-200'"></div>
                    @endif
                </div>
            @endforeach
        </div>

        <form method="POST" action="{{ route('hotel.rooms.store') }}" enctype="multipart/form-data">
            @csrf

            {{-- Step 1: General --}}
            <div x-show="step === 1" class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                        <input type="text" name="nom" value="{{ old('nom') }}" required
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                        @error('nom') <p class="mt-1 text-sm text-red-600">{{ $message }}</p> @enderror
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" rows="3"
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">{{ old('description') }}</textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                        <select name="type_propriete" required
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                            @foreach(['chambre', 'suite', 'villa', 'appartement', 'bungalow', 'studio'] as $t)
                                <option value="{{ $t }}" {{ old('type_propriete') === $t ? 'selected' : '' }}>{{ ucfirst($t) }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Capacité (personnes) *</label>
                        <input type="number" name="capacite" value="{{ old('capacite', 2) }}" min="1" required
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de chambres</label>
                        <input type="number" name="nb_chambres" value="{{ old('nb_chambres') }}" min="0"
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de lits</label>
                        <input type="number" name="nb_lits" value="{{ old('nb_lits') }}" min="0"
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Salles de bain</label>
                        <input type="number" name="nb_salles_bain" value="{{ old('nb_salles_bain') }}" min="0"
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Superficie (m²)</label>
                        <input type="number" name="superficie" value="{{ old('superficie') }}" min="1"
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>
                </div>
                <div class="mt-6 flex justify-end">
                    <button type="button" @click="step = 2"
                        class="rounded-lg bg-hotel-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-hotel-700 transition-all">
                        Suivant →
                    </button>
                </div>
            </div>

            {{-- Step 2: Equipment --}}
            <div x-show="step === 2" x-cloak class="bg-white rounded-xl border border-gray-200 p-6"
                 x-data="{
                     searchQuery: '',
                     searchResults: [],
                     selected: {},
                     showCreateForm: false,
                     newNom: '',
                     newCategorie: '',
                     allEquipements: @js($equipements->flatten()->values()),
                     get selectedList() { return Object.values(this.selected); },
                     get filteredResults() {
                         if (!this.searchQuery.trim()) return [];
                         const q = this.searchQuery.toLowerCase();
                         return this.allEquipements.filter(e =>
                             !this.selected[e.id] && e.nom.toLowerCase().includes(q)
                         ).slice(0, 8);
                     },
                     get noMatch() {
                         return this.searchQuery.trim().length > 1 && this.filteredResults.length === 0;
                     },
                     select(eq) {
                         this.selected[eq.id] = { id: eq.id, nom: eq.nom, categorie: eq.categorie, quantite: 1 };
                         this.searchQuery = '';
                     },
                     remove(id) { delete this.selected[id]; },
                     async createAndSelect() {
                         if (!this.newNom.trim() || !this.newCategorie.trim()) return;
                         const res = await fetch('{{ route('hotel.equipements.store-ajax') }}', {
                             method: 'POST',
                             headers: {
                                 'Content-Type': 'application/json',
                                 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content
                             },
                             body: JSON.stringify({ nom: this.newNom.trim(), categorie: this.newCategorie.trim() })
                         });
                         if (res.ok) {
                             const eq = await res.json();
                             this.allEquipements.push(eq);
                             this.select(eq);
                             this.newNom = '';
                             this.newCategorie = '';
                             this.showCreateForm = false;
                             this.searchQuery = '';
                         } else {
                             const err = await res.json();
                             alert(err.message ?? 'Cet équipement existe déjà.');
                         }
                     }
                 }">

                <h3 class="text-lg font-semibold text-gray-900 mb-1">Équipements</h3>
                <p class="text-sm text-gray-400 mb-5">Recherchez des équipements existants ou créez-en de nouveaux.</p>

                {{-- Barre de recherche --}}
                <div class="relative mb-4">
                    <div class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 focus-within:border-hotel-400 focus-within:ring-2 focus-within:ring-hotel-400/20 transition-all">
                        <svg class="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z"/>
                        </svg>
                        <input type="text" x-model="searchQuery" placeholder="Rechercher un équipement…"
                            class="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400">
                        <button type="button" x-show="searchQuery" @click="searchQuery = ''"
                            class="text-gray-300 hover:text-gray-500">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    {{-- Dropdown résultats --}}
                    <div x-show="filteredResults.length > 0 || noMatch"
                         class="absolute z-20 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                        <template x-for="eq in filteredResults" :key="eq.id">
                            <button type="button" @click="select(eq)"
                                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-hotel-50 transition-colors">
                                <div class="h-6 w-6 rounded-md bg-hotel-100 flex items-center justify-center shrink-0">
                                    <svg class="h-3 w-3 text-hotel-600" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                                    </svg>
                                </div>
                                <div>
                                    <span class="font-medium text-gray-800" x-text="eq.nom"></span>
                                    <span class="text-xs text-gray-400 ml-1.5" x-text="eq.categorie"></span>
                                </div>
                            </button>
                        </template>
                        <div x-show="noMatch" class="px-4 py-3 text-sm text-gray-500 border-t border-gray-100">
                            <p class="mb-2">Aucun résultat pour <strong x-text="'« ' + searchQuery + ' »'"></strong></p>
                            <button type="button" @click="newNom = searchQuery; showCreateForm = true; searchQuery = ''"
                                class="text-hotel-600 font-medium hover:underline">
                                + Créer cet équipement
                            </button>
                        </div>
                    </div>
                </div>

                {{-- Formulaire de création rapide --}}
                <div x-show="showCreateForm" x-cloak
                     class="mb-4 rounded-lg border border-hotel-200 bg-hotel-50/30 p-4"
                     x-transition:enter="transition ease-out duration-150"
                     x-transition:enter-start="opacity-0 scale-95"
                     x-transition:enter-end="opacity-100 scale-100">
                    <p class="text-xs font-semibold text-hotel-700 mb-3">Créer un nouvel équipement</p>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">Nom *</label>
                            <input type="text" x-model="newNom" placeholder="ex: Jacuzzi"
                                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-hotel-500 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">Catégorie *</label>
                            <input type="text" x-model="newCategorie" placeholder="ex: Bien-être"
                                list="categories-list"
                                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-hotel-500 focus:outline-none">
                            <datalist id="categories-list">
                                @foreach($equipements->keys() as $cat)
                                    <option value="{{ $cat }}">
                                @endforeach
                            </datalist>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button type="button" @click="createAndSelect()"
                            :disabled="!newNom.trim() || !newCategorie.trim()"
                            class="rounded-lg bg-hotel-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-hotel-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            Créer et ajouter
                        </button>
                        <button type="button" @click="showCreateForm = false; newNom = ''; newCategorie = ''"
                            class="rounded-lg border border-gray-200 px-4 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                            Annuler
                        </button>
                    </div>
                </div>

                {{-- Équipements sélectionnés --}}
                <div x-show="selectedList.length > 0">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Sélectionnés (<span x-text="selectedList.length"></span>)
                    </p>
                    <div class="flex flex-wrap gap-2 mb-4">
                        <template x-for="eq in selectedList" :key="eq.id">
                            <div class="group flex items-center gap-2 rounded-full border border-hotel-200 bg-hotel-50 px-3 py-1.5">
                                <span class="text-sm font-medium text-hotel-700" x-text="eq.nom"></span>
                                <div class="flex items-center gap-1">
                                    <span class="text-xs text-hotel-400">×</span>
                                    <input type="number" x-model.number="eq.quantite" min="1"
                                        class="w-10 rounded border border-hotel-200 bg-white px-1 py-0.5 text-xs text-center focus:border-hotel-500 focus:outline-none">
                                </div>
                                <button type="button" @click="remove(eq.id)"
                                    class="text-hotel-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                        </template>
                    </div>
                </div>
                <div x-show="selectedList.length === 0" class="mb-4 py-6 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
                    Aucun équipement sélectionné — recherchez ci-dessus pour en ajouter.
                </div>

                {{-- Hidden inputs pour soumission --}}
                <template x-for="(eq, idx) in selectedList" :key="eq.id">
                    <div>
                        <input type="hidden" :name="'equipements[' + idx + '][id]'" :value="eq.id">
                        <input type="hidden" :name="'equipements[' + idx + '][quantite]'" :value="eq.quantite">
                    </div>
                </template>

                <div class="mt-4 flex justify-between">
                    <button type="button" @click="step = 1" class="text-sm text-gray-500 hover:text-gray-700">← Retour</button>
                    <button type="button" @click="step = 3"
                        class="rounded-lg bg-hotel-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-hotel-700 transition-all">
                        Suivant →
                    </button>
                </div>
            </div>

            {{-- Step 3: Photos --}}
            <div x-show="step === 3" x-cloak class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
                <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center" x-data="{ files: [] }">
                    <svg class="h-10 w-10 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke-width="1"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 18.75h.008v.008H18v-.008zm-6 0h.008v.008H12v-.008z" />
                    </svg>
                    <p class="text-sm text-gray-500 mb-2">Glissez vos photos ou cliquez pour sélectionner</p>
                    <p class="text-xs text-gray-400 mb-4">La première photo sera la photo principale. Max 5 Mo par fichier.
                    </p>
                    <input type="file" name="photos[]" multiple accept="image/*"
                        class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-hotel-50 file:text-hotel-700 hover:file:bg-hotel-100"
                        @change="files = Array.from($event.target.files)">
                    <template x-if="files.length > 0">
                        <p class="mt-3 text-sm text-hotel-600" x-text="files.length + ' fichier(s) sélectionné(s)'"></p>
                    </template>
                </div>
                <div class="mt-6 flex justify-between">
                    <button type="button" @click="step = 2" class="text-sm text-gray-500 hover:text-gray-700">←
                        Retour</button>
                    <button type="button" @click="step = 4"
                        class="rounded-lg bg-hotel-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-hotel-700 transition-all">
                        Suivant →
                    </button>
                </div>
            </div>

            {{-- Step 4: Price --}}
            <div x-show="step === 4" x-cloak class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Prix initial</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Prix par nuit (MGA) *</label>
                        <div class="relative">
                            <input type="number" step="1" name="prix_mga" value="{{ old('prix_mga') }}" required min="0"
                                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Ar</span>
                        </div>
                        @error('prix_mga') <p class="mt-1 text-sm text-red-600">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Prix par nuit (EUR) *</label>
                        <div class="relative">
                            <input type="number" step="0.01" name="prix_eur" value="{{ old('prix_eur') }}" required min="0"
                                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-8 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
                        </div>
                        @error('prix_eur') <p class="mt-1 text-sm text-red-600">{{ $message }}</p> @enderror
                    </div>
                </div>
                <p class="text-xs text-gray-400 mt-2">Ces prix seront les prix de base, modifiables ensuite via le module Prix.</p>
                <div class="mt-6 flex justify-between">
                    <button type="button" @click="step = 3" class="text-sm text-gray-500 hover:text-gray-700">←
                        Retour</button>
                    <button type="submit"
                        class="rounded-lg bg-gradient-to-r from-hotel-600 to-hotel-700 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-hotel-700 hover:to-hotel-800 transition-all">
                        Créer la chambre
                    </button>
                </div>
            </div>
        </form>
    </div>
@endsection
