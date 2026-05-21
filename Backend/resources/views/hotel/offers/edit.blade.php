@extends('layouts.hotel')

@section('title', 'Modifier l\'offre - EVADIA')
@section('page_title', 'Modifier l\'offre')

@section('content')
<div class="max-w-3xl mx-auto space-y-6" x-data="conditionsForm({{ json_encode(old('conditions', $offre->conditions ?? [''])) }})"
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

    <form method="POST" action="{{ route('hotel.offers.update', $offre->id) }}">
        @csrf
        @method('PUT')

        {{-- Infos générales --}}
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Informations de l'offre</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-gray-500 mb-1">Titre *</label>
                    <input type="text" name="titre" value="{{ old('titre', $offre->titre) }}" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <textarea name="description" rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">{{ old('description', $offre->description) }}</textarea>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Date début *</label>
                    <input type="date" name="date_debut" value="{{ old('date_debut', $offre->date_debut ? \Carbon\Carbon::parse($offre->date_debut)->format('Y-m-d') : '') }}" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Date fin *</label>
                    <input type="date" name="date_fin" value="{{ old('date_fin', $offre->date_fin ? \Carbon\Carbon::parse($offre->date_fin)->format('Y-m-d') : '') }}" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Code promo</label>
                    <input type="text" name="code_promo" value="{{ old('code_promo', $offre->code_promo) }}" maxlength="50"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500 uppercase">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Réduction affichée (%)</label>
                    <div class="relative">
                        <input type="number" name="remise_pct" value="{{ old('remise_pct', $offre->remise_pct) }}" min="0" max="100"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                </div>
            </div>
        </div>

        {{-- Termes & conditions --}}
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-gray-900">Termes & conditions</h3>
                <button type="button" @click="add()"
                    class="text-sm text-hotel-600 font-medium hover:text-hotel-700 flex items-center gap-1">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Ajouter
                </button>
            </div>
            <template x-for="(line, i) in lines" :key="i">
                <div class="flex items-center gap-2 mb-2">
                    <input type="text" :name="'conditions['+i+']'" x-model="lines[i]"
                        placeholder="Ex: Réservation minimum de 2 nuits"
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
            @php $photo = $offre->photos->first(); @endphp
            @if($photo)
                <div class="mb-4 flex items-start gap-4">
                    <img src="{{ $photo->url }}" alt="Photo offre" class="h-32 w-48 object-cover rounded-lg border border-gray-200">
                    <form method="POST" action="{{ route('hotel.offers.photo.destroy', [$offre->id, $photo->id]) }}">
                        @csrf @method('DELETE')
                        <button type="submit" class="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                            Supprimer
                        </button>
                    </form>
                </div>
            @endif
            <form method="POST" action="{{ route('hotel.offers.photo.store', $offre->id) }}" enctype="multipart/form-data">
                @csrf
                <label class="block text-xs font-medium text-gray-500 mb-1">
                    {{ $photo ? 'Remplacer la photo' : 'Ajouter une photo' }}
                </label>
                <input type="file" name="photo" accept="image/*"
                    class="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-hotel-50 file:text-hotel-700 hover:file:bg-hotel-100">
                <p class="text-xs text-gray-400 mt-1">JPG, PNG ou WebP. Max 5 Mo.</p>
                <button type="submit" class="mt-3 rounded-lg bg-hotel-600 px-4 py-2 text-sm font-medium text-white hover:bg-hotel-700 transition-colors">
                    Enregistrer la photo
                </button>
            </form>
        </div>

        {{-- Avantages (read-only) --}}
        @if($offre->avantages && $offre->avantages->count())
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Avantages actuels</h3>
            <div class="space-y-3">
                @foreach($offre->avantages as $av)
                    <div class="flex items-center gap-4 px-3 py-2 rounded-lg bg-gray-50 text-sm">
                        <span class="font-medium text-gray-700">{{ $av->typeAvantage?->nom ?? 'Type #'.$av->type_avantage_id }}</span>
                        <span class="text-gray-500">Valeur: {{ $av->valeur }}</span>
                        @foreach($av->applications as $app)
                            <span class="text-xs text-gray-400">{{ ucfirst($app->entite_type) }} #{{ $app->entite_id }}</span>
                        @endforeach
                    </div>
                @endforeach
            </div>
            <p class="text-xs text-gray-400 mt-3">Les avantages ne peuvent pas être modifiés après création. Recréez l'offre si nécessaire.</p>
        </div>
        @endif

        {{-- Submit --}}
        <div class="flex justify-end gap-3">
            <a href="{{ route('hotel.offers.index') }}" class="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Annuler</a>
            <button type="submit" class="rounded-lg bg-hotel-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-hotel-700 transition-colors">Enregistrer</button>
        </div>
    </form>
</div>
@endsection

@push('scripts')
<script>
function conditionsForm(initial) {
    return {
        lines: (initial && initial.length) ? initial : [''],
        add() { this.lines.push(''); },
        remove(i) { if (this.lines.length > 1) this.lines.splice(i, 1); }
    };
}
</script>
@endpush
