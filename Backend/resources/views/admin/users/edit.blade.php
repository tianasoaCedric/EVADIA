@extends('layouts.admin')
@section('title', 'Modifier ' . $user->prenom . ' - EVADIA Admin')
@section('page_title', 'Modifier utilisateur')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.users.show', $user) }}" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">←
            Retour au profil</a>
    </div>

    <div class="max-w-2xl mx-auto">
        <form method="POST" action="{{ route('admin.users.update', $user) }}" class="space-y-6">
            @csrf @method('PUT')

            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h3 class="text-sm font-semibold text-gray-900 mb-4">Informations personnelles</h3>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="prenom" class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                        <input type="text" name="prenom" id="prenom" value="{{ old('prenom', $user->prenom) }}" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 @error('prenom') border-red-500 @enderror">
                        @error('prenom') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label for="nom" class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input type="text" name="nom" id="nom" value="{{ old('nom', $user->nom) }}" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 @error('nom') border-red-500 @enderror">
                        @error('nom') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
                    </div>
                </div>

                <div class="mt-4">
                    <label for="telephone" class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" name="telephone" id="telephone" value="{{ old('telephone', $user->telephone) }}"
                        class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                </div>

                <div class="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p class="text-xs text-gray-500 inline-flex items-center gap-1.5">
                        <svg class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                        <strong>Email :</strong> {{ $user->email }} <span class="text-gray-400">(non modifiable par l'admin)</span>
                    </p>
                </div>
            </div>

            <!-- Roles -->
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h3 class="text-sm font-semibold text-gray-900 mb-4">Rôles</h3>
                <div class="grid grid-cols-2 gap-3">
                    @foreach($roles as $role)
                        <label
                            class="flex items-center gap-3 rounded-xl border border-gray-200 p-3 cursor-pointer hover:border-evadia-300 hover:bg-evadia-50/50 transition-all has-[:checked]:border-evadia-500 has-[:checked]:bg-evadia-50">
                            <input type="checkbox" name="roles[]" value="{{ $role->id }}" {{ $user->roles->contains('id', $role->id) ? 'checked' : '' }}
                                class="h-4 w-4 rounded border-gray-300 text-evadia-600 focus:ring-evadia-500">
                            <div>
                                <p class="text-sm font-medium text-gray-900">{{ $role->nom }}</p>
                                <p class="text-xs text-gray-400">Niveau {{ $role->niveau }}</p>
                            </div>
                        </label>
                    @endforeach
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 transition-colors">
                    Enregistrer les modifications
                </button>
                <a href="{{ route('admin.users.show', $user) }}"
                    class="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection