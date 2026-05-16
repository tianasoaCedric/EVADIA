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
            <div x-show="step === 2" x-cloak class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Équipements</h3>
                @foreach($equipements as $categorie => $eqs)
                    <div class="mb-6">
                        <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                            {{ $categorie ?? 'Autres' }}</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            @foreach($eqs as $eq)
                                <label
                                    class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-hotel-300 cursor-pointer transition-colors"
                                    x-data="{ checked: false }">
                                    <input type="checkbox" x-model="checked"
                                        name="equipements[{{ $loop->parent->index }}_{{ $loop->index }}][id]" value="{{ $eq->id }}"
                                        class="rounded border-gray-300 text-hotel-600 focus:ring-hotel-500">
                                    <span class="text-sm text-gray-700 flex-1">{{ $eq->nom }}</span>
                                    <input x-show="checked" type="number"
                                        name="equipements[{{ $loop->parent->index }}_{{ $loop->index }}][quantite]" value="1"
                                        min="1"
                                        class="w-16 rounded border-gray-300 text-xs text-center focus:border-hotel-500 focus:ring-hotel-500">
                                </label>
                            @endforeach
                        </div>
                    </div>
                @endforeach
                <div class="mt-6 flex justify-between">
                    <button type="button" @click="step = 1" class="text-sm text-gray-500 hover:text-gray-700">←
                        Retour</button>
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