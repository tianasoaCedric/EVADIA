@extends('layouts.admin')
@section('title', 'Nouvelle offre - EVADIA Admin')
@section('page_title', 'Créer une offre')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.offers.index') }}" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">←
            Retour</a>
    </div>

    <div class="max-w-3xl mx-auto">
        <form method="POST" action="{{ route('admin.offers.store') }}" x-data="offreForm()" class="space-y-6">
            @csrf

            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <h3 class="text-sm font-semibold text-gray-800">Informations de l'offre</h3>
                </div>
                <div class="p-6 space-y-5">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Titre <span class="text-red-400 text-xs">*</span></label>
                        <input type="text" name="titre" value="{{ old('titre') }}" required
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea name="description" rows="3"
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">{{ old('description') }}</textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Date début <span class="text-red-400 text-xs">*</span></label>
                            <input type="date" name="date_debut" value="{{ old('date_debut') }}" required
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Date fin <span class="text-red-400 text-xs">*</span></label>
                            <input type="date" name="date_fin" value="{{ old('date_fin') }}" required
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Code promo</label>
                            <div class="flex gap-2">
                                <input type="text" name="code_promo" x-model="codePromo"
                                    class="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-mono text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                                <button type="button" @click="generateCode()"
                                    class="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">Générer</button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
                            <select name="statut"
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="brouillon">Brouillon</option>
                            </select>
                        </div>
                    </div>

                </div>
            </div>

            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4 flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-gray-800">Avantages</h3>
                    <button type="button" @click="addAvantage()"
                        class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">+ Ajouter</button>
                </div>
                <div class="p-6 space-y-4">

                    <template x-for="(avantage, i) in avantages" :key="i">
                        <div class="rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50/40">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-medium text-gray-500" x-text="'Avantage ' + (i + 1)"></span>
                                <button type="button" @click="avantages.splice(i, 1)"
                                    class="text-xs text-red-400 hover:text-red-600 transition-colors">Supprimer</button>
                            </div>
                            <div class="grid grid-cols-3 gap-3">
                                <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Type <span class="text-red-400">*</span></label>
                                    <select :name="'avantages['+i+'][type_avantage_id]'"
                                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                                        @foreach($typesAvantages as $ta)
                                            <option value="{{ $ta->id }}">{{ $ta->nom }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Valeur <span class="text-red-400">*</span></label>
                                    <input type="text" :name="'avantages['+i+'][valeur]'" placeholder="ex: 20%"
                                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Quantité max</label>
                                    <input type="number" :name="'avantages['+i+'][quantite_max]'"
                                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                                </div>
                            </div>
                        </div>
                    </template>

                </div>
            </div>

            <div class="flex items-center gap-3 pt-1">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 active:scale-95 transition-all">
                    Créer l'offre
                </button>
                <a href="{{ route('admin.offers.index') }}"
                    class="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                </a>
            </div>
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
