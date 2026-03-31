@extends('layouts.admin')
@section('title', 'Nouvel abonnement - EVADIA Admin')
@section('page_title', 'Nouvel abonnement')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.subscriptions.index') }}"
            class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">← Retour</a>
    </div>

    <div class="max-w-2xl mx-auto">
        <form method="POST" action="{{ route('admin.subscriptions.store') }}"
            class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
            @csrf
            <h3 class="text-lg font-semibold text-gray-900">Créer un abonnement</h3>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hôtel *</label>
                <select name="hotel_id" required
                    class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    <option value="">Sélectionner</option>
                    @foreach($hotels as $hotel)
                        <option value="{{ $hotel->id }}">{{ $hotel->nom }}</option>
                    @endforeach
                </select>
                @error('hotel_id') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select name="type_abonnement" required
                    class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Date début *</label>
                    <input type="date" name="date_debut" value="{{ old('date_debut', now()->format('Y-m-d')) }}" required
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                    <input type="date" name="date_fin" value="{{ old('date_fin') }}"
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Prix mensuel *</label>
                    <input type="number" name="prix_mensuel" step="0.01" value="{{ old('prix_mensuel') }}" required
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                    <input type="text" name="devise" value="{{ old('devise', 'EUR') }}" maxlength="3"
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>
            </div>
            <button type="submit"
                class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-evadia-700 transition-colors">Créer
                l'abonnement</button>
        </form>
    </div>
@endsection