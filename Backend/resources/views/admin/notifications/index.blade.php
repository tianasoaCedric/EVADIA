@extends('layouts.admin')
@section('title', 'Notifications - EVADIA Admin')
@section('page_title', 'Notifications')

@section('content')
<div class="max-w-3xl mx-auto space-y-4">
    {{-- Header --}}
    <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500">{{ $notifications->total() }} notification{{ $notifications->total() > 1 ? 's' : '' }}</p>
        @if($notifications->where('lu', false)->count() > 0)
            <form method="POST" action="{{ route('admin.notifications.mark-all-read') }}">
                @csrf
                <button type="submit" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">
                    Tout marquer comme lu
                </button>
            </form>
        @endif
    </div>

    {{-- Notifications List --}}
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-50">
        @forelse($notifications as $notif)
            <div class="flex gap-4 px-5 py-4 {{ !$notif->lu ? 'bg-evadia-50/30' : '' }}">
                {{-- Icon --}}
                <div class="shrink-0 mt-0.5">
                    <div class="h-10 w-10 rounded-full flex items-center justify-center {{ !$notif->lu ? 'bg-evadia-100 text-evadia-600' : 'bg-gray-100 text-gray-400' }}">
                        @if($notif->type_notification === 'nouveau_message')
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                        @elseif(str_contains($notif->type_notification, 'reservation'))
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                        @else
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                        @endif
                    </div>
                </div>

                {{-- Content --}}
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <p class="text-sm {{ !$notif->lu ? 'font-semibold text-gray-900' : 'font-medium text-gray-700' }}">{{ $notif->titre }}</p>
                            <p class="text-sm text-gray-500 mt-0.5">{{ $notif->contenu }}</p>
                        </div>
                        @if(!$notif->lu)
                            <span class="h-2.5 w-2.5 rounded-full bg-evadia-500 shrink-0 mt-1.5"></span>
                        @endif
                    </div>
                    <div class="flex items-center gap-3 mt-2">
                        <span class="text-xs text-gray-400">{{ $notif->date_envoi?->diffForHumans() }}</span>
                        @if($notif->lien)
                            <a href="{{ $notif->lien }}" class="text-xs text-evadia-600 hover:text-evadia-700 font-medium">Voir</a>
                        @endif
                        @if(!$notif->lu)
                            <form method="POST" action="{{ route('admin.notifications.mark-read', $notif) }}" class="inline">
                                @csrf @method('PATCH')
                                <button type="submit" class="text-xs text-gray-400 hover:text-gray-600">Marquer lu</button>
                            </form>
                        @endif
                    </div>
                </div>
            </div>
        @empty
            <div class="px-6 py-16 text-center">
                <svg class="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <p class="text-sm text-gray-400">Aucune notification pour le moment</p>
            </div>
        @endforelse
    </div>

    {{ $notifications->links() }}
</div>
@endsection
