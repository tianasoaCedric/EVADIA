@extends('layouts.hotel')

@section('title', 'Conversation avec ' . $interlocuteur->prenom . ' - EVADIA')
@section('page_title', 'Conversation')

@section('content')
<div class="space-y-6">
    {{-- Header --}}
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
            <a href="{{ route('hotel.messages.index') }}" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </a>
            <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-gradient-to-br from-evadia-500 to-evadia-700 flex items-center justify-center text-white text-sm font-bold">
                    {{ substr($interlocuteur->prenom, 0, 1) }}{{ substr($interlocuteur->nom, 0, 1) }}
                </div>
                <div>
                    <p class="text-sm font-semibold text-gray-900">{{ $interlocuteur->prenom }} {{ $interlocuteur->nom }}</p>
                    <p class="text-xs text-gray-400">Admin EVADIA</p>
                </div>
            </div>
        </div>
    </div>

    {{-- Messages --}}
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="h-[500px] overflow-y-auto p-6 space-y-4" id="messages-container">
            @forelse($messages as $message)
                @php $isMe = $message->expediteur_id === auth()->id(); @endphp
                <div class="flex {{ $isMe ? 'justify-end' : 'justify-start' }}">
                    <div class="max-w-[70%]">
                        @if($message->sujet && $loop->first)
                            <p class="text-xs text-gray-400 mb-1 {{ $isMe ? 'text-right' : '' }}">{{ $message->sujet }}</p>
                        @endif
                        <div class="rounded-2xl px-4 py-2.5 {{ $isMe ? 'bg-hotel-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md' }}">
                            <p class="text-sm whitespace-pre-wrap">{{ $message->contenu }}</p>
                        </div>
                        <p class="text-[10px] text-gray-400 mt-1 {{ $isMe ? 'text-right' : '' }}">
                            {{ $message->date_envoi ? \Carbon\Carbon::parse($message->date_envoi)->format('d/m/Y H:i') : '' }}
                            @if(!$isMe && $message->lu)
                                <span class="text-emerald-500 ml-1">Lu</span>
                            @endif
                        </p>
                    </div>
                </div>
            @empty
                <div class="text-center py-12">
                    <p class="text-sm text-gray-400">Aucun message dans cette conversation</p>
                </div>
            @endforelse
        </div>

        {{-- Reply Form --}}
        <div class="border-t border-gray-200 p-4">
            <form method="POST" action="{{ route('hotel.messages.reply') }}" class="flex gap-3">
                @csrf
                <input type="hidden" name="destinataire_id" value="{{ $interlocuteur->id }}">
                <textarea name="contenu" required rows="1" placeholder="Votre réponse..."
                    class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-hotel-500 focus:ring-hotel-500 resize-none"
                    onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault();this.form.submit();}"></textarea>
                <button type="submit" class="rounded-xl bg-hotel-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-hotel-700 transition-colors shrink-0">
                    Envoyer
                </button>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('messages-container');
    if (container) container.scrollTop = container.scrollHeight;
});
</script>
@endpush
