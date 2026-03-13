@extends('layouts.admin')
@section('title', 'Modifier abonnement - EVADIA Admin')
@section('page_title', 'Modifier abonnement')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.subscriptions.show', $subscription) }}"
            class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">← Retour</a>
    </div>

    <div class="max-w-2xl">
        <form method="POST" action="{{ route('admin.subscriptions.update', $subscription) }}"
            class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
            @csrf @method('PUT')
            <h3 class="text-lg font-semibold text-gray-900">Modifier l'abonnement</h3>
            <div class="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p class="text-sm text-gray-600">🏨 <strong>{{ $subscription->hotel?->nom }}</strong></p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select name="type_abonnement" required
                    class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    @foreach(['basic', 'premium', 'enterprise'] as $type)
                        <option value="{{ $type }}" {{ $subscription->type_abonnement === $type ? 'selected' : '' }}>
                            {{ ucfirst($type) }}</option>
                    @endforeach
                </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Date début *</label>
                    <input type="date" name="date_debut" value="{{ $subscription->date_debut?->format('Y-m-d') }}" required
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                    <input type="date" name="date_fin" value="{{ $subscription->date_fin?->format('Y-m-d') }}"
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Prix mensuel *</label>
                    <input type="number" name="prix_mensuel" step="0.01" value="{{ $subscription->prix_mensuel }}" required
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                    <input type="text" name="devise" value="{{ $subscription->devise }}" maxlength="3"
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>
            </div>
            <div class="flex gap-3">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-evadia-700">Enregistrer</button>
                <a href="{{ route('admin.subscriptions.show', $subscription) }}"
                    class="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Annuler</a>
            </div>
        </form>
    </div>
@endsection