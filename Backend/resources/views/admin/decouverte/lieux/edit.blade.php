@extends('layouts.admin')
@section('title', 'Modifier le lieu - EVADIA Admin')
@section('page_title', 'Modifier : ' . $lieu->nom)

@section('content')
    <div class="max-w-2xl mx-auto">
        <form method="POST" action="{{ route('admin.decouverte.villes.lieux.update', [$ville, $lieu]) }}" enctype="multipart/form-data"
            class="space-y-6">
            @csrf @method('PUT')

            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <h3 class="text-sm font-semibold text-gray-800">Informations du lieu</h3>
                </div>
                <div class="p-6 space-y-5">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">
                            Titre <span class="text-red-400 text-xs">*</span>
                        </label>
                        <input type="text" name="nom" value="{{ old('nom', $lieu->nom) }}" required
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none @error('nom') border-red-400 bg-red-50/40 @enderror">
                        @error('nom') <p class="mt-1.5 text-xs text-red-500">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Emplacement</label>
                        <input type="text" name="emplacement" value="{{ old('emplacement', $lieu->emplacement) }}"
                            placeholder="Ex : Paris, France"
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                        @error('emplacement') <p class="mt-1.5 text-xs text-red-500">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea name="description" rows="5"
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">{{ old('description', $lieu->description) }}</textarea>
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
                                            <span class="text-white text-xs font-semibold">✕ Supprimer</span>
                                        </div>
                                    </label>
                                @endforeach
                            </div>
                        </div>
                    @endif

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">
                            Ajouter des photos
                            <span class="text-xs text-gray-400 font-normal ml-1">(s'ajoutent aux existantes)</span>
                        </label>
                        <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 transition-colors hover:border-evadia-400 hover:bg-evadia-50/30">
                            <svg class="h-5 w-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <div class="flex-1 min-w-0">
                                <span class="text-sm text-gray-600">Choisir des fichiers…</span>
                                <p class="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · Max 4 Mo par photo</p>
                            </div>
                            <input type="file" name="images[]" accept="image/*" multiple class="sr-only">
                        </label>
                    </div>

                    <div class="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">
                                Position image <span class="text-red-400 text-xs">*</span>
                            </label>
                            <select name="position_image" required
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                                <option value="left" {{ old('position_image', $lieu->position_image) === 'left' ? 'selected' : '' }}>Gauche</option>
                                <option value="right" {{ old('position_image', $lieu->position_image) === 'right' ? 'selected' : '' }}>Droite</option>
                            </select>
                            <p class="mt-1 text-xs text-gray-400">Côté où s'affiche la photo dans l'article.</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Ordre d'affichage</label>
                            <input type="number" name="ordre" value="{{ old('ordre', $lieu->ordre) }}" min="0"
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
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
            </div>

            <div class="flex items-center gap-3 pt-1">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 active:scale-95 transition-all">
                    Enregistrer
                </button>
                <a href="{{ route('admin.decouverte.villes.show', $ville) }}"
                    class="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection
