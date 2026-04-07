@extends('layouts.admin')

@section('title', 'Dashboard - EVADIA Admin')
@section('page_title', 'Dashboard')

@section('content')
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <!-- Total clients -->
        <div
            class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">Clients actifs</p>
                    <p class="mt-1 text-3xl font-bold text-gray-900">{{ number_format($stats['total_users']) }}</p>
                </div>
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                </div>
            </div>
            <div class="mt-3 flex items-center gap-1 text-xs">
                <span class="font-medium text-emerald-600">+{{ $stats['new_users_week'] }}</span>
                <span class="text-gray-400">cette semaine</span>
            </div>
            <div
                class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            </div>
        </div>

        <!-- Total hôtels -->
        <div
            class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">Hôtels</p>
                    <p class="mt-1 text-3xl font-bold text-gray-900">{{ number_format($stats['total_hotels']) }}</p>
                </div>
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0-.75 3.75m0 0-.75 3.75M17.25 7.5l-.75 3.75" />
                    </svg>
                </div>
            </div>
        </div>

        <!-- Réservations en cours -->
        <div
            class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">Réservations en cours</p>
                    <p class="mt-1 text-3xl font-bold text-gray-900">{{ number_format($stats['reservations_en_cours']) }}
                    </p>
                </div>
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                </div>
            </div>
        </div>

        <!-- CA Abonnements -->
        <div
            class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">CA Abonnements/mois</p>
                    <p class="mt-1 text-3xl font-bold text-gray-900">
                        {{ number_format($stats['ca_abonnements_mois'], 0, ',', ' ') }} MGA</p>
                </div>
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <!-- Abonnements expirant -->
        <div
            class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">Abonnements expirant</p>
                    <p
                        class="mt-1 text-3xl font-bold {{ $stats['abonnements_expirant'] > 0 ? 'text-red-600' : 'text-gray-900' }}">
                        {{ $stats['abonnements_expirant'] }}</p>
                </div>
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                </div>
            </div>
            <p class="mt-2 text-xs text-gray-400">Dans les 30 prochains jours</p>
        </div>

        <!-- Nouveaux inscrits semaine -->
        <div
            class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">Inscrits cette semaine</p>
                    <p class="mt-1 text-3xl font-bold text-gray-900">{{ $stats['new_users_week'] }}</p>
                </div>
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Inscriptions Chart -->
        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Inscriptions (12 derniers mois)</h3>
            <canvas id="inscriptionsChart" height="200"></canvas>
        </div>

        <!-- Revenus Chart -->
        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Revenus abonnements (12 derniers mois)</h3>
            <canvas id="revenusChart" height="200"></canvas>
        </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Users -->
        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-gray-900">Derniers utilisateurs</h3>
                <a href="{{ route('admin.users.index') }}"
                    class="text-xs font-medium text-evadia-600 hover:text-evadia-700">Voir tout →</a>
            </div>
            <div class="space-y-3">
                @forelse($recent_users as $user)
                    <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div
                            class="h-9 w-9 rounded-full bg-gradient-to-br from-evadia-400 to-evadia-600 flex items-center justify-center text-white text-xs font-bold">
                            {{ substr($user->prenom, 0, 1) }}{{ substr($user->nom, 0, 1) }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 truncate">{{ $user->prenom }} {{ $user->nom }}</p>
                            <p class="text-xs text-gray-500 truncate">{{ $user->email }}</p>
                        </div>
                        <span class="text-xs text-gray-400">{{ $user->date_inscription?->diffForHumans() }}</span>
                    </div>
                @empty
                    <p class="text-sm text-gray-400 text-center py-4">Aucun utilisateur récent</p>
                @endforelse
            </div>
        </div>

        <!-- Recent Logs -->
        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Activité récente</h3>
            <div class="space-y-3">
                @forelse($recent_logs as $log)
                    <div class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div class="mt-0.5 h-2 w-2 rounded-full bg-evadia-500 shrink-0"></div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm text-gray-700">
                                <span class="font-medium">{{ $log->admin?->prenom }}</span> — {{ $log->action }}
                            </p>
                            @if($log->details)
                                <p class="text-xs text-gray-400 mt-0.5 truncate">{{ $log->details }}</p>
                            @endif
                        </div>
                        <span class="text-xs text-gray-400 whitespace-nowrap">{{ $log->date_action?->diffForHumans() }}</span>
                    </div>
                @empty
                    <p class="text-sm text-gray-400 text-center py-4">Aucune activité récente</p>
                @endforelse
            </div>
        </div>
    </div>
@endsection

@push('scripts')
    <script>
        // Inscriptions Chart
        const inscriptionsData = @json($inscriptions_par_mois);
        new Chart(document.getElementById('inscriptionsChart'), {
            type: 'bar',
            data: {
                labels: inscriptionsData.map(d => d.mois),
                datasets: [{
                    label: 'Inscriptions',
                    data: inscriptionsData.map(d => d.total),
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    borderColor: 'rgba(59, 130, 246, 0.8)',
                    borderWidth: 2,
                    borderRadius: 8,
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
        });

        // Revenus Chart
        const revenusData = @json($revenus_par_mois);
        new Chart(document.getElementById('revenusChart'), {
            type: 'line',
            data: {
                labels: revenusData.map(d => d.mois),
                datasets: [{
                    label: 'Revenus (€)',
                    data: revenusData.map(d => d.total),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#8b5cf6',
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    </script>
@endpush