@extends('layouts.hotel')

@section('title', 'Nouvelle offre - EVADIA')
@section('page_title', 'Nouvelle offre')

@section('content')
<div class="max-w-3xl mx-auto space-y-6" x-data="offreForm()">
    {{-- Header --}}
    <a href="{{ route('hotel.offers.index') }}" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Retour aux offres
    </a>

    @if($errors->any())
        <div class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <ul class="list-disc list-inside space-y-1">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('hotel.offers.store') }}" enctype="multipart/form-data">
        @csrf

        {{-- Infos générales --}}
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Informations de l'offre</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-gray-500 mb-1">Titre *</label>
                    <input type="text" name="titre" value="{{ old('titre') }}" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500" placeholder="Ex: Offre Early Bird -20%">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <textarea name="description" rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">{{ old('description') }}</textarea>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Date début *</label>
                    <input type="date" name="date_debut" value="{{ old('date_debut') }}" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Date fin *</label>
                    <input type="date" name="date_fin" value="{{ old('date_fin') }}" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Code promo</label>
                    <input type="text" name="code_promo" value="{{ old('code_promo') }}" maxlength="50"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500 uppercase" placeholder="Ex: SUMMER2026">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Réduction affichée (%)</label>
                    <div class="relative">
                        <input type="number" name="remise_pct" value="{{ old('remise_pct', 0) }}" min="0" max="100"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-hotel-500 focus:ring-hotel-500" placeholder="Ex: 25">
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-1">Pourcentage affiché publiquement sur la carte de l'offre.</p>
                </div>
            </div>
        </div>

        {{-- Conditions --}}
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6" x-data="conditionsForm()">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-gray-900">Termes & conditions</h3>
                <button type="button" @click="add()"
                    class="text-sm text-hotel-600 font-medium hover:text-hotel-700 flex items-center gap-1">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Ajouter une condition
                </button>
            </div>
            <p class="text-xs text-gray-400 mb-4">Ces conditions sont affichées sur la page publique de l'offre (ex: durée min, annulation, inclusions...).</p>
            <template x-for="(line, i) in lines" :key="i">
                <div class="flex items-center gap-2 mb-2">
                    <input type="text" :name="'conditions['+i+']'" x-model="lines[i]" placeholder="Ex: Réservation minimum de 2 nuits"
                        class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    <button type="button" @click="remove(i)" x-show="lines.length > 1"
                        class="text-red-400 hover:text-red-600 flex-shrink-0">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </template>
        </div>

        {{-- Photo de l'offre --}}
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Photo de l'offre</h3>
            <input type="file" name="photo" accept="image/*"
                class="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-hotel-50 file:text-hotel-700 hover:file:bg-hotel-100">
            <p class="text-xs text-gray-400 mt-1">JPG, PNG ou WebP. Max 5 Mo. Optionnel.</p>
        </div>

        {{-- Avantages --}}
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-gray-900">Avantages</h3>
                <button type="button" @click="addAvantage()"
                    class="text-sm text-hotel-600 font-medium hover:text-hotel-700 flex items-center gap-1">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Ajouter
                </button>
            </div>

            <template x-for="(av, index) in avantages" :key="index">
                <div class="border border-gray-200 rounded-lg p-4 mb-3">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-medium text-gray-500" x-text="'Avantage ' + (index + 1)"></span>
                        <button type="button" @click="removeAvantage(index)" x-show="avantages.length > 1" class="text-red-400 hover:text-red-600">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-medium text-gray-500 mb-1">Type d'avantage *</label>
                            <select :name="'avantages['+index+'][type_avantage_id]'" x-model="av.type_avantage_id" required
                                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                                <option value="">-- Choisir --</option>
                                @foreach($typesAvantages as $ta)
                                    <option value="{{ $ta->id }}">{{ $ta->nom }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-500 mb-1">Valeur *</label>
                            <input type="text" :name="'avantages['+index+'][valeur]'" x-model="av.valeur" required placeholder="Ex: 20, 50%, Petit-déjeuner offert"
                                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-500 mb-1">S'applique à *</label>
                            <select :name="'avantages['+index+'][entite_type]'" x-model="av.entite_type" required
                                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                                <option value="hotel">Hôtel</option>
                                <option value="propriete">Propriété</option>
                                <option value="service">Service</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-500 mb-1">Entité *</label>
                            <select :name="'avantages['+index+'][entite_id]'" x-model="av.entite_id" required
                                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                                <template x-if="av.entite_type === 'hotel'">
                                    <option value="{{ $hotel->id }}">{{ $hotel->nom }}</option>
                                </template>
                                <template x-if="av.entite_type === 'propriete'">
                                    <template x-for="p in proprietes" :key="p.id">
                                        <option :value="p.id" x-text="p.nom"></option>
                                    </template>
                                </template>
                                <template x-if="av.entite_type === 'service'">
                                    <template x-for="s in services" :key="s.id">
                                        <option :value="s.id" x-text="s.nom"></option>
                                    </template>
                                </template>
                            </select>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        {{-- Submit --}}
        <div class="flex justify-end gap-3">
            <a href="{{ route('hotel.offers.index') }}" class="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Annuler</a>
            <button type="submit" class="rounded-lg bg-hotel-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-hotel-700 transition-colors">Créer l'offre</button>
        </div>
    </form>
</div>
@endsection

@push('scripts')
<script>
function conditionsForm() {
    return {
        lines: [''],
        add() { this.lines.push(''); },
        remove(i) { this.lines.splice(i, 1); }
    };
}
function offreForm() {
    return {
        proprietes: @json($proprietes),
        services: @json($services),
        avantages: [{ type_avantage_id: '', valeur: '', entite_type: 'hotel', entite_id: '{{ $hotel->id }}' }],
        addAvantage() {
            this.avantages.push({ type_avantage_id: '', valeur: '', entite_type: 'hotel', entite_id: '{{ $hotel->id }}' });
        },
        removeAvantage(index) {
            this.avantages.splice(index, 1);
        }
    };
}
</script>
@endpush
