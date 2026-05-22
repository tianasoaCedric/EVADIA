@extends('layouts.admin')
@section('title', 'Nouvelle destination - EVADIA Admin')
@section('page_title', 'Nouvelle destination')

@section('content')
    <div class="max-w-2xl">
        <form method="POST" action="{{ route('admin.destinations.store') }}" enctype="multipart/form-data" class="space-y-6">
            @csrf

            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6 space-y-5">

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nom <span class="text-red-500">*</span></label>
                    <input type="text" name="nom" value="{{ old('nom') }}" required
                        class="w-full rounded-xl border-gray-300 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 @error('nom') border-red-400 @enderror">
                    @error('nom')<p class="mt-1 text-xs text-red-500">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows="4"
                        class="w-full rounded-xl border-gray-300 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">{{ old('description') }}</textarea>
                    @error('description')<p class="mt-1 text-xs text-red-500">{{ $message }}</p>@enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                    <input type="file" name="image" accept="image/*"
                        class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 @error('image') border-red-400 @enderror">
                    <p class="mt-1 text-xs text-gray-400">JPG, PNG ou WebP — max 5 Mo</p>
                    @error('image')<p class="mt-1 text-xs text-red-500">{{ $message }}</p>@enderror
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700">
                    Créer la destination
                </button>
                <a href="{{ route('admin.destinations.index') }}"
                    class="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection
