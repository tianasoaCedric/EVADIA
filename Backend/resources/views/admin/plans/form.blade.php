@extends('layouts.admin')
@section('title', ($plan->exists ? 'Modifier la formule' : 'Nouvelle formule') . ' - EVADIA Admin')
@section('page_title', $plan->exists ? 'Modifier la formule ' . $plan->nom : 'Nouvelle formule')

@php
    $input = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none';
    $features = old('features', $plan->features ?? []);
    // Après une erreur de validation, « inclus » revient en "0"/"1" : on le remet en booléen pour Alpine.
    $features = collect($features)->map(fn($f) => ['inclus' => (bool) ($f['inclus'] ?? false), 'texte' => $f['texte'] ?? ''])->values()->all();
    if (count($features) === 0) { $features = [['inclus' => true, 'texte' => '']]; }
@endphp

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.plans.index') }}" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">← Retour</a>
    </div>

    <div class="max-w-2xl mx-auto">
        <form method="POST" action="{{ $plan->exists ? route('admin.plans.update', $plan) : route('admin.plans.store') }}" class="space-y-6">
            @csrf
            @if($plan->exists) @method('PUT') @endif

            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <h3 class="text-sm font-semibold text-gray-800">Formule</h3>
                </div>
                <div class="p-6 space-y-5">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom <span class="text-red-400 text-xs">*</span></label>
                            <input type="text" name="nom" value="{{ old('nom', $plan->nom) }}" required maxlength="100" class="{{ $input }}" placeholder="Signature">
                            @error('nom') <p class="mt-1.5 text-xs text-red-500">{{ $message }}</p> @enderror
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Code <span class="text-red-400 text-xs">*</span></label>
                            @if($plan->exists)
                                <input type="text" value="{{ $plan->code }}" disabled class="{{ $input }} bg-gray-50 text-gray-500">
                                <p class="mt-1.5 text-xs text-gray-400">Non modifiable : il identifie la formule dans les abonnements.</p>
                            @else
                                <input type="text" name="code" value="{{ old('code') }}" required maxlength="50" pattern="[a-z0-9_-]+" class="{{ $input }}" placeholder="signature">
                                <p class="mt-1.5 text-xs text-gray-400">Minuscules, sans espace. Non modifiable ensuite.</p>
                                @error('code') <p class="mt-1.5 text-xs text-red-500">{{ $message }}</p> @enderror
                            @endif
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Libellé du badge <span class="text-red-400 text-xs">*</span></label>
                            <input type="text" name="label" value="{{ old('label', $plan->label) }}" required maxlength="50" class="{{ $input }}" placeholder="SIGNATURE">
                            @error('label') <p class="mt-1.5 text-xs text-red-500">{{ $message }}</p> @enderror
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Couleur <span class="text-red-400 text-xs">*</span></label>
                            @php $couleurActuelle = old('couleur', $plan->exists ? \App\Http\Controllers\Admin\PlanController::couleurDe($plan) : 'gris'); @endphp
                            <select name="couleur" required class="{{ $input }}">
                                @foreach($couleurs as $cle => $c)
                                    <option value="{{ $cle }}" @selected($couleurActuelle === $cle)>{{ $c['label'] }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <input type="text" name="description" value="{{ old('description', $plan->description) }}" maxlength="255" class="{{ $input }}" placeholder="Visibilité maximale et prestige">
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Prix mensuel <span class="text-red-400 text-xs">*</span></label>
                            <input type="number" name="prix" step="0.01" min="0" value="{{ old('prix', $plan->prix) }}" required class="{{ $input }}">
                            @error('prix') <p class="mt-1.5 text-xs text-red-500">{{ $message }}</p> @enderror
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Devise <span class="text-red-400 text-xs">*</span></label>
                            <select name="devise" class="{{ $input }}">
                                @foreach(['MGA', 'EUR'] as $d)
                                    <option value="{{ $d }}" @selected(old('devise', $plan->devise) === $d)>{{ $d }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Ordre d'affichage</label>
                            <input type="number" name="ordre" min="0" max="255" value="{{ old('ordre', $plan->ordre) }}" required class="{{ $input }}">
                        </div>
                    </div>
                    @if($plan->exists)
                        <p class="text-xs text-gray-500">Un nouveau prix s'applique aux prochains abonnements. Les abonnements en cours gardent leur prix.</p>
                    @endif

                    <label class="flex items-center gap-2 text-sm text-gray-700">
                        <input type="hidden" name="est_actif" value="0">
                        <input type="checkbox" name="est_actif" value="1" @checked(old('est_actif', $plan->est_actif)) class="rounded border-gray-300 text-evadia-600">
                        Formule active (proposée aux nouveaux abonnements)
                    </label>
                </div>
            </div>

            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden"
                x-data="{ lignes: {{ \Illuminate\Support\Js::from($features) }} }">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4 flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-gray-800">Avantages affichés</h3>
                    <button type="button" @click="lignes.push({ inclus: true, texte: '' })"
                        class="text-xs font-medium text-evadia-600 hover:text-evadia-700">+ Ajouter une ligne</button>
                </div>
                <div class="p-6 space-y-2">
                    <template x-for="(ligne, i) in lignes" :key="i">
                        <div class="flex items-center gap-3">
                            <label class="flex items-center gap-1.5 text-xs text-gray-600 shrink-0">
                                <input type="hidden" :name="`features[${i}][inclus]`" value="0">
                                <input type="checkbox" :name="`features[${i}][inclus]`" value="1" x-model="ligne.inclus" class="rounded border-gray-300 text-evadia-600">
                                Inclus
                            </label>
                            <input type="text" :name="`features[${i}][texte]`" x-model="ligne.texte" maxlength="255"
                                class="{{ $input }}" placeholder="Ex. Intégration sur l'application mobile">
                            <button type="button" @click="lignes.splice(i, 1)" class="text-gray-400 hover:text-red-500 shrink-0" title="Supprimer">✕</button>
                        </div>
                    </template>
                    <p class="text-xs text-gray-400 pt-1">Décochez « Inclus » pour afficher un avantage barré (non compris dans cette formule).</p>
                </div>
            </div>

            <div class="flex items-center gap-3 pt-1">
                <button type="submit" class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 transition-all">
                    {{ $plan->exists ? 'Enregistrer' : 'Créer la formule' }}
                </button>
                <a href="{{ route('admin.plans.index') }}" class="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Annuler</a>
            </div>
        </form>
    </div>
@endsection
