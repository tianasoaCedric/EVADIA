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

            // Prochain paiement : même jour du mois que date_debut
            $jourPaiement = (int) $abonnementActif->date_debut->format('d');
            $prochainPaiement = now()->startOfDay()->day($jourPaiement);
            if ($prochainPaiement->isPast() || $prochainPaiement->isToday()) {
                $prochainPaiement = $prochainPaiement->addMonth();
            }
            $aPaiementFutur = !$isExpired && (!$abonnementActif->date_fin || $prochainPaiement->lte($abonnementActif->date_fin));
            $joursAvantPaiement = (int) now()->diffInDays($prochainPaiement, false);

            $planColors = [
                'explore'   => ['from-gray-600',   'to-gray-800',   'bg-gray-50',   'text-gray-700',  'border-gray-200'],
                'select'    => ['from-hotel-500',   'to-hotel-700',  'bg-hotel-50',  'text-hotel-700', 'border-hotel-200'],
                'signature' => ['from-amber-500',   'to-amber-700',  'bg-amber-50',  'text-amber-700', 'border-amber-200'],
                'premium'   => ['from-amber-500',   'to-amber-700',  'bg-amber-50',  'text-amber-700', 'border-amber-200'],
            ];
            $colors = $planColors[strtolower($abonnementActif->type_abonnement)] ?? $planColors['explore'];
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
            <div class="p-6 space-y-6">
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
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Date de début</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ $abonnementActif->date_debut->format('d/m/Y') }}</dd>
                    </div>
                    <div>
                        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'expiration</dt>
                        <dd class="mt-1 text-sm text-gray-900">
                            @if($abonnementActif->date_fin)
                                {{ $abonnementActif->date_fin->format('d/m/Y') }}
                                @if($isExpiringSoon)
                                    <span class="ml-1 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Bientôt</span>
                                @elseif($isExpired)
                                    <span class="ml-1 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Expiré</span>
                                @else
                                    <span class="ml-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Actif</span>
                                @endif
                            @else
                                Illimité
                                <span class="ml-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Actif</span>
                            @endif
                        </dd>
                    </div>
                </dl>

                {{-- Prochain paiement --}}
                @if(!$isExpired && $abonnementActif->prix_mensuel > 0)
                    <div class="rounded-xl border {{ $aPaiementFutur && $joursAvantPaiement <= 7 ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50' }} p-4">
                        <div class="flex items-center justify-between flex-wrap gap-3">
                            <div class="flex items-center gap-3">
                                <div class="h-10 w-10 rounded-full {{ $aPaiementFutur && $joursAvantPaiement <= 7 ? 'bg-amber-100 text-amber-600' : 'bg-hotel-100 text-hotel-600' }} flex items-center justify-center shrink-0">
                                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
                                    </svg>
                                </div>
                                <div>
                                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Prochain paiement</p>
                                    @if($aPaiementFutur)
                                        <p class="text-sm font-semibold text-gray-900 mt-0.5">
                                            {{ $prochainPaiement->format('d/m/Y') }}
                                            <span class="ml-2 text-xs font-normal text-gray-500">dans {{ $joursAvantPaiement }} jour{{ $joursAvantPaiement > 1 ? 's' : '' }}</span>
                                        </p>
                                    @else
                                        <p class="text-sm text-gray-500 mt-0.5">Aucun paiement à venir</p>
                                    @endif
                                </div>
                            </div>
                            @if($aPaiementFutur)
                                <div class="text-right">
                                    <p class="text-xs text-gray-500">Montant dû</p>
                                    <p class="text-lg font-bold text-gray-900">{{ number_format($abonnementActif->prix_mensuel, 2, ',', ' ') }} <span class="text-sm font-normal text-gray-500">{{ $abonnementActif->devise }}</span></p>
                                </div>
                            @endif
                        </div>
                        @if($aPaiementFutur && $joursAvantPaiement <= 7)
                            <p class="mt-3 text-xs text-amber-700 flex items-center gap-1.5">
                                <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                Votre paiement est dû dans moins d'une semaine. Contactez EVADIA si nécessaire.
                            </p>
                        @endif
                    </div>
                @endif
            </div>
        </div>
    @endif

    {{-- Moyen de paiement --}}
    <div x-data="paymentMethod()" class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div class="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <svg class="h-4 w-4 text-hotel-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
                Moyen de paiement
            </h3>
            <button @click="open = true" type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border border-hotel-300 px-3 py-1.5 text-xs font-medium text-hotel-700 hover:bg-hotel-50 transition-colors">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
                Modifier
            </button>
        </div>

        <div class="p-6">
            {{-- Méthode actuelle --}}
            <div x-show="!open">
                <template x-if="method === 'card'">
                    <div class="flex items-center gap-4">
                        <div class="h-12 w-20 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0">
                            <svg class="h-6 w-10 text-white" viewBox="0 0 40 24" fill="none">
                                <rect width="40" height="24" rx="4" fill="transparent"/>
                                <circle cx="15" cy="12" r="7" fill="#EB001B" opacity="0.9"/>
                                <circle cx="25" cy="12" r="7" fill="#F79E1B" opacity="0.9"/>
                                <path d="M20 6.8a7 7 0 010 10.4A7 7 0 0120 6.8z" fill="#FF5F00"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-gray-900" x-text="'•••• •••• •••• ' + cardLast4"></p>
                            <p class="text-xs text-gray-500 mt-0.5">Expire <span x-text="cardExpiry"></span></p>
                        </div>
                        <span class="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Actif
                        </span>
                    </div>
                </template>

                <template x-if="method === 'mobile'">
                    <div class="flex items-center gap-4">
                        <div class="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                            :class="operator === 'mvola' ? 'bg-red-100' : (operator === 'orange' ? 'bg-orange-100' : 'bg-green-100')">
                            <span class="text-lg font-black"
                                :class="operator === 'mvola' ? 'text-red-600' : (operator === 'orange' ? 'text-orange-500' : 'text-green-600')"
                                x-text="operator === 'mvola' ? 'M' : (operator === 'orange' ? 'O' : 'A')">
                            </span>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-gray-900 capitalize" x-text="operatorLabel + ' Money'"></p>
                            <p class="text-xs text-gray-500 mt-0.5" x-text="mobileNumber"></p>
                        </div>
                        <span class="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Actif
                        </span>
                    </div>
                </template>

                <template x-if="method === null">
                    <div class="flex items-center gap-3 text-sm text-gray-500">
                        <svg class="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                        Aucun moyen de paiement configuré. Cliquez sur "Modifier" pour en ajouter un.
                    </div>
                </template>
            </div>

            {{-- Formulaire --}}
            <div x-show="open" x-cloak class="space-y-5">
                {{-- Tabs --}}
                <div class="flex gap-2">
                    <button type="button" @click="tab = 'card'"
                        :class="tab === 'card' ? 'bg-hotel-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                        Carte bancaire
                    </button>
                    <button type="button" @click="tab = 'mobile'"
                        :class="tab === 'mobile' ? 'bg-hotel-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                        </svg>
                        Mobile Money
                    </button>
                </div>

                {{-- Carte bancaire --}}
                <div x-show="tab === 'card'" class="space-y-4">
                    {{-- Carte visuelle --}}
                    <div class="relative h-44 w-full max-w-sm rounded-2xl bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 p-6 text-white shadow-lg overflow-hidden">
                        <div class="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/5"></div>
                        <div class="absolute -bottom-8 -left-4 h-40 w-40 rounded-full bg-white/5"></div>
                        <div class="relative flex flex-col h-full justify-between">
                            <div class="flex justify-between items-start">
                                <svg viewBox="0 0 40 24" class="h-8 w-12" fill="none">
                                    <circle cx="15" cy="12" r="7" fill="#EB001B" opacity="0.9"/>
                                    <circle cx="25" cy="12" r="7" fill="#F79E1B" opacity="0.9"/>
                                    <path d="M20 6.8a7 7 0 010 10.4A7 7 0 0120 6.8z" fill="#FF5F00"/>
                                </svg>
                                <span class="text-xs font-light opacity-60">VISA / MASTERCARD</span>
                            </div>
                            <div>
                                <p class="text-lg font-mono tracking-widest" x-text="formatCardPreview(cardInput)"></p>
                                <div class="flex justify-between mt-3">
                                    <div>
                                        <p class="text-[10px] opacity-50 uppercase">Titulaire</p>
                                        <p class="text-sm font-medium" x-text="holderInput || 'NOM PRÉNOM'"></p>
                                    </div>
                                    <div>
                                        <p class="text-[10px] opacity-50 uppercase">Expire</p>
                                        <p class="text-sm font-medium" x-text="expiryInput || 'MM/AA'"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Numéro de carte</label>
                        <input type="text" x-model="cardInput" @input="cardInput = formatCardNumber($event.target.value)"
                            maxlength="19" placeholder="0000 0000 0000 0000"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-mono focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
                            <input type="text" x-model="expiryInput" @input="expiryInput = formatExpiry($event.target.value)"
                                maxlength="5" placeholder="MM/AA"
                                class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-mono focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                            <input type="password" x-model="cvvInput" maxlength="4" placeholder="•••"
                                class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-mono focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nom du titulaire</label>
                        <input type="text" x-model="holderInput" placeholder="NOM Prénom"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20">
                    </div>
                </div>

                {{-- Mobile Money --}}
                <div x-show="tab === 'mobile'" x-cloak class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Opérateur</label>
                        <div class="grid grid-cols-3 gap-3">
                            <label @click="operator = 'mvola'"
                                :class="operator === 'mvola' ? 'border-red-400 bg-red-50 ring-1 ring-red-400' : 'border-gray-200 hover:border-gray-300'"
                                class="cursor-pointer rounded-xl border-2 p-4 text-center transition-all">
                                <div class="h-8 w-8 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-2">
                                    <span class="text-sm font-black text-red-600">M</span>
                                </div>
                                <p class="text-xs font-semibold text-gray-900">MVola</p>
                                <p class="text-[10px] text-gray-400">Telma</p>
                            </label>
                            <label @click="operator = 'orange'"
                                :class="operator === 'orange' ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-400' : 'border-gray-200 hover:border-gray-300'"
                                class="cursor-pointer rounded-xl border-2 p-4 text-center transition-all">
                                <div class="h-8 w-8 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-2">
                                    <span class="text-sm font-black text-orange-500">O</span>
                                </div>
                                <p class="text-xs font-semibold text-gray-900">Orange Money</p>
                                <p class="text-[10px] text-gray-400">Orange</p>
                            </label>
                            <label @click="operator = 'airtel'"
                                :class="operator === 'airtel' ? 'border-green-400 bg-green-50 ring-1 ring-green-400' : 'border-gray-200 hover:border-gray-300'"
                                class="cursor-pointer rounded-xl border-2 p-4 text-center transition-all">
                                <div class="h-8 w-8 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-2">
                                    <span class="text-sm font-black text-green-600">A</span>
                                </div>
                                <p class="text-xs font-semibold text-gray-900">Airtel Money</p>
                                <p class="text-[10px] text-gray-400">Airtel</p>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
                        <div class="flex">
                            <span class="inline-flex items-center rounded-l-xl border border-r-0 border-gray-300 bg-gray-100 px-3 text-sm text-gray-500">+261</span>
                            <input type="tel" x-model="mobileInput" placeholder="34 00 000 00"
                                class="flex-1 rounded-r-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-mono focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nom du titulaire</label>
                        <input type="text" x-model="mobileHolder" placeholder="Nom lié au compte"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-2 focus:ring-hotel-500/20">
                    </div>
                </div>

                {{-- Actions --}}
                <div class="flex gap-3 pt-2">
                    <button type="button" @click="save()"
                        class="rounded-xl bg-hotel-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-hotel-700 transition-colors">
                        Enregistrer
                    </button>
                    <button type="button" @click="open = false"
                        class="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    </div>

    {{-- Available Plans --}}
    <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div class="border-b border-gray-100 px-6 py-4">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <svg class="h-4 w-4 text-hotel-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                Nos offres d'abonnement
            </h3>
        </div>
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                @foreach($plans as $plan)
                    @php $isCurrentPlan = $abonnementActif && strtolower($abonnementActif->type_abonnement) === $plan->code; @endphp
                    <div class="relative rounded-xl border-2 {{ $isCurrentPlan ? $plan->border . ' bg-gray-50' : 'border-gray-200' }} p-6 flex flex-col transition-all hover:shadow-md">
                        @if($isCurrentPlan)
                            <span class="absolute -top-3 left-4 inline-flex items-center rounded-full bg-hotel-600 px-3 py-0.5 text-xs font-semibold text-white">Plan actuel</span>
                        @elseif($plan->code === 'select')
                            <span class="absolute -top-3 left-4 inline-flex items-center rounded-full bg-hotel-500 px-3 py-0.5 text-xs font-semibold text-white">Populaire</span>
                        @endif

                        <div class="mb-3">
                            <span class="inline-flex items-center rounded-full {{ $plan->badge_bg }} {{ $plan->badge_text }} px-2.5 py-0.5 text-[11px] font-bold">{{ $plan->label }}</span>
                        </div>
                        <h4 class="text-xl font-bold text-gray-900">{{ $plan->nom }}</h4>
                        <p class="text-sm text-gray-500 mt-1 mb-4">{{ $plan->description }}</p>

                        <!-- Prix -->
                        <div class="mb-4 pb-4 border-b border-gray-100">
                            <span class="text-2xl font-bold text-gray-900">{{ number_format($plan->prix, 0, ',', ' ') }}</span>
                            <span class="text-sm text-gray-500 ml-1">{{ $plan->devise }} / mois</span>
                        </div>

                        <ul class="space-y-2.5 flex-1">
                            @foreach($plan->features as $feature)
                                <li class="flex items-start gap-2 text-sm {{ $feature['inclus'] ? 'text-gray-700' : 'text-gray-400' }}">
                                    @if($feature['inclus'])
                                        <svg class="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                                        </svg>
                                    @else
                                        <svg class="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    @endif
                                    {{ $feature['texte'] }}
                                </li>
                            @endforeach
                        </ul>

                        @if(!$isCurrentPlan)
                            <a href="{{ route('hotel.messages.index') }}"
                                class="mt-6 block w-full text-center rounded-lg border {{ $plan->border }} px-4 py-2.5 text-sm font-medium {{ $plan->badge_text }} hover:opacity-80 transition-colors">
                                Demander ce plan
                            </a>
                        @endif
                    </div>
                @endforeach
            </div>

            <p class="mt-6 text-center text-xs text-gray-400">
                Pour changer de plan, contactez l'équipe EVADIA via la messagerie.
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

@push('scripts')
<script>
function paymentMethod() {
    return {
        open: false,
        tab: 'card',
        // État affiché
        method: null,       // 'card' | 'mobile' | null
        cardLast4: '',
        cardExpiry: '',
        operator: 'mvola',
        operatorLabel: 'MVola',
        mobileNumber: '',
        // Champs du formulaire
        cardInput: '',
        expiryInput: '',
        cvvInput: '',
        holderInput: '',
        mobileInput: '',
        mobileHolder: '',

        formatCardNumber(val) {
            return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
        },
        formatExpiry(val) {
            val = val.replace(/\D/g, '').slice(0, 4);
            if (val.length >= 3) return val.slice(0, 2) + '/' + val.slice(2);
            return val;
        },
        formatCardPreview(val) {
            const digits = val.replace(/\s/g, '');
            const padded = digits.padEnd(16, '·');
            return padded.slice(0,4) + ' ' + padded.slice(4,8) + ' ' + padded.slice(8,12) + ' ' + padded.slice(12,16);
        },
        save() {
            if (this.tab === 'card') {
                const digits = this.cardInput.replace(/\s/g, '');
                if (digits.length < 16 || !this.expiryInput || !this.holderInput) return;
                this.method = 'card';
                this.cardLast4 = digits.slice(-4);
                this.cardExpiry = this.expiryInput;
            } else {
                if (!this.mobileInput) return;
                this.method = 'mobile';
                this.operatorLabel = this.operator === 'mvola' ? 'MVola' : (this.operator === 'orange' ? 'Orange Money' : 'Airtel Money');
                this.mobileNumber = '+261 ' + this.mobileInput;
            }
            this.open = false;
        }
    }
}
</script>
@endpush
