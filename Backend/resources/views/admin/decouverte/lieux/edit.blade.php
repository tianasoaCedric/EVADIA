@extends('layouts.admin')
@section('title', 'Modifier le lieu - EVADIA Admin')
@section('page_title', 'Modifier : ' . $lieu->nom)

@section('content')
    <div class="max-w-2xl">
        <form method="POST" action="{{ route('admin.decouverte.villes.lieux.update', [$ville, $lieu]) }}" enctype="multipart/form-data"
            class="space-y-6">
            @csrf @method('PUT')

            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6 space-y-5">
                <h2 class="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">
                    Informations du lieu
                </h2>

                {{-- Titre --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Titre <span class="text-red-500">*</span>
                    </label>
                    <input type="text" name="nom" value="{{ old('nom', $lieu->nom) }}" required
                        class="w-full rounded-xl border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 @error('nom') border-red-400 @enderror">
                    @error('nom') <p class="mt-1 text-xs text-red-500">{{ $message }}</p> @enderror
                </div>

                {{-- Emplacement --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Emplacement</label>
                    <input type="text" name="emplacement" value="{{ old('emplacement', $lieu->emplacement) }}"
                        placeholder="Ex : Paris, France"
                        class="w-full rounded-xl border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    @error('emplacement') <p class="mt-1 text-xs text-red-500">{{ $message }}</p> @enderror
                </div>

                {{-- Description --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows="5"
                        class="w-full rounded-xl border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">{{ old('description', $lieu->description) }}</textarea>
                </div>

                {{-- Photos existantes --}}
                @if($lieu->images && count($lieu->images) > 0)
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Photos actuelles
                            <span class="text-xs text-gray-400 font-normal ml-1">— cochez pour supprimer</span>
                        </label>
                        <div class="grid grid-cols-3 gap-3">
                            @foreach($lieu->images as $path)
                                <label class="relative group cursor-pointer">
                                    <input type="checkbox" name="delete_images[]" value="{{ $path }}" class="peer sr-only">
                                    <img src="{{ Storage::disk('s3')->url($path) }}" alt="Photo"
                                        class="h-24 w-full object-cover rounded-xl ring-2 ring-transparent peer-checked:ring-red-400 transition-all">
                                    <div class="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                                        <span class="text-white text-xs font-semibold peer-checked:text-red-300">✕ Supprimer</span>
                                    </div>
                                </label>
                            @endforeach
                        </div>
                    </div>
                @endif

                {{-- Nouvelles photos --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Ajouter des photos
                        <span class="text-xs text-gray-400 font-normal ml-1">(s'ajoutent aux existantes)</span>
                    </label>
                    <input type="file" name="images[]" accept="image/*" multiple
                        class="w-full text-sm text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-evadia-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-evadia-700 hover:file:bg-evadia-100">
                    <p class="mt-1 text-xs text-gray-400">JPG, PNG, WebP · Max 4 Mo par photo.</p>
                </div>

                {{-- Options --}}
                <div class="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Position image <span class="text-red-500">*</span>
                        </label>
                        <select name="position_image" required
                            class="w-full rounded-xl border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                            <option value="left" {{ old('position_image', $lieu->position_image) === 'left' ? 'selected' : '' }}>Gauche</option>
                            <option value="right" {{ old('position_image', $lieu->position_image) === 'right' ? 'selected' : '' }}>Droite</option>
                        </select>
                        <p class="mt-1 text-xs text-gray-400">Côté où s'affiche la photo dans l'article.</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                        <input type="number" name="ordre" value="{{ old('ordre', $lieu->ordre) }}" min="0"
                            class="w-full rounded-xl border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                    <div class="flex items-end pb-1">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="hidden" name="actif" value="0">
                            <input type="checkbox" name="actif" value="1" {{ old('actif', $lieu->actif) ? 'checked' : '' }}
                                class="rounded border-gray-300 text-evadia-600 focus:ring-evadia-500">
                            <span class="text-sm font-medium text-gray-700">Actif</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700">
                    Enregistrer
                </button>
                <a href="{{ route('admin.decouverte.villes.show', $ville) }}"
                    class="rounded-xl px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100">
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection
