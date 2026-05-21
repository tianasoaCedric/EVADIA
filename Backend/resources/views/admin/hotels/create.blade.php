@extends('layouts.admin')
@section('title', 'Nouvel hôtel - EVADIA Admin')
@section('page_title', 'Créer un hôtel')

@section('content')
    <div class="max-w-3xl mx-auto mb-6">
        <a href="{{ route('admin.hotels.index') }}" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">←
            Retour à la liste</a>
    </div>

    <div x-data="hotelForm()" class="max-w-3xl mx-auto">
        <!-- Step Indicator -->
        <div class="flex items-center justify-center gap-2 mb-8">
            <template x-for="(label, i) in ['Infos générales', 'Adresse', 'Photos', 'Administrateur', 'Abonnement']" :key="i">
                <div class="flex items-center gap-2">
                    <button @click="step = i + 1" type="button"
                        :class="step === i + 1 ? 'bg-evadia-600 text-white' : (step > i + 1 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500')"
                        class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all">
                        <span x-show="step <= i + 1" x-text="i + 1"></span>
                        <svg x-show="step > i + 1" x-cloak class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke-width="2.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </button>
                    <span :class="step === i + 1 ? 'text-gray-900 font-medium' : 'text-gray-400'"
                        class="text-sm hidden sm:block" x-text="label"></span>
                    <div x-show="i < 4" class="w-8 h-px bg-gray-200 hidden sm:block"></div>
                </div>
            </template>
        </div>

        <form method="POST" action="{{ route('admin.hotels.store') }}" enctype="multipart/form-data">
            @csrf

            <!-- Step 1: General -->
            <div x-show="step === 1" class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Informations générales</h3>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l'hôtel *</label>
                    <input type="text" name="nom" value="{{ old('nom') }}" required
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    @error('nom') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows="3"
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">{{ old('description') }}</textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email contact</label>
                        <input type="email" name="email_contact" value="{{ old('email_contact') }}"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input type="tel" name="telephone" value="{{ old('telephone') }}"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                        <input type="url" name="site_web" value="{{ old('site_web') }}"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Étoiles</label>
                        <select name="etoiles"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                            <option value="">—</option>
                            @for($i = 1; $i <= 5; $i++)
                                <option value="{{ $i }}" {{ old('etoiles') == $i ? 'selected' : '' }}>{{ $i }} ★</option>
                            @endfor
                        </select>
                    </div>
                </div>

                <!-- Types -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Types d'hôtel *</label>
                    <div class="flex flex-wrap gap-2">
                        @foreach($types as $type)
                            <label
                                class="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 cursor-pointer hover:border-evadia-300 has-[:checked]:border-evadia-500 has-[:checked]:bg-evadia-50 transition-all">
                                <input type="checkbox" name="types[]" value="{{ $type->id }}" {{ in_array($type->id, old('types', [])) ? 'checked' : '' }}
                                    class="h-3.5 w-3.5 rounded border-gray-300 text-evadia-600 focus:ring-evadia-500">
                                <span class="text-sm text-gray-700">{{ $type->nom }}</span>
                            </label>
                        @endforeach
                    </div>
                    @error('types') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
                </div>
            </div>

            <!-- Step 2: Address -->
            <div x-show="step === 2" x-cloak class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Adresse</h3>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Adresse ligne 1 *</label>
                    <input type="text" name="adresse_ligne1" value="{{ old('adresse_ligne1') }}" required
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Adresse ligne 2</label>
                    <input type="text" name="adresse_ligne2" value="{{ old('adresse_ligne2') }}"
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                        <input type="text" name="code_postal" value="{{ old('code_postal') }}" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                    <div x-data="villeSearch('{{ old('ville') }}', null)" class="relative">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                        <input type="text"
                            x-model="query"
                            @input.debounce.300ms="search()"
                            @focus="search()"
                            @keydown.escape="open = false"
                            @keydown.arrow-down.prevent="highlight = Math.min(highlight + 1, results.length - 1)"
                            @keydown.arrow-up.prevent="highlight = Math.max(highlight - 1, 0)"
                            @keydown.enter.prevent="select(results[highlight])"
                            autocomplete="off"
                            required
                            placeholder="Rechercher une ville…"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                        <input type="hidden" name="ville" x-bind:value="selected">
                        <ul x-show="open && results.length > 0" x-cloak @click.outside="open = false"
                            class="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg text-sm">
                            <template x-for="(ville, i) in results" :key="ville.id">
                                <li @click="select(ville)" @mouseenter="highlight = i"
                                    :class="highlight === i ? 'bg-evadia-50 text-evadia-700' : 'text-gray-700'"
                                    class="cursor-pointer px-4 py-2.5 hover:bg-evadia-50 hover:text-evadia-700"
                                    x-text="ville.nom"></li>
                            </template>
                        </ul>
                        <p x-show="open && query.length >= 2 && results.length === 0" x-cloak
                            class="mt-1 text-xs text-gray-400">Aucune ville trouvée</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
                        <input type="text" name="pays" value="{{ old('pays') }}" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                    <select name="destination_id" id="destination_id_create" required
                        @change="document.dispatchEvent(new CustomEvent('destination-changed', { detail: { id: $event.target.value } }))"
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                        <option value="">Sélectionner une destination</option>
                        @foreach($destinations as $dest)
                            <option value="{{ $dest->id }}" {{ old('destination_id') == $dest->id ? 'selected' : '' }}>
                                {{ $dest->nom }}
                            </option>
                        @endforeach
                    </select>
                </div>
            </div>

            <!-- Step 3: Photos -->
            <div x-show="step === 3" x-cloak class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Photos</h3>
                <div
                    class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-evadia-400 transition-colors">
                    <input type="file" name="photos[]" multiple accept="image/*" class="hidden" id="photoInput"
                        @change="previewPhotos($event)">
                    <label for="photoInput" class="cursor-pointer">
                        <svg class="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke-width="1"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25v12A2.25 2.25 0 005.25 21z" />
                        </svg>
                        <p class="mt-2 text-sm text-gray-600">Cliquez pour sélectionner des photos</p>
                        <p class="text-xs text-gray-400">PNG, JPG, WEBP — Max 5Mo par fichier</p>
                    </label>
                </div>
                <!-- Preview -->
                <div class="grid grid-cols-4 gap-3" x-show="previews.length > 0">
                    <template x-for="(preview, i) in previews" :key="i">
                        <div class="relative rounded-xl overflow-hidden h-24">
                            <img :src="preview" class="h-full w-full object-cover">
                        </div>
                    </template>
                </div>
            </div>

            <!-- Step 4: Admin -->
            <div x-show="step === 4" x-cloak class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Administrateur de l'hôtel</h3>
                <p class="text-sm text-gray-500">Un compte sera créé avec le mot de passe temporaire <strong>0000</strong>.
                    L'administrateur devra le changer à sa première connexion.</p>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                        <input type="text" name="admin_prenom" value="{{ old('admin_prenom') }}" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                        @error('admin_prenom') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                        <input type="text" name="admin_nom" value="{{ old('admin_nom') }}" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                        @error('admin_nom') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" name="admin_email" value="{{ old('admin_email') }}" required
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    @error('admin_email') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" name="admin_telephone" value="{{ old('admin_telephone') }}"
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>

                <div class="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
                    <div class="flex gap-2">
                        <svg class="h-5 w-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        <p>Un email contenant les identifiants de connexion sera automatiquement envoyé à l'administrateur.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Step 5: Abonnement -->
            <div x-show="step === 5" x-cloak class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
                <h3 class="text-lg font-semibold text-gray-900">Abonnement</h3>

                <!-- Plan cards depuis la base de données -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    @foreach($plans as $plan)
                        @php $checked = old('type_abonnement', 'select') === $plan->code; @endphp
                        <label class="relative cursor-pointer rounded-xl border-2 p-5 transition-all flex flex-col gap-3
                            {{ $checked ? $plan->border . ' bg-gray-50' : 'border-gray-200 hover:border-gray-300' }}">
                            <input type="radio" name="type_abonnement" value="{{ $plan->code }}"
                                {{ $checked ? 'checked' : '' }} class="sr-only"
                                onchange="this.closest('.grid').querySelectorAll('label').forEach(l => l.classList.remove('{{ $plan->border }}','bg-gray-50')); this.closest('label').classList.add('{{ $plan->border }}','bg-gray-50')">

                            <!-- Badge + check -->
                            <div class="flex items-start justify-between">
                                <span class="inline-flex items-center rounded-full {{ $plan->badge_bg }} {{ $plan->badge_text }} px-2.5 py-0.5 text-[11px] font-bold">
                                    {{ $plan->label }}
                                </span>
                                @if($checked)
                                    <svg class="h-5 w-5 text-evadia-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                    </svg>
                                @endif
                            </div>

                            <div>
                                <p class="text-base font-bold text-gray-900">{{ $plan->nom }}</p>
                                <p class="text-xs text-gray-500 mt-0.5">{{ $plan->description }}</p>
                            </div>

                            <!-- Prix -->
                            <div class="pt-2 border-t border-gray-100">
                                <span class="text-lg font-bold text-gray-900">{{ number_format($plan->prix, 0, ',', ' ') }}</span>
                                <span class="text-xs text-gray-500 ml-1">{{ $plan->devise }} / mois</span>
                            </div>

                            <!-- Features -->
                            <ul class="space-y-1.5">
                                @foreach($plan->features as $feature)
                                    <li class="flex items-start gap-2 text-xs {{ $feature['inclus'] ? 'text-gray-700' : 'text-gray-400' }}">
                                        @if($feature['inclus'])
                                            <svg class="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                                            </svg>
                                        @else
                                            <svg class="h-3.5 w-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                            </svg>
                                        @endif
                                        {{ $feature['texte'] }}
                                    </li>
                                @endforeach
                            </ul>
                        </label>
                    @endforeach
                </div>
                @error('type_abonnement') <p class="text-xs text-red-600">{{ $message }}</p> @enderror

                <!-- Dates uniquement -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                        <input type="date" name="abonnement_date_debut"
                            value="{{ old('abonnement_date_debut', now()->toDateString()) }}" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                        @error('abonnement_date_debut') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin <span class="text-gray-400 font-normal">(optionnel)</span></label>
                        <input type="date" name="abonnement_date_fin" value="{{ old('abonnement_date_fin') }}"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    </div>
                </div>

                <div class="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
                    Le premier paiement sera dû le jour de la date de début. Les suivants seront dus chaque mois à la même date.
                </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex items-center justify-between mt-6">
                <button type="button" x-show="step > 1" @click="step--"
                    class="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">←
                    Précédent</button>
                <div x-show="step <= 1"></div>
                <button type="button" x-show="step < 5" @click="step++"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-evadia-700 transition-colors">Suivant
                    →</button>
                <button type="submit" x-show="step === 5" x-cloak
                    class="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">Créer
                    l'hôtel</button>
            </div>
        </form>
    </div>
@endsection

@push('scripts')
    <script>
        function villeSearch(initialValue, destinationId) {
            return {
                query:       initialValue ?? '',
                selected:    initialValue ?? '',
                results:     [],
                open:        false,
                highlight:   0,
                destId:      destinationId,

                init() {
                    document.addEventListener('destination-changed', (e) => {
                        this.destId = e.detail.id || null;
                        if (this.query.length >= 2) this.search();
                    });
                },

                async search() {
                    if (this.query.length < 2) { this.open = false; return; }
                    const params = new URLSearchParams({ q: this.query });
                    if (this.destId) params.append('destination_id', this.destId);
                    const res  = await fetch(`/api/villes/search?${params}`);
                    const json = await res.json();
                    this.results   = json.data ?? [];
                    this.highlight = 0;
                    this.open      = this.results.length > 0;
                },

                select(ville) {
                    if (!ville) return;
                    this.query    = ville.nom;
                    this.selected = ville.nom;
                    this.open     = false;
                },
            };
        }

        function hotelForm() {
            const errorFields = @json($errors->keys());
            const step1 = ['nom','email_contact','telephone','site_web','etoiles','types'];
            const step2 = ['adresse_ligne1','code_postal','ville','pays','destination_id'];
            const step4 = ['admin_nom','admin_prenom','admin_email','admin_telephone'];
            const step5 = ['type_abonnement','prix_mensuel','devise_abonnement','abonnement_date_debut','abonnement_date_fin'];
            let initialStep = 1;
            if (errorFields.some(f => step5.some(s => f.startsWith(s)))) initialStep = 5;
            else if (errorFields.some(f => step4.some(s => f.startsWith(s)))) initialStep = 4;
            else if (errorFields.some(f => step2.some(s => f.startsWith(s)))) initialStep = 2;
            else if (errorFields.some(f => step1.some(s => f.startsWith(s)))) initialStep = 1;
            return {
                step: initialStep,
                previews: [],
                previewPhotos(event) {
                    this.previews = [];
                    for (const file of event.target.files) {
                        const reader = new FileReader();
                        reader.onload = (e) => this.previews.push(e.target.result);
                        reader.readAsDataURL(file);
                    }
                }
            }
        }
    </script>
@endpush