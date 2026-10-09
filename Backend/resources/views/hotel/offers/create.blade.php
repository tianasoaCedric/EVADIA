@extends('layouts.hotel')

@section('title', 'Nouvelle offre - EVADIA')
@section('page_title', 'Nouvelle offre')

@section('content')
<div class="max-w-3xl mx-auto space-y-6" x-data="offreForm()">
    <a href="{{ route('hotel.offers.index') }}" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Retour aux offres
    </a>

    @if($errors->any())
        <div class="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <ul class="list-disc list-inside space-y-1">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('hotel.offers.store') }}" enctype="multipart/form-data">
        @csrf

        {{-- Informations générales --}}
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                <h3 class="text-sm font-semibold text-gray-800">Informations de l'offre</h3>
            </div>
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Titre <span class="text-red-400 text-xs">*</span></label>
                    <input type="text" name="titre" value="{{ old('titre') }}" required
                        placeholder="Ex: Offre Early Bird -20%"
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea name="description" rows="2"
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">{{ old('description') }}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Date début <span class="text-red-400 text-xs">*</span></label>
                    <input type="date" name="date_debut" value="{{ old('date_debut') }}" required
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Date fin <span class="text-red-400 text-xs">*</span></label>
                    <input type="date" name="date_fin" value="{{ old('date_fin') }}" required
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Code promo</label>
                    <input type="text" name="code_promo" value="{{ old('code_promo') }}" maxlength="50"
                        placeholder="Ex: SUMMER2026"
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 uppercase shadow-sm transition-colors focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Réduction affichée (%)</label>
                    <div class="relative">
                        <input type="number" name="remise_pct" value="{{ old('remise_pct', 0) }}" min="0" max="100"
                            placeholder="Ex: 25"
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 shadow-sm transition-colors focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-1.5">Pourcentage affiché publiquement sur la carte de l'offre.</p>
                </div>
            </div>
        </div>

        {{-- Conditions --}}
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6" x-data="conditionsForm()">
            <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4 flex items-center justify-between">
                <div>
                    <h3 class="text-sm font-semibold text-gray-800">Termes & conditions</h3>
                    <p class="text-xs text-gray-400 mt-0.5">Affichés sur la page publique de l'offre (ex: durée min, annulation…)</p>
                </div>
                <button type="button" @click="add()"
                    class="flex items-center gap-1 text-sm text-hotel-600 font-medium hover:text-hotel-700">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Ajouter
                </button>
            </div>
            <div class="p-6 space-y-2">
                <template x-for="(line, i) in lines" :key="i">
                    <div class="flex items-center gap-2">
                        <input type="text" :name="'conditions['+i+']'" x-model="lines[i]"
                            placeholder="Ex: Réservation minimum de 2 nuits"
                            class="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                        <button type="button" @click="remove(i)" x-show="lines.length > 1"
                            class="text-red-400 hover:text-red-600 shrink-0 transition-colors">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </template>
            </div>
        </div>

        {{-- Photo --}}
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                <h3 class="text-sm font-semibold text-gray-800">Photo de l'offre</h3>
            </div>
            <div class="p-6">
                <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 transition-colors hover:border-hotel-400 hover:bg-hotel-50/30">
                    <svg class="h-5 w-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <div class="flex-1 min-w-0">
                        <span class="text-sm text-gray-600">Choisir un fichier…</span>
                        <p class="text-xs text-gray-400 mt-0.5">JPG, PNG ou WebP — max 5 Mo. Optionnel.</p>
                    </div>
                    <input type="file" name="photo" accept="image/*" class="sr-only">
                </label>
            </div>
        </div>

        {{-- Avantages --}}
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4 flex items-center justify-between">
                <h3 class="text-sm font-semibold text-gray-800">Avantages</h3>
                <button type="button" @click="addAvantage()"
                    class="flex items-center gap-1 text-sm text-hotel-600 font-medium hover:text-hotel-700">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Ajouter
                </button>
            </div>
            <div class="p-6 space-y-4">

                <template x-for="(av, index) in avantages" :key="index">
                    <div class="rounded-xl border border-gray-200 bg-gray-50/40 p-4 space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-medium text-gray-500" x-text="'Avantage ' + (index + 1)"></span>
                            <button type="button" @click="removeAvantage(index)" x-show="avantages.length > 1"
                                class="text-red-400 hover:text-red-600 text-xs transition-colors">Supprimer</button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-medium text-gray-500 mb-1">Type d'avantage <span class="text-red-400">*</span></label>
                                <select :name="'avantages['+index+'][type_avantage_id]'" x-model="av.type_avantage_id" required
                                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                                    <option value="">-- Choisir --</option>
                                    @foreach($typesAvantages as $ta)
                                        <option value="{{ $ta->id }}">{{ $ta->nom }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-500 mb-1">Valeur <span class="text-red-400">*</span></label>
                                <input type="text" :name="'avantages['+index+'][valeur]'" x-model="av.valeur" required
                                    placeholder="Ex: 20, 50%, Petit-déjeuner offert"
                                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-500 mb-1">S'applique à <span class="text-red-400">*</span></label>
                                <select :name="'avantages['+index+'][entite_type]'" x-model="av.entite_type" required
                                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                                    <option value="hotel">Hôtel</option>
                                    <option value="propriete">Propriété</option>
                                    <option value="service">Service</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-500 mb-1">Entité <span class="text-red-400">*</span></label>
                                <select :name="'avantages['+index+'][entite_id]'" x-model="av.entite_id" required
                                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
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
        </div>

        <div class="flex items-center gap-3 pt-1">
            <button type="submit"
                class="rounded-xl bg-hotel-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-hotel-700 active:scale-95 transition-all">
                Créer l'offre
            </button>
            <a href="{{ route('hotel.offers.index') }}"
                class="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Annuler
            </a>
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
