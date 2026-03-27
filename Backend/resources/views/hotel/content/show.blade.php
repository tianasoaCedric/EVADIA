@extends('layouts.hotel')

@section('title', 'Mon Hotel - EVADIA')
@section('page_title', 'Mon Hotel')

@section('content')
<div class="space-y-6">
    {{-- Header with edit button --}}
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ $hotel->nom }}</h2>
            @if($hotel->etoiles)
                <div class="flex items-center gap-0.5 mt-1">
                    @for($i = 0; $i < $hotel->etoiles; $i++)
                        <svg class="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    @endfor
                    <span class="ml-1 text-sm text-gray-500">{{ $hotel->etoiles }} etoile{{ $hotel->etoiles > 1 ? 's' : '' }}</span>
                </div>
            @endif
        </div>
        <a href="{{ route('hotel.content.edit') }}"
            class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-hotel-600 to-hotel-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-hotel-700 hover:to-hotel-800 transition-all">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Modifier les informations
        </a>
    </div>

    {{-- Informations generales --}}
    <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div class="border-b border-gray-100 px-6 py-4">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <svg class="h-4 w-4 text-hotel-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Informations generales
            </h3>
        </div>
        <div class="p-6">
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ $hotel->nom }}</dd>
                </div>

                <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</dt>
                    <dd class="mt-1">
                        @php
                            $statusColors = [
                                'actif' => 'bg-emerald-50 text-emerald-700',
                                'en_attente' => 'bg-amber-50 text-amber-700',
                                'suspendu' => 'bg-red-50 text-red-700',
                            ];
                        @endphp
                        <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium {{ $statusColors[$hotel->statut] ?? 'bg-gray-50 text-gray-700' }}">
                            <span class="h-1.5 w-1.5 rounded-full {{ str_replace('bg-', 'bg-', str_replace('-50', '-500', $statusColors[$hotel->statut] ?? 'bg-gray-500')) }}"></span>
                            {{ ucfirst(str_replace('_', ' ', $hotel->statut)) }}
                        </span>
                    </dd>
                </div>

                <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Email de contact</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ $hotel->email_contact ?: '—' }}</dd>
                </div>

                <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Telephone</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ $hotel->telephone ?: '—' }}</dd>
                </div>

                <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Site web</dt>
                    <dd class="mt-1 text-sm">
                        @if($hotel->site_web)
                            <a href="{{ $hotel->site_web }}" target="_blank" class="text-hotel-600 hover:text-hotel-700 hover:underline">{{ $hotel->site_web }}</a>
                        @else
                            <span class="text-gray-900">—</span>
                        @endif
                    </dd>
                </div>

                <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Types</dt>
                    <dd class="mt-1 flex flex-wrap gap-1.5">
                        @forelse($hotel->types as $type)
                            <span class="inline-flex items-center rounded-full bg-hotel-50 px-2.5 py-0.5 text-xs font-medium text-hotel-700">
                                {{ $type->nom }}
                            </span>
                        @empty
                            <span class="text-sm text-gray-400">Aucun type defini</span>
                        @endforelse
                    </dd>
                </div>

                @if($hotel->description)
                    <div class="md:col-span-2">
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</dt>
                        <dd class="mt-1 text-sm text-gray-700 leading-relaxed">{{ $hotel->description }}</dd>
                    </div>
                @endif
            </dl>
        </div>
    </div>

    {{-- Adresse --}}
    <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div class="border-b border-gray-100 px-6 py-4">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <svg class="h-4 w-4 text-hotel-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Adresse
            </h3>
        </div>
        <div class="p-6">
            @if($hotel->adresse)
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                    <div class="md:col-span-2">
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</dt>
                        <dd class="mt-1 text-sm text-gray-900">
                            {{ $hotel->adresse->adresse_ligne1 }}
                            @if($hotel->adresse->adresse_ligne2)
                                <br>{{ $hotel->adresse->adresse_ligne2 }}
                            @endif
                        </dd>
                    </div>

                    <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Code postal</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ $hotel->adresse->code_postal }}</dd>
                    </div>

                    <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Ville</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ $hotel->adresse->ville }}</dd>
                    </div>

                    <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Pays</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ $hotel->adresse->pays }}</dd>
                    </div>

                    @if($hotel->adresse->latitude && $hotel->adresse->longitude)
                        <div>
                            <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Coordonnees GPS</dt>
                            <dd class="mt-1 text-sm text-gray-900">{{ $hotel->adresse->latitude }}, {{ $hotel->adresse->longitude }}</dd>
                        </div>
                    @endif
                </dl>
            @else
                <p class="text-sm text-gray-400">Aucune adresse renseignee.</p>
            @endif
        </div>
    </div>

    {{-- Services --}}
    <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div class="border-b border-gray-100 px-6 py-4">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <svg class="h-4 w-4 text-hotel-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Services ({{ $hotel->services->count() }})
            </h3>
        </div>
        <div class="p-6">
            @if($hotel->services->count() > 0)
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    @foreach($hotel->services as $service)
                        <div class="flex items-start gap-3 rounded-xl border border-gray-100 p-4 hover:bg-gray-50/50 transition-colors">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hotel-50 text-hotel-600">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-gray-900">{{ $service->nom }}</p>
                                @if($service->type_service)
                                    <p class="text-xs text-gray-500">{{ $service->type_service }}</p>
                                @endif
                                <p class="text-xs text-gray-500 mt-0.5">
                                    {{ $service->tarif ? number_format($service->tarif, 2, ',', ' ') . ' ' . ($service->devise ?? '') : 'Gratuit' }}
                                </p>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-sm text-gray-400">Aucun service defini.</p>
            @endif
        </div>
    </div>

    {{-- Photos --}}
    <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div class="border-b border-gray-100 px-6 py-4">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <svg class="h-4 w-4 text-hotel-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                Photos ({{ $hotel->photos->count() }})
            </h3>
        </div>
        <div class="p-6">
            @if($hotel->photos->count() > 0)
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    @foreach($hotel->photos as $photo)
                        <div class="relative rounded-xl overflow-hidden border border-gray-200">
                            <img src="{{ Storage::disk('s3')->url($photo->url_photo) }}" alt="Photo hotel"
                                class="h-40 w-full object-cover">
                            @if($photo->est_principale)
                                <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-hotel-600 text-white text-xs font-medium">Principale</span>
                            @endif
                            @if($photo->legende)
                                <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                                    <p class="text-xs text-white">{{ $photo->legende }}</p>
                                </div>
                            @endif
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-sm text-gray-400">Aucune photo. Ajoutez des photos depuis la page de modification.</p>
            @endif
        </div>
    </div>
</div>
@endsection
