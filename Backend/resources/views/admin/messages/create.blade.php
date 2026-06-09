@extends('layouts.admin')
@section('title', 'Nouveau message - EVADIA Admin')
@section('page_title', 'Nouveau message')

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.messages.index') }}" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">←
            Retour</a>
    </div>

    <div class="max-w-2xl mx-auto">
        <form method="POST" action="{{ route('admin.messages.store') }}" class="space-y-6">
            @csrf

            <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <div class="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                    <h3 class="text-sm font-semibold text-gray-800">Nouveau message</h3>
                </div>
                <div class="p-6 space-y-5">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Destinataire <span class="text-red-400 text-xs">*</span></label>
                        <select name="destinataire_id" required
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                            <option value="">Sélectionner un destinataire</option>
                            @foreach($recipients as $r)
                                <option value="{{ $r->id }}">{{ $r->prenom }} {{ $r->nom }} —
                                    {{ $r->hotelAdmins->first()?->hotel?->nom }}</option>
                            @endforeach
                        </select>
                        @error('destinataire_id') <p class="mt-1.5 text-xs text-red-500">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Sujet</label>
                        <input type="text" name="sujet" value="{{ old('sujet') }}"
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Message <span class="text-red-400 text-xs">*</span></label>
                        <textarea name="contenu" rows="6" required
                            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 focus:outline-none @error('contenu') border-red-400 bg-red-50/40 @enderror">{{ old('contenu') }}</textarea>
                        @error('contenu') <p class="mt-1.5 text-xs text-red-500">{{ $message }}</p> @enderror
                    </div>

                </div>
            </div>

            <div class="flex items-center gap-3 pt-1">
                <button type="submit"
                    class="rounded-xl bg-evadia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 active:scale-95 transition-all">
                    Envoyer
                </button>
                <a href="{{ route('admin.messages.index') }}"
                    class="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                </a>
            </div>
        </form>
    </div>
@endsection
