<!DOCTYPE html>
<html lang="fr" class="h-full">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'EVADIA - Connexion')</title>
    <link rel="icon" type="image/png" href="{{ asset('images/Evadia_Logo_BW_4.png') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: {
                        evadia: {
                            50: '#ecfdf8', 100: '#d1faf0', 200: '#a7f3e2', 300: '#6ee7cc',
                            400: '#34d4b3', 500: '#01BDA5', 600: '#019985', 700: '#017a6b',
                            800: '#016156', 900: '#015047', 950: '#002f2b',
                        }
                    }
                }
            }
        }
    </script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <style>
        [x-cloak] { display: none !important; }
        .auth-bg-pattern {
            background-image: radial-gradient(circle at 20% 50%, rgba(1,189,165,0.15) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(1,153,133,0.1) 0%, transparent 40%),
                              radial-gradient(circle at 60% 80%, rgba(1,189,165,0.08) 0%, transparent 35%);
        }
        .grid-pattern {
            background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 40px 40px;
        }
        .form-input {
            display: block; width: 100%;
            border-radius: 0.625rem;
            border: 1px solid #e5e7eb;
            background-color: #f9fafb;
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
            color: #111827;
            transition: all 0.15s ease;
            outline: none;
        }
        .form-input:focus {
            border-color: #01BDA5;
            background-color: #fff;
            box-shadow: 0 0 0 3px rgba(1,189,165,0.12);
        }
        .form-input::placeholder { color: #9ca3af; }
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear { display: none; }
        input::-webkit-credentials-auto-fill-button { visibility: hidden; }
    </style>
</head>

<body class="h-full font-sans antialiased bg-slate-950">
    <div class="min-h-screen flex">

        {{-- ═══════════════ LEFT PANEL — Branding ═══════════════ --}}
        <div class="hidden lg:flex lg:w-[56%] relative overflow-hidden flex-col bg-slate-900 auth-bg-pattern">
            <div class="absolute inset-0 grid-pattern"></div>

            {{-- Decorative blobs --}}
            <div class="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-evadia-500/10 blur-3xl pointer-events-none"></div>
            <div class="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-evadia-700/10 blur-3xl pointer-events-none"></div>
            <div class="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-evadia-400/5 blur-2xl pointer-events-none"></div>

            <div class="relative z-10 flex flex-col justify-between h-full p-12">
                {{-- Top: Logo + badge --}}
                <div class="flex items-center gap-3">
                    <img src="{{ asset('images/Evadia_Logo_BW_1.png') }}" alt="EVADIA" class="h-10">
                    <span class="rounded-full bg-evadia-500/15 border border-evadia-500/20 px-3 py-1 text-[11px] font-semibold text-evadia-400 tracking-wider uppercase">Administration</span>
                </div>

                {{-- Middle: Tagline + features --}}
                <div class="space-y-8">
                    <div>
                        <h2 class="text-4xl font-bold text-white leading-tight mb-3">
                            Pilotez la plateforme<br>
                            <span class="text-evadia-400">EVADIA</span> en toute<br>
                            simplicité.
                        </h2>
                        <p class="text-base text-white/45 max-w-sm leading-relaxed">
                            Interface d'administration centralisée pour gérer hôtels, utilisateurs, réservations et contenu éditorial.
                        </p>
                    </div>

                    <div class="space-y-4">
                        @foreach([
                            ['icon' => 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', 'label' => 'Gestion des utilisateurs & hôteliers'],
                            ['icon' => 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0-.75 3.75m0 0-.75 3.75M17.25 7.5l-.75 3.75', 'label' => 'Supervision du parc hôtelier'],
                            ['icon' => 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6', 'label' => 'Tableaux de bord & analytiques'],
                        ] as $feat)
                            <div class="flex items-center gap-3">
                                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-evadia-500/10 border border-evadia-500/15">
                                    <svg class="h-4 w-4 text-evadia-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="{{ $feat['icon'] }}"/>
                                    </svg>
                                </div>
                                <span class="text-sm text-white/60">{{ $feat['label'] }}</span>
                            </div>
                        @endforeach
                    </div>
                </div>

                {{-- Bottom: Footer note --}}
                <p class="text-xs text-white/20">© {{ date('Y') }} EVADIA · Accès restreint aux administrateurs</p>
            </div>
        </div>

        {{-- ═══════════════ RIGHT PANEL — Form ═══════════════ --}}
        <div class="flex flex-1 flex-col justify-center bg-gray-50 px-6 py-12 sm:px-10 lg:px-16">
            <div class="w-full max-w-sm mx-auto">

                {{-- Mobile logo --}}
                <div class="lg:hidden flex items-center justify-center gap-3 mb-8">
                    <img src="{{ asset('images/Evadia_Logo_BW_4.png') }}" alt="EVADIA" class="h-10">
                </div>

                @if(session('success'))
                    <div class="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                        {{ session('success') }}
                    </div>
                @endif

                {{-- Card --}}
                <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    @yield('content')
                </div>

                <p class="mt-5 text-center text-xs text-gray-400">
                    EVADIA &mdash; Plateforme de réservation hôtelière
                </p>
            </div>
        </div>

    </div>
</body>
</html>
