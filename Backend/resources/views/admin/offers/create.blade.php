@extends('layouts.admin')
@section('title', 'Nouvelle offre - EVADIA Admin')
@section('page_title', 'Créer une offre')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.offers.index') }}" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">←
            Retour</a>
    </div>

    <div class="max-w-3xl">
        <form method="POST" action="{{ route('admin.offers.store') }}" x-data="offreForm()" class="space-y-6">
            @csrf
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Informations de l'offre</h3>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                    <input type="text" name="titre" value="{{ old('titre') }}" required
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows="3"
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">{{ old('description') }}</textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date début *</label>
                        <input type="date" name="date_debut" value="{{ old('date_debut') }}" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date fin *</label>
                        <input type="date" name="date_fin" value="{{ old('date_fin') }}" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Code promo</label>
                        <div class="flex gap-2">
                            <input type="text" name="code_promo" x-model="codePromo"
                                class="flex-1 rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-mono focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                            <button type="button" @click="generateCode()"
                                class="rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">Générer</button>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <select name="statut"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="brouillon">Brouillon</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Avantages -->
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900">Avantages</h3>
                    <button type="button" @click="addAvantage()"
                        class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">+ Ajouter</button>
                </div>

                <template x-for="(avantage, i) in avantages" :key="i">
                    <div class="rounded-xl border border-gray-200 p-4 space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-medium text-gray-500" x-text="'Avantage ' + (i + 1)"></span>
                            <button type="button" @click="avantages.splice(i, 1)"
                                class="text-xs text-red-500 hover:text-red-700">Supprimer</button>
                        </div>
                        <div class="grid grid-cols-3 gap-3">
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Type *</label>
                                <select :name="'avantages['+i+'][type_avantage_id]'"
                                    class="w-full rounded-lg border-gray-300 bg-gray-50 px-3 py-2 text-sm">
                                    @foreach($typesAvantages as $ta)
                                        <option value="{{ $ta->id }}">{{ $ta->nom }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Valeur *</label>
                                <input type="text" :name="'avantages['+i+'][valeur]'" placeholder="ex: 20%"
                                    class="w-full rounded-lg border-gray-300 bg-gray-50 px-3 py-2 text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Quantité max</label>
                                <input type="number" :name="'avantages['+i+'][quantite_max]'"
                                    class="w-full rounded-lg border-gray-300 bg-gray-50 px-3 py-2 text-sm">
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <button type="submit"
                class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-evadia-700 transition-colors">Créer
                l'offre</button>
        </form>
    </div>
@endsection

@push('scripts')
    <script>
        function offreForm() {
            return {
                codePromo: '',
                avantages: [{}],
                addAvantage() { this.avantages.push({}); },
                async generateCode() {
                    const res = await fetch('{{ route("admin.offers.generate-promo") }}');
                    const data = await res.json();
                    this.codePromo = data.code;
                }
            }
        }
    </script>
@endpush