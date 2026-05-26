<!DOCTYPE html>
<html lang="fr" class="h-full">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'EVADIA - Espace Hôtelier')</title>
    <link rel="icon" type="image/png" href="{{ asset('images/Evadia_Logo BW 4.png') }}">
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
                        hotel: {
                            50: '#e6f7f4', 100: '#ccefea', 200: '#99dfd5', 300: '#66cfbf',
                            400: '#33bfaa', 500: '#019985', 600: '#017a6b', 700: '#016156',
                            800: '#014940', 900: '#01382f', 950: '#00241f',
                        },
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
        .hotel-bg-pattern {
            background-image: radial-gradient(circle at 25% 40%, rgba(1,153,133,0.18) 0%, transparent 55%),
                              radial-gradient(circle at 75% 70%, rgba(1,97,86,0.12) 0%, transparent 45%),
                              radial-gradient(circle at 50% 10%, rgba(1,189,165,0.08) 0%, transparent 35%);
        }
        .dots-pattern {
            background-image: radial-gradient(rgba(255,255,255,0.06) 1.5px, transparent 1.5px);
            background-size: 28px 28px;
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
            border-color: #019985;
            background-color: #fff;
            box-shadow: 0 0 0 3px rgba(1,153,133,0.12);
        }
        .form-input::placeholder { color: #9ca3af; }
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear { display: none; }
        input::-webkit-credentials-auto-fill-button { visibility: hidden; }
    </style>
</head>

<body class="h-full font-sans antialiased" style="background-color:#0a1f1c;">
    <div class="min-h-screen flex">

        {{-- ═══════════════ LEFT PANEL — Branding ═══════════════ --}}
        <div class="hidden lg:flex lg:w-[56%] relative overflow-hidden flex-col hotel-bg-pattern" style="background-color:#0d2420;">
            <div class="absolute inset-0 dots-pattern"></div>

            {{-- Decorative elements --}}
            <div class="absolute -top-32 -right-32 h-80 w-80 rounded-full border border-hotel-500/10 pointer-events-none"></div>
            <div class="absolute -top-16 -right-16 h-48 w-48 rounded-full border border-hotel-500/8 pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-hotel-900/40 blur-3xl pointer-events-none"></div>
            <div class="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-hotel-500/5 blur-2xl pointer-events-none"></div>

            <div class="relative z-10 flex flex-col justify-between h-full p-12">
                {{-- Top: Logo + badge --}}
                <div class="flex items-center gap-3">
                    <img src="{{ asset('images/Evadia_Logo BW 1.png') }}" alt="EVADIA" class="h-10">
                    <span class="rounded-full bg-hotel-500/15 border border-hotel-500/20 px-3 py-1 text-[11px] font-semibold text-hotel-400 tracking-wider uppercase">Hôtelier</span>
                </div>

                {{-- Middle --}}
                <div class="space-y-8">
                    <div>
                        <p class="text-hotel-400 text-sm font-medium tracking-wide uppercase mb-3">Espace partenaire</p>
                        <h2 class="text-4xl font-bold text-white leading-tight mb-4">
                            Gérez votre hôtel,<br>
                            développez votre<br>
                            <span class="text-hotel-400">activité.</span>
                        </h2>
                        <p class="text-base text-white/40 max-w-sm leading-relaxed">
                            Votre tableau de bord pour piloter chambres, réservations, tarifs et présence sur EVADIA depuis un seul endroit.
                        </p>
                    </div>

                    {{-- Feature cards --}}
                    <div class="grid grid-cols-2 gap-3">
                        @foreach([
                            ['icon' => 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5', 'label' => 'Réservations'],
                            ['icon' => 'M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819', 'label' => 'Chambres'],
                            ['icon' => 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z', 'label' => 'Tarifs & Offres'],
                            ['icon' => 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3', 'label' => 'Analytiques'],
                        ] as $feat)
                            <div class="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-3">
                                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-hotel-500/15">
                                    <svg class="h-4 w-4 text-hotel-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="{{ $feat['icon'] }}"/>
                                    </svg>
                                </div>
                                <span class="text-sm text-white/60">{{ $feat['label'] }}</span>
                            </div>
                        @endforeach
                    </div>
                </div>

                {{-- Bottom --}}
                <p class="text-xs text-white/20">© {{ date('Y') }} EVADIA · Espace réservé aux hôteliers partenaires</p>
            </div>
        </div>

        {{-- ═══════════════ RIGHT PANEL — Form ═══════════════ --}}
        <div class="flex flex-1 flex-col justify-center bg-gray-50 px-6 py-12 sm:px-10 lg:px-16">
            <div class="w-full max-w-sm mx-auto">

                {{-- Mobile logo --}}
                <div class="lg:hidden flex items-center justify-center gap-3 mb-8">
                    <img src="{{ asset('images/Evadia_Logo BW 4.png') }}" alt="EVADIA" class="h-10">
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
