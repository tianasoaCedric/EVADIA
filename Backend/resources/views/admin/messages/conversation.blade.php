@extends('layouts.admin')
@section('title', 'Conversation - EVADIA Admin')
@section('page_title', $user->prenom . ' ' . $user->nom)

@section('content')
    <div class="mb-6">
        <a href="{{ route('admin.messages.index') }}" class="text-sm text-evadia-600 hover:text-evadia-700 font-medium">←
            Messagerie</a>
    </div>

    <div class="max-w-3xl mx-auto">
        <!-- Messages -->
        <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div class="border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <div
                    class="h-10 w-10 rounded-full bg-gradient-to-br from-evadia-400 to-evadia-600 flex items-center justify-center text-white text-sm font-bold">
                    {{ substr($user->prenom, 0, 1) }}{{ substr($user->nom, 0, 1) }}
                </div>
                <div>
                    <p class="text-sm font-semibold text-gray-900">{{ $user->prenom }} {{ $user->nom }}</p>
                    <p class="text-xs text-gray-400">{{ $user->email }}</p>
                </div>
            </div>

            <div class="p-6 space-y-4 max-h-[500px] overflow-y-auto" id="messagesContainer">
                @foreach($messages as $msg)
                    @php $isMe = $msg->expediteur_id === auth()->id(); @endphp
                    <div class="flex {{ $isMe ? 'justify-end' : 'justify-start' }}">
                        <div
                            class="max-w-[70%] rounded-2xl px-4 py-3 {{ $isMe ? 'bg-evadia-600 text-white' : 'bg-gray-100 text-gray-900' }}">
                            @if($msg->sujet)
                                <p class="text-xs font-medium {{ $isMe ? 'text-white/70' : 'text-gray-500' }} mb-1">
                                    {{ $msg->sujet }}</p>
                            @endif
                            <p class="text-sm whitespace-pre-line">{{ $msg->contenu }}</p>
                            <p class="text-[10px] {{ $isMe ? 'text-white/50' : 'text-gray-400' }} mt-1 text-right">
                                {{ $msg->date_envoi?->format('d/m H:i') }}</p>
                        </div>
                    </div>
                @endforeach
            </div>

            <!-- Reply Form -->
            <div class="border-t border-gray-100 p-4">
                <form method="POST" action="{{ route('admin.messages.store') }}" class="flex items-end gap-3">
                    @csrf
                    <input type="hidden" name="destinataire_id" value="{{ $user->id }}">
                    <div class="flex-1">
                        <textarea name="contenu" rows="2" required placeholder="Écrire un message..."
                            class="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm resize-none focus:border-evadia-500 focus:ring-2 focus:ring-evadia-500/20"></textarea>
                    </div>
                    <button type="submit"
                        class="rounded-xl bg-evadia-600 p-3 text-white hover:bg-evadia-700 transition-colors shrink-0">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
    @vite(['resources/js/app.js'])
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const container = document.getElementById('messagesContainer');
            if (container) container.scrollTop = container.scrollHeight;

            // Real-time message receiving via Echo/Reverb
            if (window.Echo) {
                window.Echo.private('messages.{{ auth()->id() }}')
                    .listen('.message.sent', (e) => {
                        if (e.expediteur_id == {{ $user->id }}) {
                            const msgHtml = `
                                <div class="flex justify-start">
                                    <div class="max-w-[70%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-900">
                                        <p class="text-sm whitespace-pre-line">${e.contenu}</p>
                                        <p class="text-[10px] text-gray-400 mt-1 text-right">
                                            ${new Date(e.date_envoi).toLocaleString('fr-FR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>`;
                            container.insertAdjacentHTML('beforeend', msgHtml);
                            container.scrollTop = container.scrollHeight;
                        }
                    });
            }
        });
    </script>
@endpush
