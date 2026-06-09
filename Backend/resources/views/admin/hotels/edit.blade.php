@extends('layouts.admin')
@section('title', 'Modifier ' . $hotel->nom . ' - EVADIA Admin')
@section('page_title', 'Modifier l\'hôtel')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.hotels.show', $hotel) }}"
            class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">← Retour à l'hôtel</a>
    </div>

    <div class="max-w-3xl mx-auto">
        <form method="POST" action="{{ route('admin.hotels.update', $hotel) }}" class="space-y-6">
            @csrf @method('PUT')

            <!-- General Info -->
            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <h3 class="text-sm font-semibold text-gray-800">Informations générales</h3>
                </div>
                <div class="p-6 space-y-5">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom <span class="text-red-400 text-xs">*</span></label>
                        <input type="text" name="nom" value="{{ old('nom', $hotel->nom) }}" required
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea name="description" rows="3"
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">{{ old('description', $hotel->description) }}</textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email contact</label>
                            <input type="email" name="email_contact" value="{{ old('email_contact', $hotel->email_contact) }}"
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                            <input type="tel" name="telephone" value="{{ old('telephone', $hotel->telephone) }}"
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Site web</label>
                            <input type="url" name="site_web" value="{{ old('site_web', $hotel->site_web) }}"
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Étoiles</label>
                            <select name="etoiles"
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                                <option value="">—</option>
                                @for($i = 1; $i <= 5; $i++)
                                    <option value="{{ $i }}" {{ old('etoiles', $hotel->etoiles) == $i ? 'selected' : '' }}>{{ $i }} ★</option>
                                @endfor
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Types d'hôtel <span class="text-red-400 text-xs">*</span></label>
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
            </div>

            <!-- Address -->
            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <h3 class="text-sm font-semibold text-gray-800">Adresse</h3>
                </div>
                <div class="p-6 space-y-5">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Adresse ligne 1 <span class="text-red-400 text-xs">*</span></label>
                        <input type="text" name="adresse_ligne1"
                            value="{{ old('adresse_ligne1', $hotel->adresse?->adresse_ligne1) }}" required
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Code postal <span class="text-red-400 text-xs">*</span></label>
                            <input type="text" name="code_postal"
                                value="{{ old('code_postal', $hotel->adresse?->code_postal) }}" required
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                        </div>
                        <div x-data="villeSearch('{{ old('ville', $hotel->adresse?->ville) }}', {{ $hotel->destinations->first()?->id ?? 'null' }})" class="relative">
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Ville <span class="text-red-400 text-xs">*</span></label>
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
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
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
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Pays <span class="text-red-400 text-xs">*</span></label>
                            <input type="text" name="pays" value="{{ old('pays', $hotel->adresse?->pays) }}" required
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Destination <span class="text-red-400 text-xs">*</span></label>
                        <select name="destination_id" required
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                            @foreach($destinations as $dest)
                                <option value="{{ $dest->id }}" {{ $hotel->destinations->contains('id', $dest->id) ? 'selected' : '' }}>{{ $dest->nom }}</option>
                            @endforeach
                        </select>
                    </div>

                </div>
            </div>

            <div class="flex items-center gap-3 pt-1">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 active:scale-95 transition-all">
                    Enregistrer
                </button>
                <a href="{{ route('admin.hotels.show', $hotel) }}"
                    class="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection

@push('scripts')
<script>
function villeSearch(initialValue, destinationId) {
    return {
        query:     initialValue ?? '',
        selected:  initialValue ?? '',
        results:   [],
        open:      false,
        highlight: 0,

        async search() {
            if (this.query.length < 2) { this.open = false; return; }
            const params = new URLSearchParams({ q: this.query });
            if (destinationId) params.append('destination_id', destinationId);
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
</script>
@endpush
