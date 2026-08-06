@extends('layouts.hotel')

@section('title', 'Réservations - EVADIA')
@section('page_title', 'Réservations')

@section('content')
<div class="space-y-6">
    {{-- Status Tabs --}}
    <div class="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
        @php
            $tabs = [
                '' => ['label' => 'Toutes', 'count' => $counts['all']],
                'en_attente' => ['label' => 'En attente', 'count' => $counts['en_attente']],
                'acceptee' => ['label' => 'Acceptées', 'count' => $counts['acceptee']],
                'refusee' => ['label' => 'Refusées', 'count' => $counts['refusee']],
                'terminee' => ['label' => 'Terminées', 'count' => $counts['terminee']],
                'annulee' => ['label' => 'Annulées', 'count' => $counts['annulee']],
            ];
        @endphp
        @foreach($tabs as $value => $tab)
            <a href="{{ route('hotel.reservations.index', array_merge(request()->except('statut', 'page'), $value ? ['statut' => $value] : [])) }}"
                class="flex-1 text-center rounded-lg px-3 py-2 text-sm font-medium transition-colors {{ request('statut', '') === $value ? 'bg-hotel-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50' }}">
                {{ $tab['label'] }} <span class="ml-1 {{ request('statut', '') === $value ? 'text-hotel-200' : 'text-gray-400' }}">({{ $tab['count'] }})</span>
            </a>
        @endforeach
    </div>

    {{-- Filters --}}
    <div class="bg-white rounded-xl border border-gray-200 p-4">
        <form method="GET" class="flex flex-wrap gap-4 items-end">
            @if(request('statut'))
                <input type="hidden" name="statut" value="{{ request('statut') }}">
            @endif
            <div class="flex-1 min-w-[200px]">
                <label class="block text-xs font-medium text-gray-500 mb-1">Rechercher</label>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Code réservation, nom du client..."
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Propriété</label>
                <select name="propriete" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    <option value="">Toutes</option>
                    @foreach($proprietes as $p)
                        <option value="{{ $p->id }}" {{ request('propriete') == $p->id ? 'selected' : '' }}>{{ $p->nom }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Du</label>
                <input type="date" name="date_debut" value="{{ request('date_debut') }}"
                    class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Au</label>
                <input type="date" name="date_fin" value="{{ request('date_fin') }}"
                    class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
            </div>
            <button type="submit" class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 transition-colors">Filtrer</button>
            @if(request()->hasAny(['search', 'propriete', 'date_debut', 'date_fin']))
                <a href="{{ route('hotel.reservations.index', request('statut') ? ['statut' => request('statut')] : []) }}" class="text-sm text-gray-500 hover:text-gray-700">Réinitialiser</a>
            @endif
        </form>
    </div>

    {{-- Table --}}
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Code</th>
                        <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Propriété</th>
                        <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Dates</th>
                        <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Montant</th>
                        <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($reservations as $reservation)
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="py-3 px-4 font-medium text-gray-900">{{ $reservation->code_reservation }}</td>
                            <td class="py-3 px-4 text-gray-600">
                                <div>{{ $reservation->client?->prenom }} {{ $reservation->client?->nom }}</div>
                                <div class="text-xs text-gray-400">{{ $reservation->client?->email }}</div>
                            </td>
                            <td class="py-3 px-4 text-gray-600">{{ $reservation->propriete?->nom }}</td>
                            <td class="py-3 px-4 text-gray-600">
                                <div>{{ $reservation->date_debut?->format('d/m/Y') }}</div>
                                <div class="text-xs text-gray-400">au {{ $reservation->date_fin?->format('d/m/Y') }}</div>
                            </td>
                            <td class="py-3 px-4">
                                @php
                                    $statusColors = ['en_attente' => 'bg-amber-50 text-amber-700', 'acceptee' => 'bg-emerald-50 text-emerald-700', 'refusee' => 'bg-red-50 text-red-700', 'terminee' => 'bg-gray-100 text-gray-700', 'annulee' => 'bg-red-50 text-red-700'];
                                    $statusLabels = ['en_attente' => 'En attente', 'acceptee' => 'Acceptée', 'refusee' => 'Refusée', 'terminee' => 'Terminée', 'annulee' => 'Annulée'];
                                @endphp
                                <span class="px-2.5 py-1 rounded-full text-xs font-medium {{ $statusColors[$reservation->statut] ?? 'bg-gray-100 text-gray-700' }}">
                                    {{ $statusLabels[$reservation->statut] ?? ucfirst($reservation->statut) }}
                                </span>
                            </td>
                            <td class="py-3 px-4 text-right font-medium text-gray-900">{{ number_format($reservation->prix_total ?? 0, 0, ',', ' ') }}</td>
                            <td class="py-3 px-4 text-right">
                                <a href="{{ route('hotel.reservations.show', $reservation->id) }}"
                                    class="text-hotel-600 hover:text-hotel-700 text-sm font-medium">Voir</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="py-12 text-center text-sm text-gray-400">
                                Aucune réservation trouvée
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    {{ $reservations->links() }}
</div>
@endsection
