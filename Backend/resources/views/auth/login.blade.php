@extends('layouts.auth')

@section('title', 'EVADIA - Connexion')

@section('content')
    <h2 class="text-2xl font-bold text-gray-900 mb-1">Bon retour !</h2>
    <p class="text-sm text-gray-500 mb-8">Connectez-vous à votre compte EVADIA</p>

    <form method="POST" action="{{ route('login') }}" class="space-y-5">
        @csrf

        <!-- Email -->
        <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
            <input type="email" name="email" id="email" value="{{ old('email') }}" required autofocus
                class="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-sm shadow-sm transition-all focus:border-evadia-500 focus:bg-white focus:ring-2 focus:ring-evadia-500/20 @error('email') border-red-500 @enderror"
                placeholder="votre@email.com">
            @error('email')
                <p class="mt-1.5 text-xs text-red-600">{{ $message }}</p>
            @enderror
        </div>

        <!-- Password -->
        <div>
            <div class="flex items-center justify-between mb-1.5">
                <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
                <a href="{{ route('password.request') }}"
                    class="text-xs text-evadia-600 hover:text-evadia-700 font-medium">Mot de passe oublié ?</a>
            </div>
            <div class="relative" x-data="{ show: false }">
                <input :type="show ? 'text' : 'password'" name="password" id="password" required
                    class="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 pr-10 text-sm shadow-sm transition-all focus:border-evadia-500 focus:bg-white focus:ring-2 focus:ring-evadia-500/20"
                    placeholder="••••••••">
                <button type="button" @click="show = !show"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg x-show="!show" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <svg x-show="show" x-cloak class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                </button>
            </div>
        </div>

        <!-- Remember Me -->
        <div class="flex items-center">
            <input type="checkbox" name="remember" id="remember"
                class="h-4 w-4 rounded border-gray-300 text-evadia-600 focus:ring-evadia-500">
            <label for="remember" class="ml-2 text-sm text-gray-600">Se souvenir de moi</label>
        </div>

        <!-- Submit -->
        <button type="submit"
            class="w-full rounded-xl bg-gradient-to-r from-evadia-600 to-evadia-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-evadia-500/25 transition-all hover:from-evadia-700 hover:to-evadia-800 hover:shadow-evadia-500/40 focus:outline-none focus:ring-2 focus:ring-evadia-500/50 active:scale-[0.98]">
            Se connecter
        </button>
    </form>

    <!-- Register link -->
    <p class="mt-8 text-center text-sm text-gray-500">
        Pas encore de compte ?
        <a href="{{ route('register') }}" class="font-semibold text-evadia-600 hover:text-evadia-700">Créer un compte</a>
    </p>
@endsection