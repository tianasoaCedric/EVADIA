@extends('layouts.admin')
@section('title', 'Modifier offre - EVADIA Admin')
@section('page_title', 'Modifier l\'offre')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.offers.show', $offer) }}"
            class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">← Retour</a>
    </div>

    <div class="max-w-3xl">
        <form method="POST" action="{{ route('admin.offers.update', $offer) }}" class="space-y-6">
            @csrf @method('PUT')
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Modifier l'offre</h3>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                    <input type="text" name="titre" value="{{ old('titre', $offer->titre) }}" required
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows="3"
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">{{ old('description', $offer->description) }}</textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date début *</label>
                        <input type="date" name="date_debut"
                            value="{{ old('date_debut', $offer->date_debut?->format('Y-m-d')) }}" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date fin *</label>
                        <input type="date" name="date_fin" value="{{ old('date_fin', $offer->date_fin?->format('Y-m-d')) }}"
                            required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Code promo</label>
                        <input type="text" name="code_promo" value="{{ old('code_promo', $offer->code_promo) }}"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-mono focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <select name="statut"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                            @foreach(['active', 'inactive', 'brouillon'] as $s)
                                <option value="{{ $s }}" {{ $offer->statut === $s ? 'selected' : '' }}>{{ ucfirst($s) }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
            </div>
            <div class="flex gap-3">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-evadia-700">Enregistrer</button>
                <a href="{{ route('admin.offers.show', $offer) }}"
                    class="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Annuler</a>
            </div>
        </form>
    </div>
@endsection