@extends('layouts.admin')
@section('title', 'Modifier ' . $hotel->nom . ' - EVADIA Admin')
@section('page_title', 'Modifier l\'hôtel')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.hotels.show', $hotel) }}"
            class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">← Retour à l'hôtel</a>
    </div>

    <div class="max-w-3xl">
        <form method="POST" action="{{ route('admin.hotels.update', $hotel) }}" class="space-y-6">
            @csrf @method('PUT')

            <!-- General Info -->
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Informations générales</h3>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input type="text" name="nom" value="{{ old('nom', $hotel->nom) }}" required
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows="3"
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">{{ old('description', $hotel->description) }}</textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email contact</label>
                        <input type="email" name="email_contact" value="{{ old('email_contact', $hotel->email_contact) }}"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input type="tel" name="telephone" value="{{ old('telephone', $hotel->telephone) }}"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                        <input type="url" name="site_web" value="{{ old('site_web', $hotel->site_web) }}"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Étoiles</label>
                        <select name="etoiles"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                            <option value="">—</option>
                            @for($i = 1; $i <= 5; $i++)
                                <option value="{{ $i }}" {{ old('etoiles', $hotel->etoiles) == $i ? 'selected' : '' }}>{{ $i }} ★
                                </option>
                            @endfor
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Types d'hôtel *</label>
                    <div class="flex flex-wrap gap-2">
                        @foreach($types as $type)
                            <label
                                class="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 cursor-pointer hover:border-evadia-300 has-[:checked]:border-evadia-500 has-[:checked]:bg-evadia-50 transition-all">
                                <input type="checkbox" name="types[]" value="{{ $type->id }}" {{ in_array($type->id, old('types', $hotel->types->pluck('id')->toArray())) ? 'checked' : '' }}
                                    class="h-3.5 w-3.5 rounded border-gray-300 text-evadia-600">
                                <span class="text-sm text-gray-700">{{ $type->nom }}</span>
                            </label>
                        @endforeach
                    </div>
                </div>
            </div>

            <!-- Address -->
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Adresse</h3>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Adresse ligne 1 *</label>
                    <input type="text" name="adresse_ligne1"
                        value="{{ old('adresse_ligne1', $hotel->adresse?->adresse_ligne1) }}" required
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                        <input type="text" name="code_postal"
                            value="{{ old('code_postal', $hotel->adresse?->code_postal) }}" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                        <input type="text" name="ville" value="{{ old('ville', $hotel->adresse?->ville) }}" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
                        <input type="text" name="pays" value="{{ old('pays', $hotel->adresse?->pays) }}" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                    <select name="destination_id" required
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                        @foreach($destinations as $dest)
                            <option value="{{ $dest->id }}" {{ $hotel->destinations->contains('id', $dest->id) ? 'selected' : '' }}>{{ $dest->nom }}</option>
                        @endforeach
                    </select>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-evadia-700 transition-colors">Enregistrer</button>
                <a href="{{ route('admin.hotels.show', $hotel) }}"
                    class="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Annuler</a>
            </div>
        </form>
    </div>
@endsection