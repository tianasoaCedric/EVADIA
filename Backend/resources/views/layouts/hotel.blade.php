<!DOCTYPE html>
<html lang="fr" class="h-full">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'EVADIA - Espace Hôtelier')</title>
    <link rel="icon" type="image/png" href="{{ asset('images/Evadia_Logo BW 4.png') }}">
    <meta name="description"
        content="@yield('meta_description', 'Back-office hôtelier EVADIA - Gestion de votre hôtel')">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet">

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: {
                        hotel: {
                            50: '#e6f7f4',
                            100: '#ccefea',
                            200: '#99dfd5',
                            300: '#66cfbf',
                            400: '#33bfaa',
                            500: '#019985',
                            600: '#017a6b',
                            700: '#016156',
                            800: '#014940',
                            900: '#01382f',
                            950: '#00241f',
                        },
                        evadia: {
                            50: '#ecfdf8',
                            100: '#d1faf0',
                            200: '#a7f3e2',
                            300: '#6ee7cc',
                            400: '#34d4b3',
                            500: '#01BDA5',
                            600: '#019985',
                            700: '#017a6b',
                            800: '#016156',
                            900: '#015047',
                            950: '#002f2b',
                        }
                    }
                }
            }
        }
    </script>

    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

    <style>
        [x-cloak] { display: none !important; }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

        /* Sidebar scrollbar */
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }

        /* Sidebar link base */
        .sidebar-link {
            position: relative;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.625rem 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            color: rgba(255,255,255,0.6);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-link:hover {
            color: #fff;
            background: rgba(255,255,255,0.08);
        }
        .sidebar-link.active {
            color: #fff;
            background: rgba(255,255,255,0.12);
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }
        .sidebar-link.active::before {
            content: '';
            position: absolute;
            left: -0.75rem;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 60%;
            background: #019985;
            border-radius: 0 3px 3px 0;
        }

        /* Tooltip for collapsed sidebar */
        .sidebar-tooltip {
            display: none;
            position: absolute;
            left: calc(100% + 0.75rem);
            top: 50%;
            transform: translateY(-50%);
            padding: 0.375rem 0.75rem;
            background: #1e293b;
            color: #fff;
            font-size: 0.75rem;
            font-weight: 500;
            border-radius: 0.375rem;
            white-space: nowrap;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
            z-index: 60;
            pointer-events: none;
        }
        .sidebar-tooltip::before {
            content: '';
            position: absolute;
            right: 100%;
            top: 50%;
            transform: translateY(-50%);
            border: 5px solid transparent;
            border-right-color: #1e293b;
        }
    </style>
    @stack('styles')
</head>

<body class="h-full bg-gray-50 font-sans antialiased"
    x-data="{ sidebarOpen: true, profileOpen: false, notifOpen: false }">

    <div class="flex h-full">
        <!-- ═══════════════ MOBILE OVERLAY ═══════════════ -->
        <div x-show="sidebarOpen" @click="sidebarOpen = false"
            x-transition:enter="transition-opacity ease-out duration-300" x-transition:enter-start="opacity-0"
            x-transition:enter-end="opacity-100" x-transition:leave="transition-opacity ease-in duration-200"
            x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0"
            class="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden" x-cloak></div>

        <!-- ═══════════════ SIDEBAR ═══════════════ -->
        <aside
            class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-slate-900 via-hotel-950 to-slate-950 shadow-2xl transition-all duration-300 ease-in-out"
            :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-[4.5rem]'">

            <!-- Logo -->
            <div class="flex h-16 items-center px-4 border-b border-white/[0.06]">
                <a href="{{ route('hotel.dashboard') }}" class="flex items-center">
                    <img x-show="sidebarOpen" src="{{ asset('images/Evadia_Logo BW 1.png') }}" alt="EVADIA" class="h-9">
                    <img x-show="!sidebarOpen" src="{{ asset('images/Evadia_Logo BW 4.png') }}" alt="EVADIA" class="h-9 mx-auto">
                </a>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 overflow-y-auto sidebar-scroll py-5 px-3 space-y-6">
                <!-- Section: Principal -->
                <div>
                    <p x-show="sidebarOpen" class="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Principal</p>
                    <div class="space-y-0.5">
                        <a href="{{ route('hotel.dashboard') }}"
                            class="sidebar-link group {{ request()->routeIs('hotel.dashboard') ? 'active' : '' }}">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {{ request()->routeIs('hotel.dashboard') ? 'bg-hotel-500/20 text-hotel-400' : 'text-white/50 group-hover:text-white/80' }} transition-colors">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                </svg>
                            </div>
                            <span x-show="sidebarOpen">Dashboard</span>
                            <span x-show="!sidebarOpen" class="sidebar-tooltip">Dashboard</span>
                        </a>

                        <a href="{{ route('hotel.content.show') }}"
                            class="sidebar-link group {{ request()->routeIs('hotel.content.*') ? 'active' : '' }}">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {{ request()->routeIs('hotel.content.*') ? 'bg-amber-500/20 text-amber-400' : 'text-white/50 group-hover:text-white/80' }} transition-colors">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0-.75 3.75m0 0-.75 3.75M17.25 7.5l-.75 3.75" />
                                </svg>
                            </div>
                            <span x-show="sidebarOpen">Mon Hôtel</span>
                            <span x-show="!sidebarOpen" class="sidebar-tooltip">Mon Hôtel</span>
                        </a>
                    </div>
                </div>

                <!-- Section: Hébergement -->
                <div>
                    <p x-show="sidebarOpen" class="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Hébergement</p>
                    <div class="space-y-0.5">
                        <a href="{{ route('hotel.rooms.index') }}"
                            class="sidebar-link group {{ request()->routeIs('hotel.rooms.*') ? 'active' : '' }}">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {{ request()->routeIs('hotel.rooms.*') ? 'bg-violet-500/20 text-violet-400' : 'text-white/50 group-hover:text-white/80' }} transition-colors">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                                </svg>
                            </div>
                            <span x-show="sidebarOpen">Chambres</span>
                            <span x-show="!sidebarOpen" class="sidebar-tooltip">Chambres</span>
                        </a>

                        <a href="{{ route('hotel.reservations.index') }}"
                            class="sidebar-link group {{ request()->routeIs('hotel.reservations.*') ? 'active' : '' }}">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {{ request()->routeIs('hotel.reservations.*') ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/50 group-hover:text-white/80' }} transition-colors">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                </svg>
                            </div>
                            <span x-show="sidebarOpen">Réservations</span>
                            <span x-show="!sidebarOpen" class="sidebar-tooltip">Réservations</span>
                        </a>

                        <a href="{{ route('hotel.calendar.index') }}"
                            class="sidebar-link group {{ request()->routeIs('hotel.calendar.*') ? 'active' : '' }}">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {{ request()->routeIs('hotel.calendar.*') ? 'bg-sky-500/20 text-sky-400' : 'text-white/50 group-hover:text-white/80' }} transition-colors">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                            </div>
                            <span x-show="sidebarOpen">Calendrier</span>
                            <span x-show="!sidebarOpen" class="sidebar-tooltip">Calendrier</span>
                        </a>
                    </div>
                </div>

                <!-- Section: Commercial -->
                <div>
                    <p x-show="sidebarOpen" class="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Commercial</p>
                    <div class="space-y-0.5">
                        <a href="{{ route('hotel.pricing.index') }}"
                            class="sidebar-link group {{ request()->routeIs('hotel.pricing.*') || request()->routeIs('hotel.offers.*') ? 'active' : '' }}">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {{ request()->routeIs('hotel.pricing.*') || request()->routeIs('hotel.offers.*') ? 'bg-rose-500/20 text-rose-400' : 'text-white/50 group-hover:text-white/80' }} transition-colors">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
                                </svg>
                            </div>
                            <span x-show="sidebarOpen">Prix & Offres</span>
                            <span x-show="!sidebarOpen" class="sidebar-tooltip">Prix & Offres</span>
                        </a>

                        <a href="{{ route('hotel.payments.index') }}"
                            class="sidebar-link group {{ request()->routeIs('hotel.payments.*') ? 'active' : '' }}">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {{ request()->routeIs('hotel.payments.*') ? 'bg-teal-500/20 text-teal-400' : 'text-white/50 group-hover:text-white/80' }} transition-colors">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                </svg>
                            </div>
                            <span x-show="sidebarOpen">Paiements</span>
                            <span x-show="!sidebarOpen" class="sidebar-tooltip">Paiements</span>
                        </a>

                        <a href="{{ route('hotel.subscription.index') }}"
                            class="sidebar-link group {{ request()->routeIs('hotel.subscription.*') ? 'active' : '' }}">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {{ request()->routeIs('hotel.subscription.*') ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/50 group-hover:text-white/80' }} transition-colors">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                </svg>
                            </div>
                            <span x-show="sidebarOpen">Abonnement</span>
                            <span x-show="!sidebarOpen" class="sidebar-tooltip">Abonnement</span>
                        </a>
                    </div>
                </div>

                <!-- Section: Communication -->
                <div>
                    <p x-show="sidebarOpen" class="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Communication</p>
                    <div class="space-y-0.5">
                        @php $unreadMsgCount = \App\Models\Message::where('destinataire_id', auth('hotel')->id())->where('lu', false)->count() @endphp
                        <a href="{{ route('hotel.messages.index') }}"
                            class="sidebar-link group {{ request()->routeIs('hotel.messages.*') ? 'active' : '' }}">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {{ request()->routeIs('hotel.messages.*') ? 'bg-sky-500/20 text-sky-400' : 'text-white/50 group-hover:text-white/80' }} transition-colors relative">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                </svg>
                                @if($unreadMsgCount > 0)
                                    <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-slate-900">{{ $unreadMsgCount > 9 ? '9+' : $unreadMsgCount }}</span>
                                @endif
                            </div>
                            <span x-show="sidebarOpen">Messagerie</span>
                            @if($unreadMsgCount > 0)
                                <span x-show="sidebarOpen" class="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500/20 px-1.5 text-[10px] font-bold text-red-400">{{ $unreadMsgCount > 99 ? '99+' : $unreadMsgCount }}</span>
                            @endif
                            <span x-show="!sidebarOpen" class="sidebar-tooltip">Messagerie</span>
                        </a>

                        <a href="{{ route('hotel.notifications.index') }}"
                            class="sidebar-link group {{ request()->routeIs('hotel.notifications.*') ? 'active' : '' }}">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {{ request()->routeIs('hotel.notifications.*') ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/50 group-hover:text-white/80' }} transition-colors">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                </svg>
                            </div>
                            <span x-show="sidebarOpen">Notifications</span>
                            <span x-show="!sidebarOpen" class="sidebar-tooltip">Notifications</span>
                        </a>
                    </div>
                </div>
            </nav>

            <!-- Sidebar Footer - User info -->
            <div class="border-t border-white/[0.06] p-3">
                <a href="{{ route('hotel.profile.edit') }}"
                    class="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-white/[0.06] transition-colors">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-hotel-400 to-hotel-600 text-white text-xs font-bold shadow-lg shadow-hotel-500/20">
                        {{ substr(auth('hotel')->user()->prenom, 0, 1) }}{{ substr(auth('hotel')->user()->nom, 0, 1) }}
                    </div>
                    <div x-show="sidebarOpen" class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-white/90 truncate">{{ auth('hotel')->user()->prenom }} {{ auth('hotel')->user()->nom }}</p>
                        <p class="text-[10px] text-white/40 truncate">Mon profil</p>
                    </div>
                    <div x-show="sidebarOpen" class="shrink-0">
                        <div class="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></div>
                    </div>
                </a>
            </div>
        </aside>

        <!-- ═══════════════ MAIN CONTENT ═══════════════ -->
        <div class="flex-1 flex flex-col" :class="sidebarOpen ? 'ml-64' : 'ml-0 lg:ml-20'">

            <!-- Header -->
            <header
                class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-xl px-6 shadow-sm">
                <!-- Left: Toggle + Page title -->
                <div class="flex items-center gap-4">
                    <button @click="sidebarOpen = !sidebarOpen"
                        class="rounded-lg p-2 hover:bg-gray-100 transition-colors">
                        <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <h1 class="text-lg font-semibold text-gray-900">@yield('page_title', 'Dashboard')</h1>
                </div>

                <!-- Right: Notifications + Profile -->
                <div class="flex items-center gap-3">
                    <!-- Notifications -->
                    <div class="relative" x-data="{ open: false, notifications: [], unread: 0, loading: false }"
                        x-init="
                            fetch('{{ route('hotel.notifications.recent') }}')
                                .then(r => r.json())
                                .then(d => { notifications = d.notifications; unread = d.unread_count; });
                        ">
                        <button @click="open = !open; if(open && !loading) { loading = true; fetch('{{ route('hotel.notifications.recent') }}').then(r => r.json()).then(d => { notifications = d.notifications; unread = d.unread_count; loading = false; }); }"
                            class="relative rounded-lg p-2 hover:bg-gray-100 transition-colors">
                            <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                            <span x-show="unread > 0" x-text="unread > 99 ? '99+' : unread"
                                class="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white"></span>
                        </button>

                        <!-- Dropdown -->
                        <div x-show="open" x-cloak @click.away="open = false"
                            x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 scale-95" x-transition:enter-end="opacity-100 scale-100"
                            x-transition:leave="transition ease-in duration-150" x-transition:leave-start="opacity-100 scale-100" x-transition:leave-end="opacity-0 scale-95"
                            class="absolute right-0 mt-2 w-96 rounded-xl bg-white shadow-xl ring-1 ring-gray-200 z-50">
                            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <h3 class="text-sm font-semibold text-gray-900">Notifications</h3>
                                <button x-show="unread > 0" @click.prevent="
                                    fetch('{{ route('hotel.notifications.mark-all-read') }}', { method: 'POST', headers: {'X-CSRF-TOKEN': '{{ csrf_token() }}', 'Accept': 'application/json'} })
                                        .then(() => { unread = 0; notifications = notifications.map(n => ({...n, lu: true})); });
                                " class="text-xs text-hotel-600 hover:text-hotel-700 font-medium">Tout marquer lu</button>
                            </div>
                            <div class="max-h-80 overflow-y-auto divide-y divide-gray-50">
                                <template x-for="notif in notifications" :key="notif.id">
                                    <a :href="notif.lien || '#'" @click="
                                        if(!notif.lu) {
                                            fetch('/hotel/notifications/' + notif.id + '/read', { method: 'PATCH', headers: {'X-CSRF-TOKEN': '{{ csrf_token() }}', 'Accept': 'application/json'} });
                                            notif.lu = true; unread = Math.max(0, unread - 1);
                                        }
                                    " class="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors" :class="!notif.lu ? 'bg-hotel-50/40' : ''">
                                        <div class="shrink-0 mt-0.5">
                                            <div class="h-8 w-8 rounded-full flex items-center justify-center" :class="!notif.lu ? 'bg-hotel-100 text-hotel-600' : 'bg-gray-100 text-gray-400'">
                                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="min-w-0 flex-1">
                                            <p class="text-sm text-gray-900 truncate" :class="!notif.lu ? 'font-semibold' : 'font-medium'" x-text="notif.titre"></p>
                                            <p class="text-xs text-gray-500 truncate mt-0.5" x-text="notif.contenu"></p>
                                            <p class="text-[10px] text-gray-400 mt-1" x-text="notif.date_envoi ? new Date(notif.date_envoi).toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}) : ''"></p>
                                        </div>
                                        <div x-show="!notif.lu" class="shrink-0 mt-2">
                                            <span class="h-2 w-2 rounded-full bg-hotel-500 block"></span>
                                        </div>
                                    </a>
                                </template>
                                <div x-show="notifications.length === 0" class="px-4 py-8 text-center">
                                    <p class="text-sm text-gray-400">Aucune notification</p>
                                </div>
                            </div>
                            <div class="border-t border-gray-100 px-4 py-2.5">
                                <a href="{{ route('hotel.notifications.index') }}" class="block text-center text-xs text-hotel-600 hover:text-hotel-700 font-medium">Voir toutes les notifications</a>
                            </div>
                        </div>
                    </div>

                    <!-- Profile Dropdown -->
                    <div class="relative" x-data="{ open: false }">
                        <button @click="open = !open"
                            class="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition-colors">
                            <div
                                class="h-8 w-8 rounded-full bg-gradient-to-br from-hotel-500 to-hotel-700 flex items-center justify-center text-white text-sm font-bold">
                                {{ substr(auth('hotel')->user()->prenom, 0, 1) }}{{ substr(auth('hotel')->user()->nom, 0, 1) }}
                            </div>
                            <span class="text-sm font-medium text-gray-700 hidden sm:block">{{ auth('hotel')->user()->prenom }}
                                {{ auth('hotel')->user()->nom }}</span>
                            <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>

                        <div x-show="open" @click.away="open = false" x-cloak
                            x-transition:enter="transition ease-out duration-100"
                            x-transition:enter-start="transform opacity-0 scale-95"
                            x-transition:enter-end="transform opacity-100 scale-100"
                            x-transition:leave="transition ease-in duration-75"
                            x-transition:leave-start="transform opacity-100 scale-100"
                            x-transition:leave-end="transform opacity-0 scale-95"
                            class="absolute right-0 mt-2 w-48 rounded-xl bg-white py-2 shadow-lg ring-1 ring-gray-200">
                            <a href="{{ route('hotel.profile.edit') }}"
                                class="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                                Mon profil
                            </a>
                            <form method="POST" action="{{ route('hotel.logout') }}">
                                @csrf
                                <button type="submit"
                                    class="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                    </svg>
                                    Déconnexion
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Toast Notifications -->
            @if(session('success'))
                <div x-data="{ show: true }" x-show="show" x-init="setTimeout(() => show = false, 5000)"
                    x-transition:leave="transition ease-in duration-300"
                    x-transition:leave-start="opacity-100 translate-y-0" x-transition:leave-end="opacity-0 -translate-y-2"
                    class="mx-6 mt-4">
                    <div
                        class="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 shadow-sm">
                        <svg class="h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ session('success') }}
                        <button @click="show = false" class="ml-auto text-emerald-400 hover:text-emerald-600">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            @endif

            @if(session('error'))
                <div x-data="{ show: true }" x-show="show" x-init="setTimeout(() => show = false, 5000)" class="mx-6 mt-4">
                    <div
                        class="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 shadow-sm">
                        <svg class="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        {{ session('error') }}
                        <button @click="show = false" class="ml-auto text-red-400 hover:text-red-600">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            @endif

            @if(session('warning'))
                <div x-data="{ show: true }" x-show="show" x-init="setTimeout(() => show = false, 6000)" class="mx-6 mt-4">
                    <div
                        class="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 shadow-sm">
                        <svg class="h-5 w-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        {{ session('warning') }}
                        <button @click="show = false" class="ml-auto text-amber-400 hover:text-amber-600">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            @endif

            <!-- Page Content -->
            <main class="flex-1 p-6">
                @yield('content')
            </main>
        </div>
    </div>

    @stack('scripts')
</body>

</html>