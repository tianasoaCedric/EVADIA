@extends('layouts.admin')
@section('title', "Modifier type d'hébergement - EVADIA Admin")
@section('page_title', 'Modifier : ' . $type->nom)

@section('content')
    <div class="max-w-2xl mx-auto">
        <form method="POST" action="{{ route('admin.types-hebergement.update', $type) }}" enctype="multipart/form-data" class="space-y-6">
            @csrf @method('PUT')

            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <h3 class="text-sm font-semibold text-gray-800">Informations</h3>
                </div>
                <div class="p-6 space-y-5">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom <span class="text-red-400 text-xs">*</span></label>
                        <input type="text" name="nom" value="{{ old('nom', $type->nom) }}" required
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none @error('nom') border-red-400 bg-red-50/40 @enderror">
                        @error('nom')<p class="mt-1.5 text-xs text-red-500">{{ $message }}</p>@enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea name="description" rows="4"
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">{{ old('description', $type->description) }}</textarea>
                    </div>

                    <div x-data="fileInputPreview()">
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Icône / Photo carte</label>
                        <p class="text-xs text-gray-400 mb-1.5">Affichée dans la liste des types d'hébergement.</p>
                        <template x-if="!previews.length && {{ $type->image ? 'true' : 'false' }}">
                            <div class="mb-3 flex items-center gap-3">
                                <img src="{{ Storage::disk('s3')->url($type->image ?? '') }}" alt="{{ $type->nom }}"
                                    class="h-20 w-32 rounded-xl object-cover ring-1 ring-gray-200">
                                <p class="text-xs text-gray-400">Image actuelle — téléversez-en une nouvelle pour la remplacer</p>
                            </div>
                        </template>
                        <template x-if="previews.length">
                            <div class="mb-3 flex items-center gap-3">
                                <img :src="previews[0]" class="h-20 w-32 rounded-xl object-cover ring-1 ring-gray-200">
                                <p class="text-xs text-gray-400">Nouvelle image sélectionnée</p>
                            </div>
                        </template>
                        <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 transition-colors hover:border-evadia-400 hover:bg-evadia-50/30 @error('image') border-red-400 @enderror">
                            <svg class="h-5 w-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <div class="flex-1 min-w-0">
                                <span class="text-sm text-gray-600">Choisir un fichier…</span>
                                <p class="text-xs text-gray-400 mt-0.5">JPG, PNG ou WebP — max 5 Mo</p>
                            </div>
                            <input type="file" name="image" accept="image/*" class="sr-only" @change="onChange($event)">
                        </label>
                        @error('image')<p class="mt-1.5 text-xs text-red-500">{{ $message }}</p>@enderror
                    </div>

                    <div x-data="fileInputPreview()">
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Photo de fond (background)</label>
                        <p class="text-xs text-gray-400 mb-1.5">Affichée en fond sur la page listant les hôtels de ce type.</p>
                        <template x-if="!previews.length && {{ $type->image_background ? 'true' : 'false' }}">
                            <div class="mb-3 flex items-center gap-3">
                                <img src="{{ Storage::disk('s3')->url($type->image_background ?? '') }}" alt="{{ $type->nom }} background"
                                    class="h-20 w-32 rounded-xl object-cover ring-1 ring-gray-200">
                                <p class="text-xs text-gray-400">Image actuelle — téléversez-en une nouvelle pour la remplacer</p>
                            </div>
                        </template>
                        <template x-if="previews.length">
                            <div class="mb-3 flex items-center gap-3">
                                <img :src="previews[0]" class="h-20 w-32 rounded-xl object-cover ring-1 ring-gray-200">
                                <p class="text-xs text-gray-400">Nouvelle image sélectionnée</p>
                            </div>
                        </template>
                        <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 transition-colors hover:border-evadia-400 hover:bg-evadia-50/30 @error('image_background') border-red-400 @enderror">
                            <svg class="h-5 w-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <div class="flex-1 min-w-0">
                                <span class="text-sm text-gray-600">Choisir un fichier…</span>
                                <p class="text-xs text-gray-400 mt-0.5">JPG, PNG ou WebP — max 5 Mo</p>
                            </div>
                            <input type="file" name="image_background" accept="image/*" class="sr-only" @change="onChange($event)">
                        </label>
                        @error('image_background')<p class="mt-1.5 text-xs text-red-500">{{ $message }}</p>@enderror
                    </div>

                </div>
            </div>

            <div class="flex items-center gap-3 pt-1">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 active:scale-95 transition-all">
                    Enregistrer
                </button>
                <a href="{{ route('admin.types-hebergement.index') }}"
                    class="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection
