@extends('layouts.hotel')
@section('title', 'Équipements & Services - EVADIA')
@section('page_title', 'Équipements & Services')

@section('content')
@php
    $categoriesJs = $equipementsParCategorie->map(fn($items, $cat) => [
        'nom'   => $cat,
        'items' => $items->map(fn($e) => ['id' => (string) $e->id, 'nom' => $e->nom])->values(),
    ])->values();
@endphp
<div class="max-w-5xl mx-auto space-y-6" x-data="{
    categories: @js($categoriesJs),
    selected: @js($checkedIds->map(fn($id) => (string) $id)),
    initial: @js($checkedIds->map(fn($id) => (string) $id)),
    search: '',
    get dirty() {
        if (this.selected.length !== this.initial.length) return true;
        return this.selected.some(id => !this.initial.includes(id));
    },
    matches(item) {
        const q = this.search.trim().toLowerCase();
        return !q || item.nom.toLowerCase().includes(q);
    },
    visibleItems(cat) { return cat.items.filter(i => this.matches(i)); },
    countIn(cat) { return cat.items.filter(i => this.selected.includes(i.id)).length; },
    allChecked(cat) { return cat.items.every(i => this.selected.includes(i.id)); },
    toggleCategorie(cat) {
        const ids = this.visibleItems(cat).map(i => i.id);
        if (ids.every(id => this.selected.includes(id))) {
            this.selected = this.selected.filter(id => !ids.includes(id));
        } else {
            this.selected = [...new Set([...this.selected, ...ids])];
        }
    },
}">

    {{-- Flash --}}
    @if($errors->any())
        <div class="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <ul class="list-disc list-inside space-y-1">
                @foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach
            </ul>
        </div>
    @endif

    <p class="text-sm text-gray-500">
        Cochez ce que propose votre établissement. Ces éléments s'affichent dans la section
        <strong class="text-gray-700">« Inclus dans le logement »</strong> sur votre page hôtel.
    </p>

    {{-- ═══ Équipements du catalogue (cases à cocher) ═══ --}}
    <form method="POST" action="{{ route('hotel.content.services.sync') }}" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        @csrf

        <div class="flex flex-wrap items-center gap-3 border-b border-gray-100 bg-gray-50/50 px-5 py-3.5">
            <div class="flex-1 min-w-[180px]">
                <h3 class="text-sm font-semibold text-gray-800">Équipements</h3>
                <p class="text-xs text-gray-400"><span x-text="selected.length"></span> sélectionné(s)</p>
            </div>
            <div class="relative w-full sm:w-64">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z"/>
                </svg>
                <input type="text" x-model="search" placeholder="Filtrer (Wi-Fi, piscine…)"
                    class="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
            </div>
        </div>

        <div class="divide-y divide-gray-100">
            <template x-for="cat in categories" :key="cat.nom">
                <div x-show="visibleItems(cat).length > 0" class="px-5 py-4">
                    <div class="flex items-center justify-between mb-3">
                        <p class="text-sm font-semibold text-gray-800">
                            <span x-text="cat.nom"></span>
                            <span class="ml-1 text-xs font-normal text-gray-400" x-text="countIn(cat) + '/' + cat.items.length"></span>
                        </p>
                        <button type="button" @click="toggleCategorie(cat)" class="text-xs font-medium text-hotel-600 hover:text-hotel-700"
                            x-text="allChecked(cat) ? 'Tout décocher' : 'Tout cocher'"></button>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        <template x-for="item in cat.items" :key="item.id">
                            <label x-show="matches(item)"
                                class="flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm cursor-pointer select-none transition-colors"
                                :class="selected.includes(item.id) ? 'border-hotel-400 bg-hotel-50/60 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'">
                                <input type="checkbox" name="equipements[]" :value="item.id" x-model="selected"
                                    class="h-4 w-4 rounded border-gray-300 text-hotel-600 focus:ring-hotel-500">
                                <span class="truncate" x-text="item.nom"></span>
                            </label>
                        </template>
                    </div>
                </div>
            </template>
            <div x-show="categories.every(c => visibleItems(c).length === 0)" class="px-5 py-10 text-center text-sm text-gray-400">
                Aucun équipement ne correspond à « <span x-text="search"></span> ».
            </div>
        </div>

        {{-- Barre d'enregistrement --}}
        <div class="sticky bottom-0 flex items-center justify-between gap-3 border-t border-gray-100 bg-white/95 backdrop-blur px-5 py-3">
            <p class="text-xs" :class="dirty ? 'text-amber-600 font-medium' : 'text-gray-400'"
                x-text="dirty ? 'Modifications non enregistrées' : 'À jour'"></p>
            <div class="flex items-center gap-2">
                <button type="button" x-show="dirty" @click="selected = [...initial]"
                    class="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
                <button type="submit" :disabled="!dirty"
                    class="rounded-lg bg-hotel-600 px-5 py-2 text-sm font-semibold text-white hover:bg-hotel-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    Enregistrer
                </button>
            </div>
        </div>
    </form>

    {{-- ═══ Services personnalisés (hors catalogue) ═══ --}}
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden" x-data="{ showForm: false }">
        <div class="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/50 px-5 py-3.5">
            <div>
                <h3 class="text-sm font-semibold text-gray-800">Autres services</h3>
                <p class="text-xs text-gray-400">Ce qui n'est pas dans la liste ci-dessus (ex. navette aéroport, cours de cuisine…)</p>
            </div>
            <button type="button" @click="showForm = !showForm"
                class="flex items-center gap-1.5 rounded-lg border border-hotel-300 px-3 py-1.5 text-xs font-medium text-hotel-700 hover:bg-hotel-50 shrink-0">
                <svg class="h-3.5 w-3.5 transition-transform" :class="showForm ? 'rotate-45' : ''" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
                <span x-text="showForm ? 'Annuler' : 'Ajouter'"></span>
            </button>
        </div>

        <form x-show="showForm" x-cloak method="POST" action="{{ route('hotel.content.services.store') }}"
            class="flex flex-wrap items-end gap-3 border-b border-gray-100 bg-hotel-50/30 px-5 py-4">
            @csrf
            <div class="flex-1 min-w-[200px]">
                <label class="block text-xs font-medium text-gray-600 mb-1">Nom <span class="text-red-400">*</span></label>
                <input type="text" name="nom" required maxlength="200" placeholder="ex: Navette aéroport"
                    class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
            </div>
            <div class="w-48">
                <label class="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
                <input type="text" name="type_service" list="categories-services" maxlength="100" placeholder="optionnel"
                    class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20 focus:outline-none">
                <datalist id="categories-services">
                    @foreach($categories as $cat)<option value="{{ $cat }}">@endforeach
                </datalist>
            </div>
            <button type="submit" class="rounded-lg bg-hotel-600 px-4 py-2 text-sm font-semibold text-white hover:bg-hotel-700">Ajouter</button>
        </form>

        <div class="divide-y divide-gray-50">
            @forelse($customServices as $service)
                <div class="group flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors" x-data="{ editing: false }">
                    <div x-show="!editing" class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-800">{{ $service->nom }}</p>
                        @if($service->type_service)
                            <p class="text-xs text-gray-400">{{ $service->type_service }}</p>
                        @endif
                    </div>

                    <div x-show="editing" x-cloak class="flex-1">
                        <form method="POST" action="{{ route('hotel.content.services.update', $service->id) }}" class="flex items-center gap-2">
                            @csrf @method('PUT')
                            <input type="hidden" name="type_service" value="{{ $service->type_service }}">
                            <input type="text" name="nom" value="{{ $service->nom }}" required
                                class="flex-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-hotel-500 focus:outline-none">
                            <button type="submit" class="rounded-lg bg-hotel-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-hotel-700">OK</button>
                            <button type="button" @click="editing = false" class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">✕</button>
                        </form>
                    </div>

                    <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" x-show="!editing" @click="editing = true"
                            class="rounded-lg p-1.5 text-gray-400 hover:text-hotel-600 hover:bg-hotel-50 transition-colors" title="Modifier">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
                            </svg>
                        </button>
                        <form method="POST" action="{{ route('hotel.content.services.destroy', $service->id) }}"
                              onsubmit="return confirm('Supprimer « {{ addslashes($service->nom) }} » ?')">
                            @csrf @method('DELETE')
                            <button type="submit" class="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Supprimer">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            @empty
                <p class="px-5 py-6 text-center text-sm text-gray-400">Aucun service personnalisé.</p>
            @endforelse
        </div>
    </div>
</div>
@endsection
