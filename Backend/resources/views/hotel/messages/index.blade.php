@extends('layouts.hotel')

@section('title', 'Messagerie - EVADIA')
@section('page_title', 'Messagerie')

@section('content')
<div class="space-y-6" x-data="{ newMsgModal: false }">
    {{-- Header --}}
    <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500">Vos conversations avec l'équipe EVADIA</p>
        <button @click="newMsgModal = true"
            class="rounded-lg bg-gradient-to-r from-hotel-600 to-hotel-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-hotel-700 hover:to-hotel-800 transition-all flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouveau message
        </button>
    </div>

    {{-- Conversations List --}}
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
        @forelse($conversations as $conv)
            @php
                $user = $users[$conv->interlocuteur_id] ?? null;
                $unread = $unreadCounts[$conv->interlocuteur_id] ?? 0;
                $lastMsg = $lastMessages[$conv->interlocuteur_id] ?? null;
            @endphp
            @if($user)
                <a href="{{ route('hotel.messages.conversation', $conv->interlocuteur_id) }}"
                    class="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors {{ $unread > 0 ? 'bg-hotel-50/30' : '' }}">
                    {{-- Avatar --}}
                    <div class="h-10 w-10 rounded-full bg-gradient-to-br from-evadia-500 to-evadia-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {{ substr($user->prenom, 0, 1) }}{{ substr($user->nom, 0, 1) }}
                    </div>

                    {{-- Content --}}
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-0.5">
                            <p class="text-sm font-semibold text-gray-900 {{ $unread > 0 ? '' : 'font-medium' }}">{{ $user->prenom }} {{ $user->nom }}</p>
                            <span class="text-xs text-gray-400 shrink-0">{{ $conv->dernier_message_date ? \Carbon\Carbon::parse($conv->dernier_message_date)->diffForHumans() : '' }}</span>
                        </div>
                        @if($lastMsg)
                            <div class="flex items-center gap-2">
                                @if($lastMsg->sujet)
                                    <span class="text-xs font-medium text-gray-500">{{ $lastMsg->sujet }}</span>
                                    <span class="text-gray-300">-</span>
                                @endif
                                <p class="text-sm text-gray-500 truncate">{{ Str::limit($lastMsg->contenu, 80) }}</p>
                            </div>
                        @endif
                    </div>

                    {{-- Unread badge --}}
                    @if($unread > 0)
                        <span class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-hotel-600 px-1.5 text-[10px] font-bold text-white shrink-0">{{ $unread }}</span>
                    @endif
                </a>
            @endif
        @empty
            <div class="px-6 py-12 text-center">
                <svg class="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <p class="text-sm text-gray-400 mb-2">Aucune conversation</p>
                <button @click="newMsgModal = true" class="text-sm text-hotel-600 font-medium hover:text-hotel-700">Envoyer votre premier message</button>
            </div>
        @endforelse
    </div>

    {{ $conversations->links() }}

    {{-- New Message Modal --}}
    <div x-show="newMsgModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @keydown.escape.window="newMsgModal = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" @click.away="newMsgModal = false">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Nouveau message</h3>
            <form method="POST" action="{{ route('hotel.messages.store') }}">
                @csrf
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Destinataire (Admin EVADIA) *</label>
                        <select name="destinataire_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500">
                            <option value="">-- Sélectionner --</option>
                            @php
                                $admins = \App\Models\User::whereHas('roles', fn($q) => $q->whereIn('code', ['super_admin', 'admin_evadia']))->where('est_actif', true)->get();
                            @endphp
                            @foreach($admins as $admin)
                                <option value="{{ $admin->id }}">{{ $admin->prenom }} {{ $admin->nom }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
                        <input type="text" name="sujet" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500" placeholder="Sujet de votre message">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                        <textarea name="contenu" required rows="4" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-hotel-500 focus:ring-hotel-500" placeholder="Votre message..."></textarea>
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" @click="newMsgModal = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Annuler</button>
                    <button type="submit" class="rounded-lg bg-hotel-600 px-4 py-2 text-sm font-medium text-white hover:bg-hotel-700">Envoyer</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
