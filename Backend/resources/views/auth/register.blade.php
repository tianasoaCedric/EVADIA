@extends('layouts.auth')

@section('title', 'EVADIA - Inscription')

@section('content')
    <h2 class="text-2xl font-bold text-gray-900 mb-1">Créer un compte</h2>
    <p class="text-sm text-gray-500 mb-8">Rejoignez EVADIA en quelques secondes</p>

    <form method="POST" action="{{ route('register') }}" class="space-y-4">
        @csrf

        <div class="grid grid-cols-2 gap-3">
            <div>
                <label for="prenom" class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input type="text" name="prenom" id="prenom" value="{{ old('prenom') }}" required
                    class="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:bg-white focus:ring-2 focus:ring-evadia-500/20 @error('prenom') border-red-500 @enderror">
                @error('prenom') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
            </div>
            <div>
                <label for="nom" class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input type="text" name="nom" id="nom" value="{{ old('nom') }}" required
                    class="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:bg-white focus:ring-2 focus:ring-evadia-500/20 @error('nom') border-red-500 @enderror">
                @error('nom') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
            </div>
        </div>

        <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" id="email" value="{{ old('email') }}" required
                class="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:bg-white focus:ring-2 focus:ring-evadia-500/20 @error('email') border-red-500 @enderror"
                placeholder="votre@email.com">
            @error('email') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
        </div>

        <div>
            <label for="telephone" class="block text-sm font-medium text-gray-700 mb-1">Téléphone <span
                    class="text-gray-400">(optionnel)</span></label>
            <input type="tel" name="telephone" id="telephone" value="{{ old('telephone') }}"
                class="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:bg-white focus:ring-2 focus:ring-evadia-500/20">
        </div>

        <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input type="password" name="password" id="password" required
                class="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:bg-white focus:ring-2 focus:ring-evadia-500/20 @error('password') border-red-500 @enderror"
                placeholder="Min. 8 caractères">
            @error('password') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
        </div>

        <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
            <input type="password" name="password_confirmation" id="password_confirmation" required
                class="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:bg-white focus:ring-2 focus:ring-evadia-500/20"
                placeholder="Confirmez le mot de passe">
        </div>

        <button type="submit"
            class="w-full rounded-xl bg-gradient-to-r from-evadia-600 to-evadia-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-evadia-500/25 transition-all hover:from-evadia-700 hover:to-evadia-800 active:scale-[0.98]">
            Créer mon compte
        </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500">
        Déjà un compte ?
        <a href="{{ route('login') }}" class="font-semibold text-evadia-600 hover:text-evadia-700">Se connecter</a>
    </p>
@endsection