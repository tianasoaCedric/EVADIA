<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    use BelongsToHotel, LogsAdminAction;

    public function index()
    {
        $hotel = $this->getHotel();

        // Get conversations grouped by interlocutor
        $conversations = Message::where('destinataire_id', auth()->id())
            ->orWhere('expediteur_id', auth()->id())
            ->selectRaw('
                CASE
                    WHEN expediteur_id = ? THEN destinataire_id
                    ELSE expediteur_id
                END as interlocuteur_id,
                MAX(date_envoi) as dernier_message_date
            ', [auth()->id()])
            ->groupBy('interlocuteur_id')
            ->orderByDesc('dernier_message_date')
            ->paginate(20);

        // Load interlocutor users
        $userIds = $conversations->pluck('interlocuteur_id')->toArray();
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');

        // Get unread counts per interlocutor
        $unreadCounts = Message::where('destinataire_id', auth()->id())
            ->where('lu', false)
            ->selectRaw('expediteur_id, COUNT(*) as count')
            ->groupBy('expediteur_id')
            ->pluck('count', 'expediteur_id');

        // Get latest message per conversation
        $lastMessages = [];
        foreach ($userIds as $userId) {
            $lastMessages[$userId] = Message::where(function ($q) use ($userId) {
                $q->where('expediteur_id', auth()->id())->where('destinataire_id', $userId);
            })->orWhere(function ($q) use ($userId) {
                $q->where('expediteur_id', $userId)->where('destinataire_id', auth()->id());
            })->latest('date_envoi')->first();
        }

        return view('hotel.messages.index', compact('conversations', 'users', 'unreadCounts', 'lastMessages', 'hotel'));
    }

    public function conversation($userId)
    {
        $hotel = $this->getHotel();

        // Verify interlocutor is an EVADIA admin
        $interlocuteur = User::whereHas('roles', fn($q) => $q->whereIn('code', ['super_admin', 'admin_evadia']))
            ->findOrFail($userId);

        $messages = Message::where(function ($q) use ($userId) {
            $q->where('expediteur_id', auth()->id())->where('destinataire_id', $userId);
        })->orWhere(function ($q) use ($userId) {
            $q->where('expediteur_id', $userId)->where('destinataire_id', auth()->id());
        })
            ->orderBy('date_envoi')->get();

        // Mark as read
        Message::where('expediteur_id', $userId)
            ->where('destinataire_id', auth()->id())
            ->where('lu', false)
            ->update(['lu' => true]);

        return view('hotel.messages.conversation', compact('messages', 'interlocuteur', 'hotel'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'destinataire_id' => 'required|exists:users,id',
            'sujet' => 'required|string|max:255',
            'contenu' => 'required|string',
        ]);

        // Verify destinataire is EVADIA admin
        User::whereHas('roles', fn($q) => $q->whereIn('code', ['super_admin', 'admin_evadia']))
            ->findOrFail($request->destinataire_id);

        $hotel = $this->getHotel();

        Message::create([
            'expediteur_id' => auth()->id(),
            'destinataire_id' => $request->destinataire_id,
            'sujet' => $request->sujet,
            'contenu' => $request->contenu,
            'date_envoi' => now(),
        ]);

        Notification::create([
            'user_id' => $request->destinataire_id,
            'type_notification' => 'nouveau_message',
            'titre' => 'Nouveau message de ' . $hotel->nom,
            'contenu' => Str::limit($request->contenu, 100),
            'lien' => '/admin/messages/conversation/' . auth()->id(),
            'canal' => 'in_app',
            'date_envoi' => now(),
        ]);

        return redirect()->route('hotel.messages.conversation', $request->destinataire_id)
            ->with('success', 'Message envoyé.');
    }

    public function reply(Request $request)
    {
        $request->validate([
            'destinataire_id' => 'required|exists:users,id',
            'contenu' => 'required|string',
        ]);

        $hotel = $this->getHotel();

        // Get the conversation subject
        $dernierMessage = Message::where(function ($q) use ($request) {
            $q->where('expediteur_id', auth()->id())->where('destinataire_id', $request->destinataire_id);
        })->orWhere(function ($q) use ($request) {
            $q->where('expediteur_id', $request->destinataire_id)->where('destinataire_id', auth()->id());
        })->latest('date_envoi')->first();

        Message::create([
            'expediteur_id' => auth()->id(),
            'destinataire_id' => $request->destinataire_id,
            'sujet' => $dernierMessage?->sujet,
            'contenu' => $request->contenu,
            'date_envoi' => now(),
        ]);

        Notification::create([
            'user_id' => $request->destinataire_id,
            'type_notification' => 'nouveau_message',
            'titre' => 'Nouveau message de ' . $hotel->nom,
            'contenu' => Str::limit($request->contenu, 100),
            'lien' => '/admin/messages/conversation/' . auth()->id(),
            'canal' => 'in_app',
            'date_envoi' => now(),
        ]);

        return back()->with('success', 'Réponse envoyée.');
    }
}
