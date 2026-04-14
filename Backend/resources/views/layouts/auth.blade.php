<!DOCTYPE html>
<html lang="fr" class="h-full">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'EVADIA - Connexion')</title>
    <link rel="icon" type="image/png" href="{{ asset('images/Evadia_Logo BW 4.png') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet">
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
</head>

<body class="h-full font-sans antialiased">
    <div class="flex min-h-full">
        <!-- Left Panel - Branding -->
        <div
            class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-evadia-500 via-evadia-600 to-evadia-700 relative overflow-hidden">
            <div
                class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M0%200h20v20H0V0zm20%2020h20v20H20V20z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]">
            </div>
            <div class="relative z-10 flex flex-col justify-center px-16">
                <div class="mb-8">
                    <img src="{{ asset('images/Evadia_Logo BW 1.png') }}" alt="EVADIA" class="h-12">
                </div>
                <h2 class="text-4xl font-bold text-white leading-tight mb-4">
                    Plateforme de<br>réservation d'hôtels
                </h2>
                <p class="text-lg text-white/60 max-w-md">
                    Gérez vos hôtels, réservations et clients depuis une interface unique et intuitive.
                </p>

                <!-- Decorative circles -->
                <div class="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-evadia-600/20 blur-3xl"></div>
                <div class="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-evadia-400/10 blur-2xl"></div>
            </div>
        </div>

        <!-- Right Panel - Form -->
        <div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-white">
            <div class="mx-auto w-full max-w-sm">
                <!-- Mobile logo -->
                <div class="lg:hidden mb-8">
                    <img src="{{ asset('images/Evadia_Logo BW 2.png') }}" alt="EVADIA" class="h-10" style="filter: brightness(0) saturate(100%) invert(18%) sepia(80%) saturate(2000%) hue-rotate(215deg) brightness(95%) contrast(95%);">
                </div>

                @if(session('success'))
                    <div class="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                        {{ session('success') }}
                    </div>
                @endif

                @yield('content')
            </div>
        </div>
    </div>
</body>

</html>