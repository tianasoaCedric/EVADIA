<?php

namespace App\Http\Controllers\Admin;

use App\Events\NewMessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMessageRequest;
use App\Models\HotelAdmin;
use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    use LogsAdminAction;

    public function index()
    {
        $userId = auth()->id();

        // Get conversations grouped by interlocutor
        $conversationUsers = Message::where('destinataire_id', $userId)
            ->orWhere('expediteur_id', $userId)
            ->selectRaw("
                CASE
                    WHEN expediteur_id = ? THEN destinataire_id
                    ELSE expediteur_id
                END as interlocuteur_id,
                MAX(date_envoi) as dernier_message_date
            ", [$userId])
            ->groupBy('interlocuteur_id')
            ->orderByDesc('dernier_message_date')
            ->paginate(20);

        // Load interlocutors and last message / unread count
        $conversations = $conversationUsers->through(function ($item) use ($userId) {
            $item->interlocuteur = User::with(['hotelAdmins.hotel'])->find($item->interlocuteur_id);
            $item->dernier_message = Message::where(function ($q) use ($userId, $item) {
                $q->where('expediteur_id', $userId)->where('destinataire_id', $item->interlocuteur_id);
            })->orWhere(function ($q) use ($userId, $item) {
                $q->where('expediteur_id', $item->interlocuteur_id)->where('destinataire_id', $userId);
            })->latest('date_envoi')->first();

            $item->non_lus = Message::where('expediteur_id', $item->interlocuteur_id)
                ->where('destinataire_id', $userId)
                ->where('lu', false)
                ->count();

            return $item;
        });

        return view('admin.messages.index', compact('conversations'));
    }

    public function create()
    {
        // Get hotel admins as possible recipients
        $recipients = User::whereHas('hotelAdmins', fn($q) => $q->where('est_principal', true))
            ->with('hotelAdmins.hotel')
            ->orderBy('nom')
            ->get();

        return view('admin.messages.create', compact('recipients'));
    }

    public function store(StoreMessageRequest $request)
    {
        $message = Message::create([
            'expediteur_id' => auth()->id(),
            'destinataire_id' => $request->destinataire_id,
            'sujet' => $request->sujet,
            'contenu' => $request->contenu,
        ]);

        // Create notification for recipient
        Notification::create([
            'user_id' => $request->destinataire_id,
            'type_notification' => 'nouveau_message',
            'titre' => 'Nouveau message de EVADIA',
            'contenu' => "Sujet : " . ($request->sujet ?? 'Sans sujet'),
            'lien' => "/hotel/messages/conversation/" . auth()->id(),
            'canal' => 'in_app',
        ]);

        broadcast(new NewMessageSent($message->load('expediteur')))->toOthers();

        return redirect()->route('admin.messages.conversation', $request->destinataire_id)
            ->with('success', 'Message envoyé avec succès.');
    }

    public function conversation(User $user)
    {
        $userId = auth()->id();

        $messages = Message::where(function ($q) use ($userId, $user) {
            $q->where('expediteur_id', $userId)->where('destinataire_id', $user->id);
        })->orWhere(function ($q) use ($userId, $user) {
            $q->where('expediteur_id', $user->id)->where('destinataire_id', $userId);
        })
            ->orderBy('date_envoi')
            ->get();

        // Mark received messages as read
        Message::where('expediteur_id', $user->id)
            ->where('destinataire_id', $userId)
            ->where('lu', false)
            ->update(['lu' => true]);

        return view('admin.messages.conversation', compact('messages', 'user'));
    }

    public function markAsRead(Message $message)
    {
        $message->update(['lu' => true]);

        return back();
    }
}
