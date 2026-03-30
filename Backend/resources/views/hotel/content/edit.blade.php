@extends('layouts.hotel')

@section('title', 'Contenu de l\'hôtel - EVADIA')
@section('page_title', 'Mon Hôtel')

@section('content')
<div x-data="{ tab: 'info' }" class="space-y-6">
    {{-- Tabs --}}
    <div class="bg-white rounded-xl border border-gray-200">
        <div class="border-b border-gray-200 px-6">
            <nav class="flex gap-6 -mb-px">
                <button @click="tab = 'info'" :class="tab === 'info' ? 'border-hotel-500 text-hotel-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="py-4 text-sm font-medium border-b-2 transition-colors">Informations</button>
                <button @click="tab = 'adresse'" :class="tab === 'adresse' ? 'border-hotel-500 text-hotel-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="py-4 text-sm font-medium border-b-2 transition-colors">Adresse</button>
                <button @click="tab = 'photos'" :class="tab === 'photos' ? 'border-hotel-500 text-hotel-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="py-4 text-sm font-medium border-b-2 transition-colors">Photos</button>
                <button @click="tab = 'services'" :class="tab === 'services' ? 'border-hotel-500 text-hotel-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="py-4 text-sm font-medium border-b-2 transition-colors">Services</button>
            </nav>
        </div>

        {{-- Info Tab --}}
        <div x-show="tab === 'info'" x-cloak class="p-6">
            <form method="POST" action="{{ route('hotel.content.update') }}">
                @csrf @method('PUT')
                <input type="hidden" name="_tab" value="info">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l'hôtel</label>
                        <input type="text" name="nom" value="{{ old('nom', $hotel->nom) }}" required
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                        @error('nom') <p class="mt-1 text-sm text-red-600">{{ $message }}</p> @enderror
                    </div>

                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" rows="4"
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">{{ old('description', $hotel->description) }}</textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                        <input type="email" name="email_contact" value="{{ old('email_contact', $hotel->email_contact) }}"
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input type="text" name="telephone" value="{{ old('telephone', $hotel->telephone) }}"
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                        <input type="url" name="site_web" value="{{ old('site_web', $hotel->site_web) }}"
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Étoiles</label>
                        <select name="etoiles" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                            <option value="">— Non défini —</option>
                            @for($i = 1; $i <= 5; $i++)
                                <option value="{{ $i }}" {{ old('etoiles', $hotel->etoiles) == $i ? 'selected' : '' }}>{{ $i }} étoile{{ $i > 1 ? 's' : '' }}</option>
                            @endfor
                        </select>
                    </div>

                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Types d'hôtel</label>
                        <div class="flex flex-wrap gap-3">
                            @foreach($typesHotels as $type)
                                <label class="flex items-center gap-2">
                                    <input type="checkbox" name="types[]" value="{{ $type->id }}"
                                        {{ in_array($type->id, old('types', $hotel->types->pluck('id')->toArray())) ? 'checked' : '' }}
                                        class="rounded border-gray-300 text-hotel-600 focus:ring-hotel-500">
                                    <span class="text-sm text-gray-700">{{ $type->nom }}</span>
                                </label>
                            @endforeach
                        </div>
                        @error('types') <p class="mt-1 text-sm text-red-600">{{ $message }}</p> @enderror
                    </div>

                    {{-- Hidden address fields for full form submission --}}
                    <input type="hidden" name="adresse_ligne1" value="{{ $hotel->adresse?->adresse_ligne1 }}">
                    <input type="hidden" name="code_postal" value="{{ $hotel->adresse?->code_postal }}">
                    <input type="hidden" name="ville" value="{{ $hotel->adresse?->ville }}">
                    <input type="hidden" name="pays" value="{{ $hotel->adresse?->pays }}">
                </div>

                <div class="mt-6 flex justify-end">
                    <button type="submit" class="rounded-lg bg-gradient-to-r from-hotel-600 to-hotel-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-hotel-700 hover:to-hotel-800 transition-all">
                        Enregistrer
                    </button>
                </div>
            </form>
        </div>

        {{-- Address Tab --}}
        <div x-show="tab === 'adresse'" x-cloak class="p-6">
            <form method="POST" action="{{ route('hotel.content.update') }}">
                @csrf @method('PUT')

                {{-- Hidden info fields --}}
                <input type="hidden" name="nom" value="{{ $hotel->nom }}">
                <input type="hidden" name="types[]" value="{{ $hotel->types->first()?->id }}">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Adresse ligne 1</label>
                        <input type="text" name="adresse_ligne1" value="{{ old('adresse_ligne1', $hotel->adresse?->adresse_ligne1) }}" required
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>

                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Adresse ligne 2</label>
                        <input type="text" name="adresse_ligne2" value="{{ old('adresse_ligne2', $hotel->adresse?->adresse_ligne2) }}"
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                        <input type="text" name="code_postal" value="{{ old('code_postal', $hotel->adresse?->code_postal) }}" required
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                        <input type="text" name="ville" value="{{ old('ville', $hotel->adresse?->ville) }}" required
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                        <input type="text" name="pays" value="{{ old('pays', $hotel->adresse?->pays) }}" required
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <input type="number" step="any" name="latitude" value="{{ old('latitude', $hotel->adresse?->latitude) }}"
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                        <input type="number" step="any" name="longitude" value="{{ old('longitude', $hotel->adresse?->longitude) }}"
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>
                </div>

                <div class="mt-6 flex justify-end">
                    <button type="submit" class="rounded-lg bg-gradient-to-r from-hotel-600 to-hotel-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-hotel-700 hover:to-hotel-800 transition-all">
                        Enregistrer l'adresse
                    </button>
                </div>
            </form>
        </div>

        {{-- Photos Tab --}}
        <div x-show="tab === 'photos'" x-cloak class="p-6">
            <form method="POST" action="{{ route('hotel.content.photos.store') }}" enctype="multipart/form-data" class="mb-6">
                @csrf
                <div class="flex items-end gap-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Ajouter des photos</label>
                        <input type="file" name="photos[]" multiple accept="image/*"
                            class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-hotel-50 file:text-hotel-700 hover:file:bg-hotel-100">
                    </div>
                    <button type="submit" class="rounded-lg bg-hotel-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-hotel-700 transition-colors">
                        Uploader
                    </button>
                </div>
            </form>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                @forelse($hotel->photos as $photo)
                    <div class="relative group rounded-xl overflow-hidden border border-gray-200">
                        <img src="{{ $photo->url }}" alt="Photo hôtel"
                            class="h-40 w-full object-cover">
                        @if($photo->est_principale)
                            <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-hotel-600 text-white text-xs font-medium">Principale</span>
                        @endif
                        <form method="POST" action="{{ route('hotel.content.photos.destroy', $photo->id) }}"
                            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            @csrf @method('DELETE')
                            <button type="submit" onclick="return confirm('Supprimer cette photo ?')"
                                class="h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">
                                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </form>
                    </div>
                @empty
                    <div class="col-span-4 py-12 text-center text-sm text-gray-400">
                        Aucune photo. Ajoutez des photos de votre hôtel.
                    </div>
                @endforelse
            </div>
        </div>

        {{-- Services Tab --}}
        <div x-show="tab === 'services'" x-cloak class="p-6" x-data="{ showModal: false, editService: null }">
            <div class="flex justify-between items-center mb-4">
                <h4 class="text-sm font-semibold text-gray-900">Services de l'hôtel</h4>
                <button @click="showModal = true; editService = null"
                    class="rounded-lg bg-hotel-600 px-4 py-2 text-sm font-medium text-white hover:bg-hotel-700 transition-colors">
                    + Ajouter un service
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200">
                            <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nom</th>
                            <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Tarif</th>
                            <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        @forelse($hotel->services as $service)
                            <tr class="hover:bg-gray-50">
                                <td class="py-3 px-4 font-medium text-gray-900">{{ $service->nom }}</td>
                                <td class="py-3 px-4 text-gray-500">{{ $service->type_service ?? '-' }}</td>
                                <td class="py-3 px-4 text-gray-500">{{ $service->tarif ? number_format($service->tarif, 2) . ' ' . ($service->devise ?? '') : 'Gratuit' }}</td>
                                <td class="py-3 px-4 text-right">
                                    <form method="POST" action="{{ route('hotel.content.services.destroy', $service->id) }}" class="inline">
                                        @csrf @method('DELETE')
                                        <button type="submit" onclick="return confirm('Supprimer ce service ?')" class="text-red-500 hover:text-red-700 text-xs">Supprimer</button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="py-8 text-center text-gray-400">Aucun service défini</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            {{-- Add Service Modal --}}
            <div x-show="showModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showModal = false">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" @click.stop>
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Ajouter un service</h3>
                    <form method="POST" action="{{ route('hotel.content.services.store') }}" class="space-y-4">
                        @csrf
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <input type="text" name="nom" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <input type="text" name="type_service" placeholder="spa, restaurant, piscine..." class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea name="description" rows="3" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500"></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Tarif</label>
                                <input type="number" step="0.01" name="tarif" placeholder="0.00" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                                <input type="text" name="devise" value="{{ $hotel->devise_principale ?? 'EUR' }}" maxlength="3" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                            </div>
                        </div>
                        <div class="flex justify-end gap-3 pt-2">
                            <button type="button" @click="showModal = false" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
                            <button type="submit" class="rounded-lg bg-hotel-600 px-4 py-2 text-sm font-medium text-white hover:bg-hotel-700">Ajouter</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
