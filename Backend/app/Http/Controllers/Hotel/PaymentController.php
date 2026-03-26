<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Paiement;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PaymentController extends Controller
{
    use BelongsToHotel, LogsAdminAction;

    public function index(Request $request)
    {
        $hotel = $this->getHotel();

        $paiements = Paiement::with(['reservation.client', 'reservation.propriete'])
            ->whereHas('reservation.propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->when($request->statut, fn($q, $s) => $q->where('statut', $s))
            ->when($request->date_debut, fn($q, $d) => $q->where('date_paiement', '>=', $d))
            ->when($request->date_fin, fn($q, $d) => $q->where('date_paiement', '<=', $d))
            ->when($request->search, function ($q, $s) {
                $q->where(function ($sq) use ($s) {
                    $sq->where('transaction_id', 'ilike', "%$s%")
                        ->orWhereHas('reservation', fn($rq) => $rq->where('code_reservation', 'ilike', "%$s%"));
                });
            })
            ->latest('date_paiement')
            ->paginate(20);

        // Stats
        $baseQuery = Paiement::whereHas('reservation.propriete', fn($q) => $q->where('hotel_id', $hotel->id));

        $stats = [
            'total_mois' => (clone $baseQuery)->where('statut', 'completed')
                ->whereMonth('date_paiement', now()->month)
                ->whereYear('date_paiement', now()->year)
                ->sum('montant'),
            'total_annee' => (clone $baseQuery)->where('statut', 'completed')
                ->whereYear('date_paiement', now()->year)
                ->sum('montant'),
            'nb_transactions_mois' => (clone $baseQuery)
                ->whereMonth('date_paiement', now()->month)
                ->whereYear('date_paiement', now()->year)
                ->count(),
            'en_attente' => (clone $baseQuery)->where('statut', 'pending')->sum('montant'),
        ];

        return view('hotel.payments.index', compact('paiements', 'stats', 'hotel'));
    }

    public function show($id)
    {
        $hotel = $this->getHotel();

        $paiement = Paiement::with(['reservation.client', 'reservation.propriete', 'methodePaiement'])
            ->whereHas('reservation.propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->where('id', $id)
            ->firstOrFail();

        return view('hotel.payments.show', compact('paiement', 'hotel'));
    }

    public function export(Request $request)
    {
        $hotel = $this->getHotel();

        $paiements = Paiement::with(['reservation.client', 'reservation.propriete'])
            ->whereHas('reservation.propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->when($request->date_debut, fn($q, $d) => $q->where('date_paiement', '>=', $d))
            ->when($request->date_fin, fn($q, $d) => $q->where('date_paiement', '<=', $d))
            ->orderBy('date_paiement', 'desc')
            ->get();

        $this->logAction('payments_exported', "Export de {$paiements->count()} paiements");

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="paiements_' . now()->format('Y-m-d') . '.csv"',
        ];

        return new StreamedResponse(function () use ($paiements) {
            $handle = fopen('php://output', 'w');
            // BOM for Excel UTF-8
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($handle, ['Date', 'Transaction ID', 'Code Réservation', 'Client', 'Propriété', 'Montant', 'Devise', 'Statut'], ';');

            foreach ($paiements as $p) {
                fputcsv($handle, [
                    $p->date_paiement?->format('d/m/Y H:i'),
                    $p->transaction_id,
                    $p->reservation?->code_reservation,
                    $p->reservation?->client ? $p->reservation->client->prenom . ' ' . $p->reservation->client->nom : '-',
                    $p->reservation?->propriete?->nom,
                    number_format($p->montant, 2, ',', ' '),
                    $p->devise_montant,
                    $p->statut,
                ], ';');
            }

            fclose($handle);
        }, 200, $headers);
    }
}
