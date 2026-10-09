@extends('layouts.hotel')

@section('title', 'Modifier l\'offre - EVADIA')
@section('page_title', 'Modifier l\'offre')

@section('content')
<div class="max-w-3xl mx-auto space-y-6" x-data="conditionsForm({{ json_encode(old('conditions', $offre->conditions ?? [''])) }})">
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

    <form method="POST" action="{{ route('hotel.offers.update', $offre->id) }}">
        @csrf
        @method('PUT')

        {{-- Informations générales --}}
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                <h3 class="text-sm font-semibold text-gray-800">Informations de l'offre</h3>
            </div>
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Titre <span class="text-red-400 text-xs">*</span></label>
                    <input type="text" name="titre" value="{{ old('titre', $offre->titre) }}" required
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea name="description" rows="2"
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">{{ old('description', $offre->description) }}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Date début <span class="text-red-400 text-xs">*</span></label>
                    <input type="date" name="date_debut"
                        value="{{ old('date_debut', $offre->date_debut ? \Carbon\Carbon::parse($offre->date_debut)->format('Y-m-d') : '') }}" required
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Date fin <span class="text-red-400 text-xs">*</span></label>
                    <input type="date" name="date_fin"
                        value="{{ old('date_fin', $offre->date_fin ? \Carbon\Carbon::parse($offre->date_fin)->format('Y-m-d') : '') }}" required
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Code promo</label>
                    <input type="text" name="code_promo" value="{{ old('code_promo', $offre->code_promo) }}" maxlength="50"
                        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 uppercase shadow-sm transition-colors focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Réduction affichée (%)</label>
                    <div class="relative">
                        <input type="number" name="remise_pct" value="{{ old('remise_pct', $offre->remise_pct) }}" min="0" max="100"
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 shadow-sm transition-colors focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                </div>
            </div>
        </div>

        {{-- Termes & conditions --}}
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4 flex items-center justify-between">
                <h3 class="text-sm font-semibold text-gray-800">Termes & conditions</h3>
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

        <div class="flex items-center gap-3 pt-1">
            <button type="submit"
                class="rounded-xl bg-hotel-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-hotel-700 active:scale-95 transition-all">
                Enregistrer
            </button>
            <a href="{{ route('hotel.offers.index') }}"
                class="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Annuler
            </a>
        </div>
    </form>

    {{-- Photo (separate form) --}}
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
            <h3 class="text-sm font-semibold text-gray-800">Photo de l'offre</h3>
        </div>
        <div class="p-6">
            @php $photo = $offre->photos->first(); @endphp
            @if($photo)
                <div class="mb-4 flex items-start gap-4">
                    <img src="{{ $photo->url }}" alt="Photo offre" class="h-28 w-44 object-cover rounded-xl border border-gray-200">
                    <form method="POST" action="{{ route('hotel.offers.photo.destroy', [$offre->id, $photo->id]) }}">
                        @csrf @method('DELETE')
                        <button type="submit" class="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                            Supprimer la photo
                        </button>
                    </form>
                </div>
            @endif
            <form method="POST" action="{{ route('hotel.offers.photo.store', $offre->id) }}" enctype="multipart/form-data" class="space-y-3">
                @csrf
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    {{ $photo ? 'Remplacer la photo' : 'Ajouter une photo' }}
                </label>
                <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 transition-colors hover:border-hotel-400 hover:bg-hotel-50/30">
                    <svg class="h-5 w-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <div class="flex-1 min-w-0">
                        <span class="text-sm text-gray-600">Choisir un fichier…</span>
                        <p class="text-xs text-gray-400 mt-0.5">JPG, PNG ou WebP — max 5 Mo</p>
                    </div>
                    <input type="file" name="photo" accept="image/*" class="sr-only">
                </label>
                <button type="submit"
                    class="rounded-xl bg-hotel-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-hotel-700 active:scale-95 transition-all">
                    Enregistrer la photo
                </button>
            </form>
        </div>
    </div>

    {{-- Avantages (read-only) --}}
    @if($offre->avantages && $offre->avantages->count())
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
            <h3 class="text-sm font-semibold text-gray-800">Avantages actuels</h3>
        </div>
        <div class="p-6 space-y-2">
            @foreach($offre->avantages as $av)
                <div class="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm">
                    <span class="font-medium text-gray-700">{{ $av->typeAvantage?->nom ?? 'Type #'.$av->type_avantage_id }}</span>
                    <span class="text-gray-500">Valeur: {{ $av->valeur }}</span>
                    @foreach($av->applications as $app)
                        <span class="text-xs text-gray-400">{{ ucfirst($app->entite_type) }} #{{ $app->entite_id }}</span>
                    @endforeach
                </div>
            @endforeach
            <p class="text-xs text-gray-400 mt-3">Les avantages ne peuvent pas être modifiés après création. Recréez l'offre si nécessaire.</p>
        </div>
    </div>
    @endif

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
