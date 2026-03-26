@extends('layouts.admin')
@section('title', 'Suivi des abonnements - EVADIA Admin')
@section('page_title', 'Suivi des abonnements')

@section('content')
    <div class="space-y-6">
        {{-- Filters --}}
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <form method="GET" action="{{ route('admin.subscriptions.index') }}" class="flex items-center gap-3 flex-wrap">
                {{-- Search --}}
                <div class="relative">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input type="text" name="search" value="{{ $search }}" placeholder="Rechercher un hotel..."
                        class="rounded-xl border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 w-64">
                </div>

                {{-- Year filter --}}
                <select name="year" onchange="this.form.submit()"
                    class="rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    @for($y = now()->year + 1; $y >= now()->year - 5; $y--)
                        <option value="{{ $y }}" {{ $year == $y ? 'selected' : '' }}>{{ $y }}</option>
                    @endfor
                </select>

                <button type="submit" class="rounded-xl bg-evadia-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-evadia-700 transition-colors">
                    Filtrer
                </button>
            </form>

            <a href="{{ route('admin.subscriptions.create') }}"
                class="rounded-xl bg-evadia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 flex items-center gap-2 transition-colors shrink-0">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Nouvel abonnement
            </a>
        </div>

        {{-- Legend --}}
        <div class="flex items-center gap-6 text-xs text-gray-500">
            <div class="flex items-center gap-1.5">
                <span class="inline-block h-3 w-3 rounded bg-emerald-500"></span> Actif
            </div>
            <div class="flex items-center gap-1.5">
                <span class="inline-block h-3 w-3 rounded bg-red-400"></span> Expire
            </div>
            <div class="flex items-center gap-1.5">
                <span class="inline-block h-3 w-3 rounded bg-gray-200"></span> Pas d'abonnement
            </div>
        </div>

        {{-- Table --}}
        <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="sticky left-0 z-10 bg-gray-50 px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase min-w-[200px]">
                                Hotel
                            </th>
                            @foreach($months as $num => $label)
                                <th class="px-2 py-3.5 text-center text-xs font-semibold {{ $num == now()->month && $year == now()->year ? 'text-evadia-600' : 'text-gray-500' }} uppercase min-w-[70px]">
                                    {{ $label }}
                                </th>
                            @endforeach
                            <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        @forelse($hotels as $hotel)
                            @php
                                $hotelAbos = $abonnements->get($hotel->id, collect());
                            @endphp
                            <tr class="hover:bg-gray-50/50">
                                {{-- Hotel name (sticky) --}}
                                <td class="sticky left-0 z-10 bg-white px-6 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                                    <a href="{{ route('admin.hotels.show', $hotel) }}" class="hover:text-evadia-600 transition-colors">
                                        {{ $hotel->nom }}
                                    </a>
                                </td>

                                {{-- Month cells --}}
                                @foreach($months as $monthNum => $label)
                                    @php
                                        $monthStart = \Carbon\Carbon::create($year, $monthNum, 1);
                                        $monthEnd = $monthStart->copy()->endOfMonth();

                                        $abo = $hotelAbos->first(function ($a) use ($monthStart, $monthEnd) {
                                            $start = \Carbon\Carbon::parse($a->date_debut);
                                            $end = $a->date_fin ? \Carbon\Carbon::parse($a->date_fin) : null;
                                            return $start <= $monthEnd && (!$end || $end >= $monthStart);
                                        });

                                        $isCurrent = false;
                                        $isExpired = false;
                                        if ($abo) {
                                            $aboEnd = $abo->date_fin ? \Carbon\Carbon::parse($abo->date_fin) : null;
                                            $isExpired = $aboEnd && $aboEnd->lt(now());
                                            $isCurrent = !$isExpired;
                                        }

                                        $isCurrentMonth = ($monthNum == now()->month && $year == now()->year);
                                    @endphp
                                    <td class="px-1.5 py-2.5 text-center {{ $isCurrentMonth ? 'bg-evadia-50/30' : '' }}">
                                        @if($abo)
                                            <a href="{{ route('admin.subscriptions.show', $abo) }}"
                                                class="inline-flex items-center justify-center h-8 w-full rounded-lg text-[10px] font-semibold transition-colors
                                                    {{ $isCurrent ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-600 hover:bg-red-200' }}"
                                                title="{{ ucfirst($abo->type_abonnement) }} — {{ number_format($abo->prix_mensuel, 0, ',', ' ') }} {{ $abo->devise }}/mois">
                                                {{ ucfirst(substr($abo->type_abonnement, 0, 4)) }}
                                            </a>
                                        @else
                                            <span class="inline-flex items-center justify-center h-8 w-full rounded-lg bg-gray-100 text-gray-300 text-xs">
                                                —
                                            </span>
                                        @endif
                                    </td>
                                @endforeach

                                {{-- Actions --}}
                                <td class="px-4 py-3 text-center whitespace-nowrap">
                                    @php $latestAbo = $hotelAbos->sortByDesc('created_at')->first(); @endphp
                                    @if($latestAbo)
                                        <a href="{{ route('admin.subscriptions.show', $latestAbo) }}"
                                            class="rounded-lg p-1.5 text-gray-400 hover:text-evadia-600 hover:bg-evadia-50 transition-colors inline-block"
                                            title="Voir">
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </a>
                                        <a href="{{ route('admin.subscriptions.edit', $latestAbo) }}"
                                            class="rounded-lg p-1.5 text-gray-400 hover:text-evadia-600 hover:bg-evadia-50 transition-colors inline-block"
                                            title="Modifier">
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                            </svg>
                                        </a>
                                    @else
                                        <span class="text-xs text-gray-300">—</span>
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="14" class="px-6 py-12 text-center text-sm text-gray-400">
                                    Aucun hotel trouve
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            {{-- Pagination --}}
            <div class="border-t border-gray-100 px-6 py-4">
                {{ $hotels->links() }}
            </div>
        </div>
    </div>
@endsection
