@extends('layouts.auth')
@section('title', 'EVADIA - Mot de passe oublié')
@section('content')
    <h2 class="text-2xl font-bold text-gray-900 mb-1">Mot de passe oublié ?</h2>
    <p class="text-sm text-gray-500 mb-8">Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>

    <form method="POST" action="{{ route('password.email') }}" class="space-y-5">
        @csrf
        <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
            <input type="email" name="email" id="email" value="{{ old('email') }}" required autofocus
                class="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-evadia-500 focus:bg-white focus:ring-2 focus:ring-evadia-500/20 @error('email') border-red-500 @enderror"
                placeholder="votre@email.com">
            @error('email') <p class="mt-1.5 text-xs text-red-600">{{ $message }}</p> @enderror
        </div>
        <button type="submit"
            class="w-full rounded-xl bg-gradient-to-r from-evadia-600 to-evadia-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-evadia-500/25 transition-all hover:from-evadia-700 hover:to-evadia-800 active:scale-[0.98]">
            Envoyer le lien
        </button>
    </form>
    <p class="mt-6 text-center text-sm text-gray-500">
        <a href="{{ route('login') }}" class="font-semibold text-evadia-600 hover:text-evadia-700">← Retour à la
            connexion</a>
    </p>
@endsection