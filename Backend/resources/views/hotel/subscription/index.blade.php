@extends('layouts.hotel')

@section('title', 'Mon Abonnement - EVADIA')
@section('page_title', 'Mon Abonnement')

@section('content')
<div class="space-y-6">
    {{-- Current Plan --}}
    @if($abonnementActif)
        @php
            $daysLeft = $abonnementActif->date_fin ? now()->diffInDays($abonnementActif->date_fin, false) : null;
            $isExpiringSoon = $daysLeft !== null && $daysLeft <= 30 && $daysLeft > 0;
            $isExpired = $daysLeft !== null && $daysLeft <= 0;

            $planColors = [
                'basic' => ['from-gray-500', 'to-gray-700', 'bg-gray-50', 'text-gray-700', 'border-gray-200'],
                'premium' => ['from-hotel-500', 'to-hotel-700', 'bg-hotel-50', 'text-hotel-700', 'border-hotel-200'],
                'enterprise' => ['from-indigo-500', 'to-indigo-700', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-200'],
            ];
            $colors = $planColors[strtolower($abonnementActif->type_abonnement)] ?? $planColors['basic'];
        @endphp

        <div class="rounded-2xl bg-gradient-to-r {{ $colors[0] }} {{ $colors[1] }} p-6 text-white relative overflow-hidden">
            <div class="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
            <div class="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                        </svg>
                        <h2 class="text-2xl font-bold">Plan {{ ucfirst($abonnementActif->type_abonnement) }}</h2>
                    </div>
                    <p class="text-white/80 text-sm">
                        Depuis le {{ $abonnementActif->date_debut->format('d/m/Y') }}
                        @if($abonnementActif->date_fin)
                            — Expire le {{ $abonnementActif->date_fin->format('d/m/Y') }}
                        @else
                            — Sans date d'expiration
                        @endif
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-3xl font-bold">{{ number_format($abonnementActif->prix_mensuel, 2, ',', ' ') }}</p>
                    <p class="text-white/70 text-sm">{{ $abonnementActif->devise }} / mois</p>
                </div>
            </div>

            {{-- Expiration warning --}}
            @if($isExpiringSoon)
                <div class="mt-4 flex items-center gap-2 rounded-lg bg-amber-500/20 px-4 py-2.5 text-sm">
                    <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    Votre abonnement expire dans {{ $daysLeft }} jour{{ $daysLeft > 1 ? 's' : '' }}. Contactez EVADIA pour le renouveler.
                </div>
            @elseif($isExpired)
                <div class="mt-4 flex items-center gap-2 rounded-lg bg-red-500/30 px-4 py-2.5 text-sm">
                    <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    Votre abonnement a expire. Contactez EVADIA pour le renouveler.
                </div>
            @endif
        </div>
    @else
        {{-- No active subscription --}}
        <div class="rounded-2xl bg-white border-2 border-dashed border-gray-300 p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Aucun abonnement actif</h3>
            <p class="mt-2 text-sm text-gray-500">Contactez l'equipe EVADIA pour souscrire a un plan.</p>
            <a href="{{ route('hotel.messages.index') }}"
                class="mt-4 inline-flex items-center gap-2 rounded-xl bg-hotel-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-hotel-700 transition-colors">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Contacter EVADIA
            </a>
        </div>
    @endif

    {{-- Plan Details --}}
    @if($abonnementActif)
        <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div class="border-b border-gray-100 px-6 py-4">
                <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <svg class="h-4 w-4 text-hotel-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    Details de l'abonnement
                </h3>
            </div>
            <div class="p-6">
                <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</dt>
                        <dd class="mt-1 text-sm font-semibold text-gray-900">{{ ucfirst($abonnementActif->type_abonnement) }}</dd>
                    </div>
                    <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Prix mensuel</dt>
                        <dd class="mt-1 text-sm font-semibold text-gray-900">{{ number_format($abonnementActif->prix_mensuel, 2, ',', ' ') }} {{ $abonnementActif->devise }}</dd>
                    </div>
                    <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Date de debut</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ $abonnementActif->date_debut->format('d/m/Y') }}</dd>
                    </div>
                    <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'expiration</dt>
                        <dd class="mt-1 text-sm text-gray-900">
                            @if($abonnementActif->date_fin)
                                {{ $abonnementActif->date_fin->format('d/m/Y') }}
                                @if($isExpiringSoon)
                                    <span class="ml-1 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Bientot</span>
                                @elseif($isExpired)
                                    <span class="ml-1 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Expire</span>
                                @else
                                    <span class="ml-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Actif</span>
                                @endif
                            @else
                                Illimite
                                <span class="ml-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Actif</span>
                            @endif
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    @endif

    {{-- Available Plans --}}
    <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div class="border-b border-gray-100 px-6 py-4">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <svg class="h-4 w-4 text-hotel-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                Plans disponibles
            </h3>
        </div>
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                {{-- Basic --}}
                @php $isCurrentPlan = $abonnementActif && strtolower($abonnementActif->type_abonnement) === 'basic'; @endphp
                <div class="relative rounded-xl border-2 {{ $isCurrentPlan ? 'border-hotel-500 bg-hotel-50/30' : 'border-gray-200' }} p-6 transition-all hover:shadow-md">
                    @if($isCurrentPlan)
                        <span class="absolute -top-3 left-4 inline-flex items-center rounded-full bg-hotel-600 px-3 py-0.5 text-xs font-semibold text-white">Plan actuel</span>
                    @endif
                    <h4 class="text-lg font-bold text-gray-900">Basic</h4>
                    <p class="text-sm text-gray-500 mt-1">Pour demarrer</p>
                    <ul class="mt-4 space-y-2.5">
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Gestion des chambres
                        </li>
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Reservations en ligne
                        </li>
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Calendrier de disponibilites
                        </li>
                        <li class="flex items-center gap-2 text-sm text-gray-400">
                            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            Messagerie temps reel
                        </li>
                        <li class="flex items-center gap-2 text-sm text-gray-400">
                            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            Offres et promotions
                        </li>
                    </ul>
                    @if(!$isCurrentPlan)
                        <a href="{{ route('hotel.messages.index') }}"
                            class="mt-6 block w-full text-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            Demander ce plan
                        </a>
                    @endif
                </div>

                {{-- Premium --}}
                @php $isCurrentPlan = $abonnementActif && strtolower($abonnementActif->type_abonnement) === 'premium'; @endphp
                <div class="relative rounded-xl border-2 {{ $isCurrentPlan ? 'border-hotel-500 bg-hotel-50/30' : 'border-hotel-200' }} p-6 transition-all hover:shadow-md">
                    @if($isCurrentPlan)
                        <span class="absolute -top-3 left-4 inline-flex items-center rounded-full bg-hotel-600 px-3 py-0.5 text-xs font-semibold text-white">Plan actuel</span>
                    @else
                        <span class="absolute -top-3 left-4 inline-flex items-center rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white">Recommande</span>
                    @endif
                    <h4 class="text-lg font-bold text-gray-900">Premium</h4>
                    <p class="text-sm text-gray-500 mt-1">Le plus populaire</p>
                    <ul class="mt-4 space-y-2.5">
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Tout du plan Basic
                        </li>
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Messagerie temps reel
                        </li>
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Offres et promotions
                        </li>
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Tarification dynamique
                        </li>
                        <li class="flex items-center gap-2 text-sm text-gray-400">
                            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            Support prioritaire
                        </li>
                    </ul>
                    @if(!$isCurrentPlan)
                        <a href="{{ route('hotel.messages.index') }}"
                            class="mt-6 block w-full text-center rounded-lg bg-hotel-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-hotel-700 transition-colors">
                            Demander ce plan
                        </a>
                    @endif
                </div>

                {{-- Enterprise --}}
                @php $isCurrentPlan = $abonnementActif && strtolower($abonnementActif->type_abonnement) === 'enterprise'; @endphp
                <div class="relative rounded-xl border-2 {{ $isCurrentPlan ? 'border-hotel-500 bg-hotel-50/30' : 'border-gray-200' }} p-6 transition-all hover:shadow-md">
                    @if($isCurrentPlan)
                        <span class="absolute -top-3 left-4 inline-flex items-center rounded-full bg-hotel-600 px-3 py-0.5 text-xs font-semibold text-white">Plan actuel</span>
                    @endif
                    <h4 class="text-lg font-bold text-gray-900">Enterprise</h4>
                    <p class="text-sm text-gray-500 mt-1">Pour les grandes structures</p>
                    <ul class="mt-4 space-y-2.5">
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Tout du plan Premium
                        </li>
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Support prioritaire 24/7
                        </li>
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            API acces complet
                        </li>
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Rapports avances
                        </li>
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Multi-etablissements
                        </li>
                    </ul>
                    @if(!$isCurrentPlan)
                        <a href="{{ route('hotel.messages.index') }}"
                            class="mt-6 block w-full text-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            Demander ce plan
                        </a>
                    @endif
                </div>
            </div>

            <p class="mt-6 text-center text-xs text-gray-400">
                Pour changer de plan ou obtenir un devis, contactez l'equipe EVADIA via la messagerie.
            </p>
        </div>
    </div>

    {{-- Subscription History --}}
    @if($historique->count() > 1)
        <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div class="border-b border-gray-100 px-6 py-4">
                <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <svg class="h-4 w-4 text-hotel-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Historique des abonnements
                </h3>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Plan</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Debut</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fin</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Prix/mois</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        @foreach($historique as $abo)
                            @php
                                $isActive = !$abo->date_fin || $abo->date_fin->isFuture();
                            @endphp
                            <tr class="hover:bg-gray-50/50">
                                <td class="px-6 py-3 text-sm font-medium text-gray-900">
                                    <span class="inline-flex items-center rounded-full bg-hotel-50 px-2.5 py-0.5 text-xs font-medium text-hotel-700">
                                        {{ ucfirst($abo->type_abonnement) }}
                                    </span>
                                </td>
                                <td class="px-6 py-3 text-sm text-gray-600">{{ $abo->date_debut->format('d/m/Y') }}</td>
                                <td class="px-6 py-3 text-sm text-gray-600">{{ $abo->date_fin?->format('d/m/Y') ?? '—' }}</td>
                                <td class="px-6 py-3 text-sm text-gray-900">{{ number_format($abo->prix_mensuel, 2, ',', ' ') }} {{ $abo->devise }}</td>
                                <td class="px-6 py-3">
                                    @if($isActive)
                                        <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Actif
                                        </span>
                                    @else
                                        <span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                                            <span class="h-1.5 w-1.5 rounded-full bg-gray-400"></span> Termine
                                        </span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    @endif
</div>
@endsection
