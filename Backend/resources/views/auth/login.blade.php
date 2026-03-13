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
            <input type="password" name="password" id="password" required
                class="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-sm shadow-sm transition-all focus:border-evadia-500 focus:bg-white focus:ring-2 focus:ring-evadia-500/20"
                placeholder="••••••••">
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