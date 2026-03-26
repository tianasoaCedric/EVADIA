@extends('layouts.auth')

@section('title', 'Connexion Hôtelier - EVADIA')

@section('content')
    <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-1">Espace Hôtelier</h2>
        <p class="text-sm text-gray-500 mb-6">Connectez-vous à votre back-office hôtel</p>

        @if($errors->any())
            <div class="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                @foreach($errors->all() as $error)
                    <p>{{ $error }}</p>
                @endforeach
            </div>
        @endif

        <form method="POST" action="{{ route('hotel.login') }}" class="space-y-5" id="hotel-login-form">
            @csrf

            <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                <input type="email" name="email" id="email" required autofocus value="{{ old('email') }}"
                    class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-evadia-500 transition-colors"
                    placeholder="votre@email.com">
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <div class="relative" x-data="{ show: false }">
                    <input :type="show ? 'text' : 'password'" name="password" id="password" required
                        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm focus:border-evadia-500 focus:ring-evadia-500 transition-colors"
                        placeholder="Votre mot de passe">
                    <button type="button" @click="show = !show"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <svg x-show="!show" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <svg x-show="show" x-cloak class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="flex items-center justify-between">
                <label class="flex items-center gap-2">
                    <input type="checkbox" name="remember"
                        class="rounded border-gray-300 text-evadia-600 focus:ring-evadia-500">
                    <span class="text-sm text-gray-600">Se souvenir de moi</span>
                </label>
                <a href="{{ route('hotel.password.request') }}"
                    class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">
                    Mot de passe oublié ?
                </a>
            </div>

            <button type="submit" id="hotel-login-submit"
                class="w-full rounded-lg bg-gradient-to-r from-evadia-600 to-evadia-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-evadia-700 hover:to-evadia-800 focus:outline-none focus:ring-2 focus:ring-evadia-500 focus:ring-offset-2 transition-all duration-200">
                Se connecter
            </button>
        </form>

        <p class="mt-6 text-center text-xs text-gray-400">
            Les comptes hôteliers sont créés par EVADIA.<br>
            Contactez le support si vous n'avez pas reçu vos identifiants.
        </p>
    </div>
@endsection