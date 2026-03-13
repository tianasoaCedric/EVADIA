@extends('layouts.auth')
@section('title', 'EVADIA - Réinitialiser le mot de passe')
@section('content')
    <h2 class="text-2xl font-bold text-gray-900 mb-1">Nouveau mot de passe</h2>
    <p class="text-sm text-gray-500 mb-8">Choisissez un nouveau mot de passe sécurisé.</p>

    <form method="POST" action="{{ route('password.update') }}" class="space-y-5">
        @csrf
        <input type="hidden" name="token" value="{{ $token }}">
        <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" name="email" id="email" value="{{ old('email', request('email')) }}" required
                class="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-evadia-500 focus:bg-white focus:ring-2 focus:ring-evadia-500/20 @error('email') border-red-500 @enderror">
            @error('email') <p class="mt-1.5 text-xs text-red-600">{{ $message }}</p> @enderror
        </div>
        <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
            <input type="password" name="password" id="password" required
                class="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-evadia-500 focus:bg-white focus:ring-2 focus:ring-evadia-500/20 @error('password') border-red-500 @enderror">
            @error('password') <p class="mt-1.5 text-xs text-red-600">{{ $message }}</p> @enderror
        </div>
        <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1.5">Confirmer</label>
            <input type="password" name="password_confirmation" id="password_confirmation" required
                class="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-evadia-500 focus:bg-white focus:ring-2 focus:ring-evadia-500/20">
        </div>
        <button type="submit"
            class="w-full rounded-xl bg-gradient-to-r from-evadia-600 to-evadia-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-evadia-500/25 transition-all hover:from-evadia-700 hover:to-evadia-800 active:scale-[0.98]">
            Réinitialiser le mot de passe
        </button>
    </form>
@endsection