@extends('layouts.hotel')

@section('title', 'Modifier ' . $propriete->nom . ' - EVADIA')
@section('page_title', 'Modifier la chambre')

@section('content')
<div class="max-w-4xl mx-auto space-y-6" x-data="{
    equipements: @js($propriete->equipements->mapWithKeys(fn($eq) => [$eq->id => ['id' => $eq->id, 'quantite' => $eq->pivot->quantite]])->toArray()),
    toggleEquipement(id) {
        if (this.equipements[id]) { delete this.equipements[id]; }
        else { this.equipements[id] = { id: id, quantite: 1 }; }
    }
}">
    {{-- Header --}}
    <div class="flex items-center justify-between">
        <a href="{{ route('hotel.rooms.show', $propriete->id) }}" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Retour à la fiche
        </a>
    </div>

    @if($errors->any())
        <div class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <ul class="list-disc list-inside space-y-1">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('hotel.rooms.update', $propriete->id) }}" enctype="multipart/form-data">
        @csrf
        @method('PUT')

        {{-- Informations générales --}}
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Informations générales</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-gray-500 mb-1">Nom *</label>
                    <input type="text" name="nom" value="{{ old('nom', $propriete->nom) }}" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <textarea name="description" rows="3"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">{{ old('description', $propriete->description) }}</textarea>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Type *</label>
                    <select name="type_propriete" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                        @foreach(['chambre','suite','villa','appartement','bungalow','studio'] as $t)
                            <option value="{{ $t }}" {{ old('type_propriete', $propriete->type_propriete) === $t ? 'selected' : '' }}>{{ ucfirst($t) }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Capacité (pers.) *</label>
                    <input type="number" name="capacite" value="{{ old('capacite', $propriete->capacite) }}" min="1" required
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Nb chambres</label>
                    <input type="number" name="nb_chambres" value="{{ old('nb_chambres', $propriete->nb_chambres) }}" min="0"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Nb lits</label>
                    <input type="number" name="nb_lits" value="{{ old('nb_lits', $propriete->nb_lits) }}" min="0"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Nb salles de bain</label>
                    <input type="number" name="nb_salles_bain" value="{{ old('nb_salles_bain', $propriete->nb_salles_bain) }}" min="0"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Superficie (m²)</label>
                    <input type="number" name="superficie" value="{{ old('superficie', $propriete->superficie) }}" min="1"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                </div>
            </div>
        </div>

        {{-- Équipements --}}
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Équipements</h3>
            @foreach($equipements as $categorie => $eqs)
                <div class="mb-4">
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{{ $categorie }}</p>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                        @foreach($eqs as $eq)
                            <label class="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors"
                                :class="equipements[{{ $eq->id }}] ? 'border-hotel-300 bg-hotel-50' : 'border-gray-200 hover:bg-gray-50'"
                                @click="toggleEquipement({{ $eq->id }})">
                                <div class="h-4 w-4 rounded border flex items-center justify-center shrink-0"
                                    :class="equipements[{{ $eq->id }}] ? 'bg-hotel-600 border-hotel-600' : 'border-gray-300'">
                                    <svg x-show="equipements[{{ $eq->id }}]" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <span class="text-gray-700">{{ $eq->nom }}</span>
                                <input x-show="equipements[{{ $eq->id }}]" type="number" min="1"
                                    x-model="equipements[{{ $eq->id }}] && equipements[{{ $eq->id }}].quantite"
                                    class="w-14 ml-auto rounded border border-gray-300 px-2 py-0.5 text-xs text-center focus:border-hotel-500 focus:ring-hotel-500"
                                    @click.stop>
                            </label>
                        @endforeach
                    </div>
                </div>
            @endforeach

            {{-- Hidden inputs for equipements --}}
            <template x-for="(eq, id) in equipements" :key="id">
                <div>
                    <input type="hidden" :name="'equipements['+id+'][id]'" :value="id">
                    <input type="hidden" :name="'equipements['+id+'][quantite]'" :value="eq.quantite">
                </div>
            </template>
        </div>

        {{-- Submit --}}
        <div class="flex justify-end gap-3">
            <a href="{{ route('hotel.rooms.show', $propriete->id) }}" class="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Annuler</a>
            <button type="submit" class="rounded-lg bg-hotel-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-hotel-700 transition-colors">Enregistrer les modifications</button>
        </div>
    </form>

    {{-- Photos (hors du formulaire principal pour éviter l'imbrication) --}}
    <div class="bg-white rounded-xl border border-gray-200 p-6"
         x-data="{
             dragging: null,
             order: @js($propriete->photos->pluck('id')->toArray()),
             dragStart(id) { this.dragging = id; },
             dragOver(id) {
                 if (this.dragging === null || this.dragging === id) return;
                 const from = this.order.indexOf(this.dragging);
                 const to   = this.order.indexOf(id);
                 this.order.splice(from, 1);
                 this.order.splice(to, 0, this.dragging);
             },
             async saveOrder() {
                 await fetch('{{ route('hotel.rooms.photos.reorder', $propriete->id) }}', {
                     method: 'PATCH',
                     headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content },
                     body: JSON.stringify({ order: this.order })
                 });
             }
         }">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Photos</h3>

        {{-- Photos existantes --}}
        @if($propriete->photos->isNotEmpty())
            <p class="text-xs text-gray-400 mb-3">Faites glisser pour réordonner. La première photo sera la photo principale.</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-5">
                @foreach($propriete->photos->sortBy('ordre') as $photo)
                    <div class="relative group rounded-lg overflow-hidden bg-gray-100 aspect-[4/3] cursor-grab"
                         draggable="true"
                         @dragstart="dragStart({{ $photo->id }})"
                         @dragover.prevent="dragOver({{ $photo->id }})"
                         @dragend="saveOrder()"
                         :class="order.indexOf({{ $photo->id }}) === 0 ? 'ring-2 ring-hotel-500' : ''">
                        <img src="{{ $photo->url }}" alt="Photo" class="w-full h-full object-cover">
                        @if($loop->first)
                            <span class="absolute top-1 left-1 bg-hotel-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">Principale</span>
                        @endif
                        <form method="POST" action="{{ route('hotel.rooms.photos.destroy', [$propriete->id, $photo->id]) }}"
                              class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onsubmit="return confirm('Supprimer cette photo ?')">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition-colors">
                                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </form>
                    </div>
                @endforeach
            </div>
        @else
            <p class="text-sm text-gray-400 mb-4">Aucune photo pour l'instant.</p>
        @endif

        {{-- Upload nouvelles photos --}}
        <form method="POST" action="{{ route('hotel.rooms.photos.store', $propriete->id) }}" enctype="multipart/form-data"
              x-data="{ files: [] }">
            @csrf
            <div class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-hotel-300 transition-colors">
                <svg class="h-8 w-8 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 18.75h.008v.008H18v-.008zm-6 0h.008v.008H12v-.008z"/>
                </svg>
                <p class="text-xs text-gray-400 mb-3">Ajouter des photos (max 5 Mo par fichier)</p>
                <input type="file" name="photos[]" multiple accept="image/*"
                    class="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-hotel-50 file:text-hotel-700 hover:file:bg-hotel-100"
                    @change="files = Array.from($event.target.files)">
                <template x-if="files.length > 0">
                    <p class="mt-2 text-xs text-hotel-600" x-text="files.length + ' fichier(s) sélectionné(s)'"></p>
                </template>
            </div>
            <div class="mt-3 flex justify-end">
                <button type="submit" class="rounded-lg bg-hotel-600 px-4 py-2 text-xs font-medium text-white hover:bg-hotel-700 transition-colors">
                    Uploader les photos
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
