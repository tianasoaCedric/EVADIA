<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom'     => 'required|string|max:100',
            'email'   => 'required|email|max:150',
            'message' => 'required|string|max:2000',
        ]);

        Mail::raw(
            "De : {$validated['nom']} <{$validated['email']}>\n\n{$validated['message']}",
            function ($mail) use ($validated) {
                $mail->to(config('mail.from.address'))
                     ->subject("Contact EVADIA — {$validated['nom']}");
            }
        );

        return response()->json(['message' => 'Message envoyé avec succès.']);
    }
}
