@extends('layouts.auth')

@section('title', 'Mot de passe oublié - EVADIA')

@section('content')
    <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-1">Mot de passe oublié</h2>
        <p class="text-sm text-gray-500 mb-6">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>

        @if(session('success'))
            <div class="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                {{ session('success') }}
            </div>
        @endif

        @if($errors->any())
            <div class="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                @foreach($errors->all() as $error)
                    <p>{{ $error }}</p>
                @endforeach
            </div>
        @endif

        <form method="POST" action="{{ route('hotel.password.email') }}" class="space-y-5">
            @csrf

            <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                <input type="email" name="email" id="email" required autofocus value="{{ old('email') }}"
                    class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-evadia-500 transition-colors"
                    placeholder="votre@email.com">
            </div>

            <button type="submit"
                class="w-full rounded-lg bg-gradient-to-r from-evadia-600 to-evadia-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-evadia-700 hover:to-evadia-800 focus:outline-none focus:ring-2 focus:ring-evadia-500 focus:ring-offset-2 transition-all duration-200">
                Envoyer le lien de réinitialisation
            </button>
        </form>

        <p class="mt-6 text-center">
            <a href="{{ route('hotel.login') }}" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">
                Retour à la connexion
            </a>
        </p>
    </div>
@endsection
