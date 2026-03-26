@extends('layouts.admin')
@section('title', 'Nouveau message - EVADIA Admin')
@section('page_title', 'Nouveau message')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.messages.index') }}" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">←
            Retour</a>
    </div>

    <div class="max-w-2xl">
        <form method="POST" action="{{ route('admin.messages.store') }}"
            class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
            @csrf
            <h3 class="text-lg font-semibold text-gray-900">Envoyer un message</h3>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Destinataire *</label>
                <select name="destinataire_id" required
                    class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                    <option value="">Sélectionner un destinataire</option>
                    @foreach($recipients as $r)
                        <option value="{{ $r->id }}">{{ $r->prenom }} {{ $r->nom }} —
                            {{ $r->hotelAdmins->first()?->hotel?->nom }}</option>
                    @endforeach
                </select>
                @error('destinataire_id') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                <input type="text" name="sujet" value="{{ old('sujet') }}"
                    class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea name="contenu" rows="6" required
                    class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">{{ old('contenu') }}</textarea>
                @error('contenu') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
            </div>
            <button type="submit"
                class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-evadia-700 transition-colors">Envoyer</button>
        </form>
    </div>
@endsection