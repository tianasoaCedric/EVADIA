@extends('layouts.hotel')

@section('title', 'Mon Profil - EVADIA')
@section('page_title', 'Mon Profil')

@section('content')
    <div class="max-w-4xl mx-auto space-y-6">
        {{-- Personal Info --}}
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 class="text-sm font-semibold text-gray-900">Informations personnelles</h3>
                <p class="text-xs text-gray-500 mt-0.5">Modifiez vos informations de profil</p>
            </div>
            <form method="POST" action="{{ route('hotel.profile.update') }}" enctype="multipart/form-data" class="p-6">
                @csrf
                @method('PUT')

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {{-- Avatar --}}
                    <div class="md:col-span-2" x-data="{ preview: null }">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                        <div class="flex items-center gap-4">
                            <div
                                class="h-16 w-16 rounded-full bg-gradient-to-br from-hotel-500 to-hotel-700 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                                <template x-if="preview">
                                    <img :src="preview" class="h-full w-full object-cover">
                                </template>
                                <template x-if="!preview">
                                    @if($user->avatar_url)
                                        <img src="{{ Storage::disk('s3')->url($user->avatar_url) }}"
                                            class="h-full w-full object-cover">
                                    @else
                                        <span>{{ substr($user->prenom, 0, 1) }}{{ substr($user->nom, 0, 1) }}</span>
                                    @endif
                                </template>
                            </div>
                            <input type="file" name="avatar" accept="image/*"
                                class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-hotel-50 file:text-hotel-700 hover:file:bg-hotel-100"
                                @change="preview = URL.createObjectURL($event.target.files[0])">
                        </div>
                        @error('avatar') <p class="mt-1 text-sm text-red-600">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label for="prenom" class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                        <input type="text" name="prenom" id="prenom" value="{{ old('prenom', $user->prenom) }}" required
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500 @error('prenom') border-red-500 @enderror">
                        @error('prenom') <p class="mt-1 text-sm text-red-600">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label for="nom" class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input type="text" name="nom" id="nom" value="{{ old('nom', $user->nom) }}" required
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500 @error('nom') border-red-500 @enderror">
                        @error('nom') <p class="mt-1 text-sm text-red-600">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="email" value="{{ $user->email }}" disabled
                            class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500">
                        <p class="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié</p>
                    </div>

                    <div>
                        <label for="telephone" class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input type="text" name="telephone" id="telephone" value="{{ old('telephone', $user->telephone) }}"
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>
                </div>

                <div class="mt-6 flex justify-end">
                    <button type="submit"
                        class="rounded-lg bg-gradient-to-r from-hotel-600 to-hotel-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-hotel-700 hover:to-hotel-800 transition-all">
                        Enregistrer les modifications
                    </button>
                </div>
            </form>
        </div>

        {{-- Change Password --}}
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 class="text-sm font-semibold text-gray-900">Changer le mot de passe</h3>
                <p class="text-xs text-gray-500 mt-0.5">Assurez-vous d'utiliser un mot de passe long et aléatoire pour
                    rester en sécurité</p>
            </div>
            <form method="POST" action="{{ route('hotel.profile.password') }}" class="p-6">
                @csrf
                @method('PUT')

                <div class="space-y-4 max-w-md">
                    <div>
                        <label for="current_password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe
                            actuel</label>
                        <input type="password" name="current_password" id="current_password" required
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500 @error('current_password') border-red-500 @enderror">
                        @error('current_password') <p class="mt-1 text-sm text-red-600">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label for="new_password" class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de
                            passe</label>
                        <input type="password" name="password" id="new_password" required
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500 @error('password') border-red-500 @enderror">
                        @error('password') <p class="mt-1 text-sm text-red-600">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">Confirmer le
                            mot de passe</label>
                        <input type="password" name="password_confirmation" id="password_confirmation" required
                            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                    </div>

                    <div class="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 space-y-1">
                        <p>Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial</p>
                    </div>
                </div>

                <div class="mt-6 flex justify-end">
                    <button type="submit"
                        class="rounded-lg bg-gray-800 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 transition-all">
                        Modifier le mot de passe
                    </button>
                </div>
            </form>
        </div>
    </div>
@endsection