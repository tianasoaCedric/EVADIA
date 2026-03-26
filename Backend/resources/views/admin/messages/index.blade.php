@extends('layouts.admin')
@section('title', 'Messagerie - EVADIA Admin')
@section('page_title', 'Messagerie')

@section('content')
    <div class="flex items-center justify-between mb-6">
        <h2 class="text-sm text-gray-500">Conversations avec les administrateurs d'hôtels</h2>
        <a href="{{ route('admin.messages.create') }}"
            class="rounded-xl bg-evadia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-evadia-700 flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouveau message
        </a>
    </div>

    <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden divide-y divide-gray-100">
        @forelse($conversations as $conv)
            <a href="{{ route('admin.messages.conversation', $conv->interlocuteur) }}"
                class="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors {{ $conv->non_lus > 0 ? 'bg-evadia-50/30' : '' }}">
                <div
                    class="h-10 w-10 rounded-full bg-gradient-to-br from-evadia-400 to-evadia-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {{ substr($conv->interlocuteur?->prenom ?? '?', 0, 1) }}{{ substr($conv->interlocuteur?->nom ?? '?', 0, 1) }}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-gray-900 truncate">
                            {{ $conv->interlocuteur?->prenom }} {{ $conv->interlocuteur?->nom }}
                        </p>
                        <span class="text-xs text-gray-400">{{ $conv->dernier_message?->date_envoi?->diffForHumans() }}</span>
                    </div>
                    <p class="text-xs text-gray-500 truncate mt-0.5">
                        @if($conv->dernier_message?->sujet) <span class="font-medium">{{ $conv->dernier_message->sujet }}</span>
                        — @endif
                        {{ \Illuminate\Support\Str::limit($conv->dernier_message?->contenu, 60) }}
                    </p>
                </div>
                @if($conv->non_lus > 0)
                    <span
                        class="flex h-5 w-5 items-center justify-center rounded-full bg-evadia-600 text-[10px] font-bold text-white">
                        {{ $conv->non_lus }}
                    </span>
                @endif
            </a>
        @empty
            <div class="px-6 py-16 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke-width="1"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <p class="mt-2 text-sm text-gray-500">Aucune conversation</p>
            </div>
        @endforelse
    </div>

    <div class="mt-6">{{ $conversations->links() }}</div>
@endsection