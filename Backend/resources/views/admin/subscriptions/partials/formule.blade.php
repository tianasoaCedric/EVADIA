{{--
    Choix de la formule + prix mensuel + devise.
    Choisir une formule remplit son prix et sa devise ; le prix reste modifiable (tarif négocié).
    Paramètres : $plans, $selection (code), $prix, $devise, et en option $formuleActuelle
    (code de l'abonnement modifié, gardé dans la liste même s'il n'est plus proposé).
--}}
@php
    $input = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none';
    $tarifs = $plans->mapWithKeys(fn($p) => [$p->code => ['prix' => (float) $p->prix, 'devise' => $p->devise]]);
    $horsListe = isset($formuleActuelle) && $formuleActuelle && !$plans->contains('code', $formuleActuelle);
@endphp

<div x-data="{
        tarifs: {{ \Illuminate\Support\Js::from($tarifs) }},
        formule: {{ \Illuminate\Support\Js::from($selection) }},
        prix: {{ \Illuminate\Support\Js::from($prix) }},
        devise: {{ \Illuminate\Support\Js::from($devise) }},
        choisir() {
            const t = this.tarifs[this.formule];
            if (t) { this.prix = t.prix; this.devise = t.devise; }
        },
        get tarifStandard() { return this.tarifs[this.formule] ?? null; },
    }" class="space-y-5">

    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Formule <span class="text-red-400 text-xs">*</span></label>
        <select name="type_abonnement" required x-model="formule" @change="choisir()" class="{{ $input }}">
            <option value="" disabled>Sélectionner une formule</option>
            @foreach($plans as $plan)
                <option value="{{ $plan->code }}">{{ $plan->nom }} — {{ number_format($plan->prix, 0, ',', ' ') }} {{ $plan->devise }} / mois</option>
            @endforeach
            @if($horsListe)
                <option value="{{ $formuleActuelle }}">{{ ucfirst($formuleActuelle) }} (formule actuelle, plus proposée)</option>
            @endif
        </select>
        @error('type_abonnement') <p class="mt-1.5 text-xs text-red-500">{{ $message }}</p> @enderror
        @if($horsListe)
            <p class="mt-1.5 text-xs text-amber-600">« {{ $formuleActuelle }} » n'est plus une formule proposée. Vous pouvez la garder ou choisir une formule actuelle.</p>
        @endif
    </div>

    <div class="grid grid-cols-2 gap-4">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Prix mensuel <span class="text-red-400 text-xs">*</span></label>
            <input type="number" name="prix_mensuel" step="0.01" min="0" x-model="prix" required class="{{ $input }}">
            <p class="mt-1.5 text-xs text-gray-400" x-show="tarifStandard && Number(prix) !== tarifStandard.prix">
                Tarif standard : <span x-text="tarifStandard ? tarifStandard.prix.toLocaleString('fr-FR') + ' ' + tarifStandard.devise : ''"></span> — prix négocié.
            </p>
            @error('prix_mensuel') <p class="mt-1.5 text-xs text-red-500">{{ $message }}</p> @enderror
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Devise</label>
            <select name="devise" x-model="devise" class="{{ $input }}">
                <option value="MGA">MGA</option>
                <option value="EUR">EUR</option>
            </select>
        </div>
    </div>
</div>
