@extends('layouts.admin')
@section('title', 'Nouvel abonnement - EVADIA Admin')
@section('page_title', 'Nouvel abonnement')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.subscriptions.index') }}"
            class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">← Retour</a>
    </div>

    <div class="max-w-2xl mx-auto">
        <form method="POST" action="{{ route('admin.subscriptions.store') }}" class="space-y-6">
            @csrf

            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <h3 class="text-sm font-semibold text-gray-800">Créer un abonnement</h3>
                </div>
                <div class="p-6 space-y-5">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Hôtel <span class="text-red-400 text-xs">*</span></label>
                        <select name="hotel_id" required
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                            <option value="">Sélectionner</option>
                            @foreach($hotels as $hotel)
                                <option value="{{ $hotel->id }}" @selected((int) old('hotel_id', $hotelId) === $hotel->id)>{{ $hotel->nom }}</option>
                            @endforeach
                        </select>
                        @error('hotel_id') <p class="mt-1.5 text-xs text-red-500">{{ $message }}</p> @enderror
                    </div>

                    @php $premiere = $plans->first(); @endphp
                    @include('admin.subscriptions.partials.formule', [
                        'plans'     => $plans,
                        'selection' => old('type_abonnement', $premiere?->code ?? ''),
                        'prix'      => old('prix_mensuel', $premiere?->prix ?? ''),
                        'devise'    => old('devise', $premiere?->devise ?? 'MGA'),
                    ])

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Date début <span class="text-red-400 text-xs">*</span></label>
                            <input type="date" name="date_debut" value="{{ old('date_debut', now()->format('Y-m-d')) }}" required
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Date fin</label>
                            <input type="date" name="date_fin" value="{{ old('date_fin', today()->addMonthNoOverflow()->format('Y-m-d')) }}"
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                        </div>
                    </div>

                    <p class="text-xs text-gray-500">
                        Le premier mois (du début à la fin) est enregistré comme payé. Pour un changement de formule, ce nouvel abonnement remplace l'ancien dans le suivi.
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-3 pt-1">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 active:scale-95 transition-all">
                    Créer l'abonnement
                </button>
                <a href="{{ route('admin.subscriptions.index') }}"
                    class="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection
