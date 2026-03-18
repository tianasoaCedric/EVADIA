@extends('layouts.hotel')

@section('title', 'Dashboard - ' . $hotel->nom)
@section('page_title', 'Dashboard')

@section('content')
    <div class="space-y-6">
        {{-- Welcome Banner --}}
        <div class="bg-gradient-to-r from-hotel-600 to-hotel-800 rounded-2xl p-6 text-white relative overflow-hidden">
            <div class="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
            <div class="relative">
                <h2 class="text-2xl font-bold">Bienvenue, {{ auth()->user()->prenom }} 👋</h2>
                <p class="text-hotel-200 mt-1">{{ $hotel->nom }} — Voici un aperçu de votre activité</p>
            </div>
        </div>

        {{-- Stats Cards --}}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {{-- Reservations total --}}
            <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-3">
                    <div class="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                    </div>
                </div>
                <p class="text-2xl font-bold text-gray-900">{{ $stats['reservations_total'] }}</p>
                <p class="text-xs text-gray-500 mt-1">Réservations totales</p>
                <div class="flex gap-2 mt-3 text-xs">
                    <span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{{ $stats['reservations_pending'] }}
                        en attente</span>
                    <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{{ $stats['reservations_paid'] }}
                        payées</span>
                </div>
            </div>

            {{-- Revenue --}}
            <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-3">
                    <div class="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <svg class="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <p class="text-2xl font-bold text-gray-900">{{ number_format($stats['revenus_mois'], 0, ',', ' ') }}</p>
                <p class="text-xs text-gray-500 mt-1">Revenus du mois ({{ $hotel->devise_principale ?? 'EUR' }})</p>
            </div>

            {{-- Properties --}}
            <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-3">
                    <div class="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <svg class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                        </svg>
                    </div>
                </div>
                <p class="text-2xl font-bold text-gray-900">{{ $stats['total_proprietes'] }}</p>
                <p class="text-xs text-gray-500 mt-1">Chambres / Propriétés</p>
                <p class="text-xs text-emerald-600 mt-2">{{ $stats['proprietes_disponibles'] }} disponibles</p>
            </div>

            {{-- Average rating --}}
            <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-3">
                    <div class="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                        <svg class="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                            <path
                                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </div>
                </div>
                <p class="text-2xl font-bold text-gray-900">
                    {{ $stats['note_moyenne'] ? number_format($stats['note_moyenne'], 1) : 'N/A' }}</p>
                <p class="text-xs text-gray-500 mt-1">Note moyenne</p>
                @if($stats['avis_sans_reponse'] > 0)
                    <p class="text-xs text-red-500 mt-2">{{ $stats['avis_sans_reponse'] }} avis sans réponse</p>
                @endif
            </div>

            {{-- Unread messages --}}
            <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-3">
                    <div class="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                        <svg class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                    </div>
                </div>
                <p class="text-2xl font-bold text-gray-900">{{ $stats['messages_non_lus'] }}</p>
                <p class="text-xs text-gray-500 mt-1">Messages non lus</p>
            </div>
        </div>

        {{-- Charts --}}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-4">Réservations par mois</h3>
                <canvas id="reservationsChart" height="200"></canvas>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="text-sm font-semibold text-gray-900 mb-4">Revenus par mois
                    ({{ $hotel->devise_principale ?? 'EUR' }})</h3>
                <canvas id="revenusChart" height="200"></canvas>
            </div>
        </div>

        {{-- Upcoming arrivals & Latest reviews --}}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {{-- Upcoming arrivals --}}
            <div class="bg-white rounded-xl border border-gray-200">
                <div class="px-6 py-4 border-b border-gray-100">
                    <h3 class="text-sm font-semibold text-gray-900">Prochaines arrivées (7 jours)</h3>
                </div>
                <div class="divide-y divide-gray-50">
                    @forelse($prochaines_arrivees as $reservation)
                        <div class="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div>
                                <p class="text-sm font-medium text-gray-900">{{ $reservation->client?->prenom }}
                                    {{ $reservation->client?->nom }}</p>
                                <p class="text-xs text-gray-500">{{ $reservation->propriete?->nom }} —
                                    {{ $reservation->date_debut?->format('d/m') }} au
                                    {{ $reservation->date_fin?->format('d/m') }}</p>
                            </div>
                            <span
                                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                    {{ $reservation->statut === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700' }}">
                                {{ $reservation->statut === 'paid' ? 'Confirmée' : ucfirst($reservation->statut) }}
                            </span>
                        </div>
                    @empty
                        <div class="px-6 py-8 text-center text-sm text-gray-400">
                            Aucune arrivée dans les 7 prochains jours
                        </div>
                    @endforelse
                </div>
            </div>

            {{-- Latest reviews --}}
            <div class="bg-white rounded-xl border border-gray-200">
                <div class="px-6 py-4 border-b border-gray-100">
                    <h3 class="text-sm font-semibold text-gray-900">Derniers avis</h3>
                </div>
                <div class="divide-y divide-gray-50">
                    @forelse($derniers_avis as $avis)
                        <div class="px-6 py-3 hover:bg-gray-50 transition-colors">
                            <div class="flex items-center justify-between mb-1">
                                <p class="text-sm font-medium text-gray-900">{{ $avis->client?->prenom }}
                                    {{ $avis->client?->nom }}</p>
                                <div class="flex items-center gap-0.5">
                                    @for($i = 1; $i <= 5; $i++)
                                        <svg class="h-3.5 w-3.5 {{ $i <= $avis->note ? 'text-amber-400' : 'text-gray-200' }}"
                                            fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    @endfor
                                </div>
                            </div>
                            <p class="text-xs text-gray-500">{{ $avis->propriete?->nom }} —
                                {{ $avis->date_avis?->format('d/m/Y') }}</p>
                            <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ $avis->commentaire }}</p>
                            @if(!$avis->reponse_hotel)
                                <span class="inline-flex items-center text-xs text-red-500 mt-1">
                                    <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="8" />
                                    </svg>
                                    En attente de réponse
                                </span>
                            @endif
                        </div>
                    @empty
                        <div class="px-6 py-8 text-center text-sm text-gray-400">
                            Aucun avis pour le moment
                        </div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            // Reservations Chart
            const resLabels = @json($reservations_par_mois->pluck('mois'));
            const resData = @json($reservations_par_mois->pluck('total'));

            new Chart(document.getElementById('reservationsChart'), {
                type: 'bar',
                data: {
                    labels: resLabels,
                    datasets: [{
                        label: 'Réservations',
                        data: resData,
                        backgroundColor: 'rgba(168, 85, 247, 0.15)',
                        borderColor: 'rgb(168, 85, 247)',
                        borderWidth: 2,
                        borderRadius: 6,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } },
                        x: { grid: { display: false } }
                    }
                }
            });

            // Revenue Chart
            const revLabels = @json($revenus_par_mois->pluck('mois'));
            const revData = @json($revenus_par_mois->pluck('total'));

            new Chart(document.getElementById('revenusChart'), {
                type: 'line',
                data: {
                    labels: revLabels,
                    datasets: [{
                        label: 'Revenus',
                        data: revData,
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointBackgroundColor: 'rgb(16, 185, 129)',
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true },
                        x: { grid: { display: false } }
                    }
                }
            });
        });
    </script>
@endpush