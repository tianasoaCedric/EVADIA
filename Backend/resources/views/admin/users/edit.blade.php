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

            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <h3 class="text-sm font-semibold text-gray-800">Informations personnelles</h3>
                </div>
                <div class="p-6 space-y-5">

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="prenom" class="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                            <input type="text" name="prenom" id="prenom" value="{{ old('prenom', $user->prenom) }}" required
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none @error('prenom') border-red-400 bg-red-50/40 @enderror">
                            @error('prenom') <p class="mt-1.5 text-xs text-red-500">{{ $message }}</p> @enderror
                        </div>
                        <div>
                            <label for="nom" class="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                            <input type="text" name="nom" id="nom" value="{{ old('nom', $user->nom) }}" required
                                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none @error('nom') border-red-400 bg-red-50/40 @enderror">
                            @error('nom') <p class="mt-1.5 text-xs text-red-500">{{ $message }}</p> @enderror
                        </div>
                    </div>

                    <div>
                        <label for="telephone" class="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                        <input type="tel" name="telephone" id="telephone" value="{{ old('telephone', $user->telephone) }}"
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                    </div>

                    <div class="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                        <svg class="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <p class="text-sm text-gray-600">
                            <strong>{{ $user->email }}</strong>
                            <span class="text-gray-400 ml-1">(non modifiable par l'admin)</span>
                        </p>
                    </div>

                </div>
            </div>

            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <h3 class="text-sm font-semibold text-gray-800">Rôles</h3>
                </div>
                <div class="p-6">
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
            </div>

            <div class="flex items-center gap-3 pt-1">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 active:scale-95 transition-all">
                    Enregistrer les modifications
                </button>
                <a href="{{ route('admin.users.show', $user) }}"
                    class="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection
