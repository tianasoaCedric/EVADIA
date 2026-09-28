<!DOCTYPE html>
<html lang="fr" class="h-full">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'EVADIA - Espace Hôtelier')</title>
    <link rel="icon" type="image/png" href="{{ asset('images/Evadia_Logo_BW_4.png') }}">
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

    <!-- Notifications hôtel : store Alpine partagé (cloche, badge Réservations, alerte) -->
    <script>
        document.addEventListener('alpine:init', () => {
            const ROUTES = {
                recent: @js(route('hotel.notifications.recent')),
                markRead: @js(route('hotel.notifications.mark-read', ['notification' => '__ID__'])),
                markAll: @js(route('hotel.notifications.mark-all-read')),
            };
            const CSRF = @js(csrf_token());
            const POLL_MS = 20000;
            const SEEN_KEY = 'evadia:hotel:alertes-vues';
            const TYPE_RESERVATION = 'nouvelle_reservation';

            const readSeen = () => { try { return JSON.parse(sessionStorage.getItem(SEEN_KEY) || '[]'); } catch { return []; } };
            const writeSeen = (ids) => { try { sessionStorage.setItem(SEEN_KEY, JSON.stringify(ids.slice(-200))); } catch {} };

            Alpine.store('notifs', {
                items: [],
                unread: 0,
                enAttente: 0,
                alertes: [],
                permission: ('Notification' in window) ? Notification.permission : 'unsupported',
                _titre: document.title,
                _blink: null,

                init() {
                    this.refresh();
                    setInterval(() => this.refresh(), POLL_MS);
                    document.addEventListener('visibilitychange', () => {
                        if (!document.hidden) { this.refresh(); this.stopBlink(); }
                    });
                },

                async refresh() {
                    try {
                        const res = await fetch(ROUTES.recent, { headers: { 'Accept': 'application/json' } });
                        if (!res.ok) return;
                        const d = await res.json();
                        this.items = d.notifications || [];
                        this.unread = d.unread_count || 0;
                        this.enAttente = d.reservations_en_attente || 0;
                        this.detecterNouvellesReservations();
                    } catch (e) { /* réseau indisponible : on réessaie au prochain tour */ }
                },

                detecterNouvellesReservations() {
                    const seen = readSeen();
                    const nouvelles = this.items.filter(n =>
                        n.type_notification === TYPE_RESERVATION && !n.lu
                        && !seen.includes(n.id) && !this.alertes.some(a => a.id === n.id));
                    if (!nouvelles.length) return;

                    this.alertes = [...nouvelles, ...this.alertes].slice(0, 3);
                    writeSeen([...seen, ...nouvelles.map(n => n.id)]);
                    this.sonner();
                    this.startBlink(nouvelles.length);
                    if (document.hidden && this.permission === 'granted') {
                        nouvelles.forEach(n => {
                            const sys = new Notification(n.titre, { body: n.contenu, tag: 'reservation-' + n.id });
                            sys.onclick = () => { window.focus(); this.ouvrir(n); };
                        });
                    }
                },

                fermerAlerte(n) {
                    this.alertes = this.alertes.filter(a => a.id !== n.id);
                    if (!this.alertes.length) this.stopBlink();
                },

                async ouvrir(n) {
                    await this.marquerLu(n);
                    window.location.href = n.lien || '#';
                },

                async marquerLu(n) {
                    if (n.lu) return;
                    n.lu = true;
                    this.unread = Math.max(0, this.unread - 1);
                    this.fermerAlerte(n);
                    try {
                        await fetch(ROUTES.markRead.replace('__ID__', n.id), {
                            method: 'PATCH', headers: { 'X-CSRF-TOKEN': CSRF, 'Accept': 'application/json' },
                        });
                    } catch (e) {}
                },

                async toutMarquerLu() {
                    await fetch(ROUTES.markAll, { method: 'POST', headers: { 'X-CSRF-TOKEN': CSRF, 'Accept': 'application/json' } });
                    this.unread = 0;
                    this.items = this.items.map(n => ({ ...n, lu: true }));
                    this.alertes = [];
                    this.stopBlink();
                },

                async activerNavigateur() {
                    if (!('Notification' in window)) return;
                    this.permission = await Notification.requestPermission();
                },

                // Petit carillon (deux notes). Peut être bloqué par le navigateur
                // tant que l'utilisateur n'a pas interagi avec la page.
                sonner() {
                    try {
                        const ctx = new (window.AudioContext || window.webkitAudioContext)();
                        [[880, 0], [1320, 0.18]].forEach(([freq, t]) => {
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            osc.frequency.value = freq;
                            osc.type = 'sine';
                            gain.gain.setValueAtTime(0.0001, ctx.currentTime + t);
                            gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t + 0.02);
                            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.45);
                            osc.connect(gain).connect(ctx.destination);
                            osc.start(ctx.currentTime + t);
                            osc.stop(ctx.currentTime + t + 0.5);
                        });
                    } catch (e) {}
                },

                startBlink(count) {
                    this.stopBlink();
                    const alerte = '🔔 (' + count + ') Nouvelle réservation';
                    let on = false;
                    this._blink = setInterval(() => {
                        on = !on;
                        document.title = on ? alerte : this._titre;
                    }, 1000);
                },

                stopBlink() {
                    if (this._blink) clearInterval(this._blink);
                    this._blink = null;
                    document.title = this._titre;
                },
            });
        });
    </script>

    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

    <style>
        [x-cloak] { display: none !important; }
        @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            15% { transform: rotate(-14deg); }
            30% { transform: rotate(12deg); }
            45% { transform: rotate(-8deg); }
            60% { transform: rotate(4deg); }
            75% { transform: rotate(0deg); }
        }

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
            padding: 0.5rem 0.625rem;
            border-radius: 0.625rem;
            font-size: 0.8125rem;
            font-weight: 500;
            color: rgba(255,255,255,0.5);
            transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
            letter-spacing: 0.01em;
        }
        .sidebar-link:hover {
            color: rgba(255,255,255,0.9);
            background: rgba(255,255,255,0.06);
        }
        .sidebar-link.active {
            color: #fff;
            background: rgba(1,153,133,0.12);
        }
        .sidebar-link.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 55%;
            background: #01BDA5;
            border-radius: 0 2px 2px 0;
            box-shadow: 0 0 8px rgba(1,189,165,0.55);
        }

        /* Section separator */
        .sidebar-section-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0 0.5rem;
            margin-bottom: 0.375rem;
        }
        .sidebar-section-label span {
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.22);
            white-space: nowrap;
        }
        .sidebar-section-label::after {
            content: '';
            flex: 1;
            height: 1px;
            background: rgba(255,255,255,0.06);
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
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
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

        /* Collapsed sidebar: center icons */
        .sidebar-collapsed .sidebar-link {
            justify-content: center;
            padding-left: 0;
            padding-right: 0;
        }
        .sidebar-collapsed .sidebar-link::before { display: none; }
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
            :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-[4.5rem] sidebar-collapsed'">

            <!-- Logo -->
            <div class="flex h-20 shrink-0 items-center gap-3 px-4 border-b border-white/[0.06]">
                <a href="{{ route('hotel.dashboard') }}" class="flex items-center gap-3 min-w-0">
                    <img x-show="sidebarOpen" src="{{ asset('images/Evadia_Logo_BW_1.png') }}" alt="EVADIA" class="h-8 shrink-0">
                    <img x-show="!sidebarOpen" src="{{ asset('images/Evadia_Logo_BW_4.png') }}" alt="EVADIA" class="h-8 mx-auto shrink-0">
                    <span x-show="sidebarOpen" class="text-[10px] font-bold uppercase tracking-widest text-hotel-400/70 shrink-0">Hôtel</span>
                </a>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 overflow-y-auto sidebar-scroll py-5 px-3 space-y-6">
                <!-- Section: Principal -->
                <div>
                    <div x-show="sidebarOpen" class="sidebar-section-label"><span>Principal</span></div>
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
                            class="sidebar-link group {{ request()->routeIs('hotel.content.*') && !request()->routeIs('hotel.services.*') ? 'active' : '' }}">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {{ request()->routeIs('hotel.content.*') ? 'bg-amber-500/20 text-amber-400' : 'text-white/50 group-hover:text-white/80' }} transition-colors">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0-.75 3.75m0 0-.75 3.75M17.25 7.5l-.75 3.75" />
                                </svg>
                            </div>
                            <span x-show="sidebarOpen">Mon Hôtel</span>
                            <span x-show="!sidebarOpen" class="sidebar-tooltip">Mon Hôtel</span>
                        </a>

                        <a href="{{ route('hotel.services.index') }}"
                            class="sidebar-link group {{ request()->routeIs('hotel.services.*') ? 'active' : '' }}">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {{ request()->routeIs('hotel.services.*') ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/50 group-hover:text-white/80' }} transition-colors">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/>
                                </svg>
                            </div>
                            <span x-show="sidebarOpen">Équipements & Services</span>
                            <span x-show="!sidebarOpen" class="sidebar-tooltip">Équipements</span>
                        </a>
                    </div>
                </div>

                <!-- Section: Hébergement -->
                <div>
                    <div x-show="sidebarOpen" class="sidebar-section-label"><span>Hébergement</span></div>
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
                            <span x-show="sidebarOpen" class="flex-1">Réservations</span>
                            <span x-show="!sidebarOpen" class="sidebar-tooltip">Réservations</span>
                            <span x-show="$store.notifs.enAttente > 0" x-cloak
                                :class="sidebarOpen ? 'ml-auto' : 'absolute top-1 right-1'"
                                class="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white"
                                :title="$store.notifs.enAttente + ' réservation(s) en attente de réponse'"
                                x-text="$store.notifs.enAttente"></span>
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
                    <div x-show="sidebarOpen" class="sidebar-section-label"><span>Commercial</span></div>
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
                    <div x-show="sidebarOpen" class="sidebar-section-label"><span>Communication</span></div>
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

            <!-- Sidebar Footer - User info + logout -->
            <div class="border-t border-white/[0.06] p-3 space-y-1">
                <a href="{{ route('hotel.profile.edit') }}"
                    class="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.05] transition-colors">
                    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-hotel-400 to-hotel-600 text-white text-xs font-bold shadow-lg shadow-hotel-500/20">
                        {{ substr(auth('hotel')->user()->prenom, 0, 1) }}{{ substr(auth('hotel')->user()->nom, 0, 1) }}
                    </div>
                    <div x-show="sidebarOpen" class="min-w-0 flex-1">
                        <p class="text-xs font-semibold text-white/85 truncate">{{ auth('hotel')->user()->prenom }} {{ auth('hotel')->user()->nom }}</p>
                        <p class="text-[10px] text-white/35 truncate flex items-center gap-1">
                            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block"></span>
                            Mon profil
                        </p>
                    </div>
                </a>
                <form method="POST" action="{{ route('hotel.logout') }}">
                    @csrf
                    <button type="submit" class="sidebar-link w-full group">
                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 group-hover:text-red-400 transition-colors">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/>
                            </svg>
                        </div>
                        <span x-show="sidebarOpen" class="group-hover:text-red-400 transition-colors">Déconnexion</span>
                        <span x-show="!sidebarOpen" class="sidebar-tooltip">Déconnexion</span>
                    </button>
                </form>
            </div>
        </aside>

        <!-- ═══════════════ MAIN CONTENT ═══════════════ -->
        <div class="flex-1 flex flex-col" :class="sidebarOpen ? 'ml-64' : 'ml-0 lg:ml-20'">

            <!-- Header -->
            <header
                class="sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-xl px-8 shadow-sm">
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
                    <h1 class="text-xl font-semibold text-gray-900">@yield('page_title', 'Dashboard')</h1>
                </div>

                <!-- Right: Notifications (profil & déconnexion : pied de la sidebar) -->
                <div class="flex items-center gap-3">
                    <div class="relative" x-data="{ open: false }">
                        <button @click="open = !open; if (open) $store.notifs.refresh()"
                            class="relative rounded-lg p-2 hover:bg-gray-100 transition-colors" aria-label="Notifications">
                            <svg class="h-5 w-5" :class="$store.notifs.alertes.length ? 'text-hotel-600 animate-[wiggle_1s_ease-in-out_infinite]' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                            <span x-show="$store.notifs.unread > 0" x-cloak x-text="$store.notifs.unread > 99 ? '99+' : $store.notifs.unread"
                                class="absolute -top-0.5 -right-0.5 flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white"></span>
                        </button>

                        <!-- Dropdown -->
                        <div x-show="open" x-cloak @click.away="open = false"
                            x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 scale-95" x-transition:enter-end="opacity-100 scale-100"
                            x-transition:leave="transition ease-in duration-150" x-transition:leave-start="opacity-100 scale-100" x-transition:leave-end="opacity-0 scale-95"
                            class="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-xl bg-white shadow-xl ring-1 ring-gray-200 z-50">
                            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <h3 class="text-sm font-semibold text-gray-900">Notifications</h3>
                                <button x-show="$store.notifs.unread > 0" @click.prevent="$store.notifs.toutMarquerLu()"
                                    class="text-xs text-hotel-600 hover:text-hotel-700 font-medium">Tout marquer lu</button>
                            </div>
                            <div x-show="$store.notifs.permission === 'default'" class="flex items-center justify-between gap-3 bg-amber-50 px-4 py-2.5 border-b border-amber-100">
                                <p class="text-xs text-amber-800">Être alerté même quand l'onglet est en arrière-plan</p>
                                <button @click="$store.notifs.activerNavigateur()" class="shrink-0 rounded-md bg-amber-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-700">Activer</button>
                            </div>
                            <div class="max-h-80 overflow-y-auto divide-y divide-gray-50">
                                <template x-for="notif in $store.notifs.items" :key="notif.id">
                                    <a :href="notif.lien || '#'" @click="$store.notifs.marquerLu(notif)"
                                        class="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors" :class="!notif.lu ? 'bg-hotel-50/40' : ''">
                                        <div class="shrink-0 mt-0.5">
                                            <div class="h-8 w-8 rounded-full flex items-center justify-center"
                                                :class="notif.type_notification === 'nouvelle_reservation'
                                                    ? (!notif.lu ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400')
                                                    : (!notif.lu ? 'bg-hotel-100 text-hotel-600' : 'bg-gray-100 text-gray-400')">
                                                <svg x-show="notif.type_notification === 'nouvelle_reservation'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                </svg>
                                                <svg x-show="notif.type_notification !== 'nouvelle_reservation'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="min-w-0 flex-1">
                                            <p class="text-sm text-gray-900 truncate" :class="!notif.lu ? 'font-semibold' : 'font-medium'" x-text="notif.titre"></p>
                                            <p class="text-xs text-gray-500 line-clamp-2 mt-0.5" x-text="notif.contenu"></p>
                                            <p class="text-[10px] text-gray-400 mt-1" x-text="notif.date_envoi ? new Date(notif.date_envoi).toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}) : ''"></p>
                                        </div>
                                        <div x-show="!notif.lu" class="shrink-0 mt-2">
                                            <span class="h-2 w-2 rounded-full bg-hotel-500 block"></span>
                                        </div>
                                    </a>
                                </template>
                                <div x-show="$store.notifs.items.length === 0" class="px-4 py-8 text-center">
                                    <p class="text-sm text-gray-400">Aucune notification</p>
                                </div>
                            </div>
                            <div class="border-t border-gray-100 px-4 py-2.5">
                                <a href="{{ route('hotel.notifications.index') }}" class="block text-center text-xs text-hotel-600 hover:text-hotel-700 font-medium">Voir toutes les notifications</a>
                            </div>
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

    <!-- ═══════════════ ALERTE NOUVELLE RÉSERVATION ═══════════════ -->
    <div class="fixed top-24 right-4 z-[70] flex w-[26rem] max-w-[calc(100vw-2rem)] flex-col gap-3" aria-live="assertive">
        <template x-for="n in $store.notifs.alertes" :key="n.id">
            <div x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 translate-x-8" x-transition:enter-end="opacity-100 translate-x-0"
                class="overflow-hidden rounded-2xl bg-white shadow-2xl ring-2 ring-emerald-400">
                <div class="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-hotel-600 px-4 py-3 text-white">
                    <span class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/30"></span>
                        <svg class="relative h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                    </span>
                    <div class="min-w-0 flex-1">
                        <p class="text-base font-bold leading-tight">Nouvelle réservation !</p>
                        <p class="text-xs text-white/85 truncate" x-text="n.titre"></p>
                    </div>
                    <button type="button" @click="$store.notifs.fermerAlerte(n)" class="rounded-lg p-1 text-white/80 hover:bg-white/15 hover:text-white" aria-label="Fermer">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div class="px-4 py-3">
                    <p class="text-sm text-gray-700" x-text="n.contenu"></p>
                    <p class="mt-1 text-xs text-amber-600 font-medium">En attente de votre réponse</p>
                    <div class="mt-3 flex justify-end gap-2">
                        <button type="button" @click="$store.notifs.fermerAlerte(n)"
                            class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Plus tard</button>
                        <button type="button" @click="$store.notifs.ouvrir(n)"
                            class="rounded-lg bg-hotel-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-hotel-700">Voir la réservation</button>
                    </div>
                </div>
            </div>
        </template>
    </div>

    @stack('scripts')
</body>

</html>
