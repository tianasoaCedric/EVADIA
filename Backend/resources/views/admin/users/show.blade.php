@extends('layouts.admin')
@section('title', $user->prenom . ' ' . $user->nom . ' - EVADIA Admin')
@section('page_title', 'Détail utilisateur')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.users.index') }}" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">← Retour à la liste</a>
    </div>

    <!-- User Card -->
    <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 mb-6">
        <div class="flex items-start gap-5">
            <div class="h-16 w-16 rounded-2xl bg-gradient-to-br from-evadia-400 to-evadia-700 flex items-center justify-center text-white text-xl font-bold">
                {{ substr($user->prenom, 0, 1) }}{{ substr($user->nom, 0, 1) }}
            </div>
            <div class="flex-1">
                <div class="flex items-center gap-3">
                    <h2 class="text-xl font-bold text-gray-900">{{ $user->prenom }} {{ $user->nom }}</h2>
                    @if($user->est_actif)
                        <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Actif</span>
                    @else
                        <span class="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700"><span class="h-1.5 w-1.5 rounded-full bg-red-500"></span> Inactif</span>
                    @endif
                </div>
                <p class="text-sm text-gray-500 mt-1">{{ $user->email }}</p>
                <div class="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span class="inline-flex items-center gap-1.5">
                        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                        {{ $user->telephone ?? 'Non renseigne' }}
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                        Inscrit le {{ $user->date_inscription?->format('d/m/Y') }}
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Derniere connexion : {{ $user->derniere_connexion?->diffForHumans() ?? 'Jamais' }}
                    </span>
                </div>
                <div class="flex items-center gap-2 mt-3">
                    @foreach($user->roles as $role)
                        <span class="rounded-full bg-evadia-50 px-3 py-1 text-xs font-medium text-evadia-700">{{ $role->nom }}</span>
                    @endforeach
                </div>
            </div>
            <a href="{{ route('admin.users.edit', $user) }}" class="rounded-xl bg-evadia-600 px-4 py-2 text-sm font-medium text-white hover:bg-evadia-700 transition-colors">
                Modifier
            </a>
        </div>
    </div>

    <!-- Tabs -->
    <div x-data="{ tab: 'reservations' }">
        <div class="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
            <button @click="tab = 'reservations'" :class="tab === 'reservations' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'" class="rounded-lg px-4 py-2 text-sm font-medium transition-all">Réservations</button>
            <button @click="tab = 'addresses'" :class="tab === 'addresses' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'" class="rounded-lg px-4 py-2 text-sm font-medium transition-all">Adresses</button>
            <button @click="tab = 'payments'" :class="tab === 'payments' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'" class="rounded-lg px-4 py-2 text-sm font-medium transition-all">Paiement</button>
        </div>

        <!-- Reservations Tab -->
        <div x-show="tab === 'reservations'" class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Propriété</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Dates</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Montant</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($user->reservations as $res)
                        <tr class="hover:bg-gray-50/50">
                            <td class="px-6 py-3.5 text-sm font-mono text-gray-900">{{ $res->code_reservation }}</td>
                            <td class="px-6 py-3.5 text-sm text-gray-600">{{ $res->propriete?->nom }} <span class="text-gray-400">— {{ $res->propriete?->hotel?->nom }}</span></td>
                            <td class="px-6 py-3.5 text-sm text-gray-600">{{ $res->date_debut?->format('d/m') }} → {{ $res->date_fin?->format('d/m/Y') }}</td>
                            <td class="px-6 py-3.5 text-sm font-medium text-gray-900">{{ number_format($res->prix_total, 2, ',', ' ') }} {{ $res->devise_prix_total }}</td>
                            <td class="px-6 py-3.5">
                                <span class="rounded-full px-2.5 py-0.5 text-xs font-medium
                                    {{ $res->statut === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : ($res->statut === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600') }}">
                                    {{ ucfirst($res->statut) }}
                                </span>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="5" class="px-6 py-8 text-center text-sm text-gray-400">Aucune réservation</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Addresses Tab -->
        <div x-show="tab === 'addresses'" x-cloak class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            @if($user->profilClient && $user->profilClient->adresses->count())
                <div class="grid gap-4 sm:grid-cols-2">
                    @foreach($user->profilClient->adresses as $adresse)
                        <div class="rounded-xl border border-gray-200 p-4">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-xs font-medium uppercase text-gray-500">{{ $adresse->type_adresse }}</span>
                                @if($adresse->est_defaut)
                                    <span class="rounded-full bg-evadia-50 px-2 py-0.5 text-[10px] font-medium text-evadia-700">Par défaut</span>
                                @endif
                            </div>
                            <p class="text-sm text-gray-900">{{ $adresse->adresse_ligne1 }}</p>
                            @if($adresse->adresse_ligne2) <p class="text-sm text-gray-600">{{ $adresse->adresse_ligne2 }}</p> @endif
                            <p class="text-sm text-gray-600">{{ $adresse->code_postal }} {{ $adresse->ville }}, {{ $adresse->pays }}</p>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-sm text-gray-400 text-center py-4">Aucune adresse enregistrée</p>
            @endif
        </div>

        <!-- Payments Tab -->
        <div x-show="tab === 'payments'" x-cloak class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            @if($user->profilClient && $user->profilClient->methodesPaiement->count())
                <div class="grid gap-4 sm:grid-cols-2">
                    @foreach($user->profilClient->methodesPaiement as $mp)
                        <div class="rounded-xl border border-gray-200 p-4">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-medium text-gray-900">{{ ucfirst($mp->type_paiement) }}</span>
                                @if($mp->est_defaut)
                                    <span class="rounded-full bg-evadia-50 px-2 py-0.5 text-[10px] font-medium text-evadia-700">Par défaut</span>
                                @endif
                            </div>
                            <p class="text-sm text-gray-600">•••• {{ $mp->derniers_4_chiffres }}</p>
                            @if($mp->date_expiration) <p class="text-xs text-gray-400">Exp. {{ $mp->date_expiration }}</p> @endif
                            @if($mp->titulaire) <p class="text-xs text-gray-500 mt-1">{{ $mp->titulaire }}</p> @endif
                        </div>
                    @endforeach
                </div>
            @else
                <p class="text-sm text-gray-400 text-center py-4">Aucune méthode de paiement</p>
            @endif
        </div>
    </div>
@endsection
