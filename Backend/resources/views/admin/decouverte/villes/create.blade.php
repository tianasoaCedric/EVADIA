@extends('layouts.admin')
@section('title', 'Nouvelle ville - EVADIA Admin')
@section('page_title', 'Nouvelle ville')

@section('content')
    <div class="max-w-2xl">
        <form method="POST" action="{{ route('admin.decouverte.villes.store') }}" enctype="multipart/form-data"
            class="space-y-6">
            @csrf

            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6 space-y-5">
                <h2 class="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">Informations</h2>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nom de la ville <span class="text-red-500">*</span></label>
                    <input type="text" name="nom" value="{{ old('nom') }}" required
                        class="w-full rounded-xl border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 @error('nom') border-red-400 @enderror">
                    @error('nom') <p class="mt-1 text-xs text-red-500">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Image de couverture</label>
                    <input type="file" name="image" accept="image/*"
                        class="w-full text-sm text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-evadia-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-evadia-700 hover:file:bg-evadia-100">
                    @error('image') <p class="mt-1 text-xs text-red-500">{{ $message }}</p> @enderror
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                        <input type="number" name="ordre" value="{{ old('ordre', 0) }}" min="0"
                            class="w-full rounded-xl border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                    <div class="flex items-end pb-0.5">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="hidden" name="actif" value="0">
                            <input type="checkbox" name="actif" value="1" {{ old('actif', true) ? 'checked' : '' }}
                                class="rounded border-gray-300 text-evadia-600 focus:ring-evadia-500">
                            <span class="text-sm font-medium text-gray-700">Ville active</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700">
                    Créer la ville
                </button>
                <a href="{{ route('admin.decouverte.villes.index') }}"
                    class="rounded-xl px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100">
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection
