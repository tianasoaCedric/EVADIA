@extends('layouts.admin')
@section('title', 'Messagerie - EVADIA Admin')
@section('page_title', 'Messagerie')

@section('content')
<div class="space-y-6" x-data="{ newMsgModal: false }">
    {{-- Header --}}
    <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500">Conversations avec les administrateurs d'hôtels</p>
        <button @click="newMsgModal = true"
            class="rounded-xl bg-evadia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 transition-colors flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouveau message
        </button>
    </div>

    {{-- Conversations List --}}
    <div class="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden divide-y divide-gray-100">
        @forelse($conversations as $conv)
            <a href="{{ route('admin.messages.conversation', $conv->interlocuteur) }}"
                class="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors {{ $conv->non_lus > 0 ? 'bg-evadia-50/30' : '' }}">
                {{-- Avatar --}}
                <div class="h-10 w-10 rounded-full bg-gradient-to-br from-evadia-400 to-evadia-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {{ substr($conv->interlocuteur?->prenom ?? '?', 0, 1) }}{{ substr($conv->interlocuteur?->nom ?? '?', 0, 1) }}
                </div>

                {{-- Content --}}
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-0.5">
                        <div class="flex items-center gap-2 min-w-0">
                            <p class="text-sm font-semibold text-gray-900 truncate {{ $conv->non_lus > 0 ? '' : 'font-medium' }}">
                                {{ $conv->interlocuteur?->prenom }} {{ $conv->interlocuteur?->nom }}
                            </p>
                            @php $hotel = $conv->interlocuteur?->hotelAdmins?->first()?->hotel @endphp
                            @if($hotel)
                                <span class="shrink-0 rounded-full bg-evadia-100 px-2 py-0.5 text-[11px] font-medium text-evadia-700">{{ $hotel->nom }}</span>
                            @endif
                        </div>
                        <span class="text-xs text-gray-400 shrink-0">{{ $conv->dernier_message?->date_envoi?->diffForHumans() }}</span>
                    </div>
                    <p class="text-sm text-gray-500 truncate">
                        @if($conv->dernier_message?->sujet)
                            <span class="font-medium text-gray-600">{{ $conv->dernier_message->sujet }}</span>
                            <span class="text-gray-300 mx-1">—</span>
                        @endif
                        {{ \Illuminate\Support\Str::limit($conv->dernier_message?->contenu, 80) }}
                    </p>
                </div>

                {{-- Unread badge --}}
                @if($conv->non_lus > 0)
                    <span class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-evadia-600 px-1.5 text-[10px] font-bold text-white shrink-0">
                        {{ $conv->non_lus }}
                    </span>
                @endif
            </a>
        @empty
            <div class="px-6 py-16 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <p class="text-sm text-gray-500 mb-2">Aucune conversation</p>
                <button @click="newMsgModal = true" class="text-sm text-evadia-600 font-medium hover:text-evadia-700">Envoyer le premier message</button>
            </div>
        @endforelse
    </div>

    <div class="mt-6">{{ $conversations->links() }}</div>

    {{-- New Message Modal --}}
    <div x-show="newMsgModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @keydown.escape.window="newMsgModal = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6" @click.away="newMsgModal = false">
            <div class="flex items-center justify-between mb-5">
                <h3 class="text-base font-semibold text-gray-900">Nouveau message</h3>
                <button @click="newMsgModal = false" class="text-gray-400 hover:text-gray-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <form method="POST" action="{{ route('admin.messages.store') }}">
                @csrf
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Destinataire *</label>
                        <select name="destinataire_id" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20">
                            <option value="">— Sélectionner un admin hôtel —</option>
                            @php
                                $adminHotels = \App\Models\User::whereHas('roles', fn($q) => $q->whereIn('code', ['admin_hotel', 'gestionnaire_hotel']))->where('est_actif', true)->with('hotelAdmins.hotel')->get();
                            @endphp
                            @foreach($adminHotels as $admin)
                                @php $h = $admin->hotelAdmins->first()?->hotel @endphp
                                <option value="{{ $admin->id }}">{{ $admin->prenom }} {{ $admin->nom }}{{ $h ? ' — ' . $h->nom : '' }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
                        <input type="text" name="sujet" required
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20"
                            placeholder="Sujet de votre message">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                        <textarea name="contenu" required rows="4"
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20 resize-none"
                            placeholder="Votre message..."></textarea>
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" @click="newMsgModal = false"
                        class="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
                    <button type="submit"
                        class="rounded-xl bg-evadia-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-evadia-700 transition-colors">Envoyer</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
