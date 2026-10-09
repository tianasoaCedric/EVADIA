<?php

namespace App\Http\Controllers\Api\Client;

use App\Actions\Reservation\NotifyHotelOfNewReservationAction;
use App\Http\Controllers\Controller;
use App\Models\Offre;
use App\Models\OffreUtilisation;
use App\Models\Photo;
use App\Models\Propriete;
use App\Models\Reservation;
use App\Services\DisponibiliteService;
use App\Services\OffreService;
use App\Services\PauseAbonnementService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class ReservationController extends Controller
{
    #[OA\Get(
        path: '/api/client/reservations',
        summary: 'Mes réservations',
        description: 'Retourne les réservations du client connecté.',
        tags: ['Client - Réservations'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'statut', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['en_attente', 'acceptee', 'refusee', 'annulee', 'terminee'])),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste des réservations du client',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'code_reservation', type: 'string', example: 'EV-a1b2c3d4'),
                            new OA\Property(property: 'date_debut', type: 'string', format: 'date'),
                            new OA\Property(property: 'date_fin', type: 'string', format: 'date'),
                            new OA\Property(property: 'prix_total', type: 'number', format: 'float', example: 720.00),
                            new OA\Property(property: 'statut', type: 'string', example: 'acceptee'),
                            new OA\Property(property: 'propriete', type: 'object', properties: [
                                new OA\Property(property: 'nom', type: 'string', example: 'Suite Deluxe'),
                                new OA\Property(property: 'hotel', type: 'object', properties: [
                                    new OA\Property(property: 'nom', type: 'string', example: 'Hôtel Renaissance'),
                                ]),
                            ]),
                        ])),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = Reservation::with(['propriete.hotel', 'propriete.photoPrincipale', 'offre:id,titre'])
            ->where('client_id', $request->user()->id);

        if ($statut = $request->input('statut')) {
            $query->where('statut', $statut);
        }

        $reservations = $query->latest('date_reservation')->paginate(10);

        $reservations->getCollection()->each(function (Reservation $reservation) {
            if ($photo = $reservation->propriete?->photoPrincipale) {
                $photo->url_photo = $photo->url;
            }
        });

        return response()->json($reservations);
    }

    #[OA\Get(
        path: '/api/client/reservations/{id}',
        summary: 'Détails d\'une réservation',
        tags: ['Client - Réservations'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Détails de la réservation', content: new OA\JsonContent(
                properties: [new OA\Property(property: 'data', type: 'object')]
            )),
            new OA\Response(response: 404, description: 'Réservation non trouvée'),
        ]
    )]
    public function show(Request $request, int $id): JsonResponse
    {
        $reservation = Reservation::with(['propriete.hotel', 'propriete.photos', 'facture', 'services', 'avis', 'offre:id,titre'])
            ->where('client_id', $request->user()->id)
            ->find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Réservation non trouvée'], 404);
        }

        $reservation->propriete?->photos->each(function (Photo $photo) {
            $photo->url_photo = $photo->url;
        });

        return response()->json(['data' => $reservation]);
    }

    #[OA\Post(
        path: '/api/client/reservations',
        summary: 'Créer une réservation',
        description: 'Effectue une nouvelle réservation. Vérifie la disponibilité de la chambre pour les dates demandées. Un code promo optionnel peut être fourni pour obtenir une réduction.',
        tags: ['Client - Réservations'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['propriete_id', 'date_debut', 'date_fin', 'nb_adultes'],
                properties: [
                    new OA\Property(property: 'propriete_id', type: 'integer', example: 3),
                    new OA\Property(property: 'date_debut', type: 'string', format: 'date', example: '2026-04-10'),
                    new OA\Property(property: 'date_fin', type: 'string', format: 'date', example: '2026-04-15'),
                    new OA\Property(property: 'nb_adultes', type: 'integer', example: 2),
                    new OA\Property(property: 'nb_enfants', type: 'integer', example: 0),
                    new OA\Property(property: 'nb_bebes', type: 'integer', example: 0),
                    new OA\Property(property: 'demande_speciale', type: 'string', nullable: true, example: 'Vue sur mer si possible'),
                    new OA\Property(property: 'code_promo', type: 'string', nullable: true, example: 'EVADIA-ABC123'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Réservation créée',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Réservation créée avec succès'),
                        new OA\Property(property: 'data', type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer'),
                            new OA\Property(property: 'code_reservation', type: 'string', example: 'EV-a1b2c3d4'),
                            new OA\Property(property: 'prix_avant_reduction', type: 'number', example: 900.00),
                            new OA\Property(property: 'montant_reduction', type: 'number', example: 180.00),
                            new OA\Property(property: 'prix_total', type: 'number', example: 720.00),
                            new OA\Property(property: 'statut', type: 'string', example: 'en_attente'),
                        ]),
                    ]
                )
            ),
            new OA\Response(response: 409, description: 'Chambre non disponible pour ces dates'),
            new OA\Response(response: 422, description: 'Erreur de validation ou code promo invalide'),
        ]
    )]
    public function store(Request $request, DisponibiliteService $disponibilites, NotifyHotelOfNewReservationAction $notifyHotel, PauseAbonnementService $pauses, OffreService $offres): JsonResponse
    {
        $validated = $request->validate([
            'propriete_id'   => 'required|exists:proprietes,id',
            'date_debut'     => 'required|date|after:today',
            'date_fin'       => 'required|date|after:date_debut',
            'nb_adultes'     => 'required|integer|min:1',
            'nb_enfants'     => 'nullable|integer|min:0',
            'nb_bebes'       => 'nullable|integer|min:0',
            'demande_speciale' => 'nullable|string|max:1000',
            'code_promo'     => 'nullable|string|max:50',
            // Réservation depuis la page d'une offre : réduction appliquée sans code
            'offre_id'       => 'nullable|integer|prohibits:code_promo',
            'devise'         => 'nullable|string|in:MGA,EUR',
        ]);

        $propriete = Propriete::with(['currentPrix', 'hotel.currentStatut'])->findOrFail($validated['propriete_id']);

        // Hôtel suspendu (ex. abonnement impayé), fermé ou pas encore validé :
        // plus de nouvelles réservations, même via un lien direct vers la chambre.
        if ($propriete->hotel?->currentStatut?->statut !== 'actif') {
            return response()->json(['message' => "Cet établissement n'accepte pas de réservations pour le moment."], 409);
        }

        // Pause planifiée sur ces dates : l'hôtel est encore en ligne, mais sera fermé pendant le séjour.
        $pause = $pauses->pauseSurSejour(
            $propriete->hotel_id,
            Carbon::parse($validated['date_debut']),
            Carbon::parse($validated['date_fin'])
        );
        if ($pause) {
            return response()->json([
                'message' => sprintf(
                    "Cet établissement est fermé du %s au %s. Choisissez d'autres dates.",
                    $pause->date_debut->format('d/m/Y'),
                    $pause->date_reprise->copy()->subDay()->format('d/m/Y'),
                ),
            ], 409);
        }

        // La disponibilité (fermetures + stock d'unités) est vérifiée dans la
        // transaction ci-dessous, sous verrou, pour éviter la sur-réservation.

        // Calcul du prix de base dans la devise choisie par le client
        $devise      = strtoupper($validated['devise'] ?? 'MGA');
        $nbNuits     = (new \DateTime($validated['date_debut']))->diff(new \DateTime($validated['date_fin']))->days;
        $prixNuit    = $propriete->currentPrix?->getPrixPourDevise($devise) ?? 0;
        $prixBase    = $prixNuit * $nbNuits;

        // Résolution du code promo
        $offre             = null;
        $montantReduction  = 0;
        $prixTotal         = $prixBase;
        $codePromoUtilise  = null;

        if (!empty($validated['code_promo']) || !empty($validated['offre_id'])) {
            $offreTrouvee = !empty($validated['code_promo'])
                ? $offres->trouverParCode($validated['code_promo'])
                : $offres->trouverActive((int) $validated['offre_id']);

            if (!$offreTrouvee) {
                $message = !empty($validated['code_promo'])
                    ? 'Code promo invalide ou expiré.'
                    : 'Cette offre n\'est plus disponible.';
                return response()->json(['message' => $message], 422);
            }

            $resultat = $offres->calculer($offreTrouvee, $propriete, $prixBase, $nbNuits, $request->user()->id);

            if (!$resultat['valide']) {
                return response()->json(['message' => $resultat['message']], 422);
            }

            $offre            = $resultat['offre'];
            $montantReduction = $resultat['montant_reduction'];
            $prixTotal        = max(0, $prixBase - $montantReduction);
            $codePromoUtilise = !empty($validated['code_promo']) ? $offre->code_promo : null;
        }

        // Calcul de l'acompte si l'hôtel l'exige
        $hotel = $propriete->hotel;
        $montantAcompte = null;
        $statutPaiementAcompte = 'non_requis';

        if ($hotel && $hotel->exige_acompte && $hotel->pourcentage_acompte > 0) {
            $montantAcompte = round($prixTotal * (float) $hotel->pourcentage_acompte / 100, 2);
            $statutPaiementAcompte = 'en_attente';
        }

        // Création de la réservation + enregistrement utilisation dans une transaction
        try {
            $reservation = DB::transaction(function () use (
                $request, $validated, $propriete, $prixBase, $prixTotal,
                $montantReduction, $offre, $codePromoUtilise, $nbNuits, $devise,
                $montantAcompte, $statutPaiementAcompte, $disponibilites
            ) {
                // Verrou sur la propriété : deux réservations simultanées de la
                // dernière unité ne peuvent pas passer toutes les deux.
                Propriete::whereKey($propriete->id)->lockForUpdate()->first();

                $nuitsIndisponibles = $disponibilites->nuitsIndisponibles(
                    $propriete,
                    Carbon::parse($validated['date_debut']),
                    Carbon::parse($validated['date_fin'])
                );

                if ($nuitsIndisponibles) {
                    $dates = implode(', ', array_map(fn($d) => Carbon::parse($d)->format('d/m/Y'), $nuitsIndisponibles));
                    throw new DomainException("Plus aucune chambre disponible pour la nuit du : {$dates}.");
                }

                $reservation = Reservation::create([
                    'code_reservation'    => Reservation::generateCode(),
                    'client_id'           => $request->user()->id,
                    'propriete_id'        => $propriete->id,
                    'date_debut'          => $validated['date_debut'],
                    'date_fin'            => $validated['date_fin'],
                    'nb_adultes'          => $validated['nb_adultes'],
                    'nb_enfants'          => $validated['nb_enfants'] ?? 0,
                    'nb_bebes'            => $validated['nb_bebes'] ?? 0,
                    'prix_avant_reduction' => $offre ? $prixBase : null,
                    'montant_reduction'   => $montantReduction,
                    'prix_total'          => $prixTotal,
                    'devise_prix_total'   => $devise,
                    'montant_acompte'     => $montantAcompte,
                    'statut_paiement_acompte' => $statutPaiementAcompte,
                    'statut'              => 'en_attente',
                    'date_reservation'    => now(),
                    'demande_speciale'    => $validated['demande_speciale'] ?? null,
                    'code_promo_utilise'  => $codePromoUtilise,
                    'offre_id'            => $offre?->id,
                ]);

                // Enregistrer chaque utilisation d'avantage
                if ($offre) {
                    foreach ($offre->avantages as $avantage) {
                        OffreUtilisation::create([
                            'avantage_id'      => $avantage->id,
                            'reservation_id'   => $reservation->id,
                            'client_id'        => $request->user()->id,
                            'date_utilisation' => now(),
                            'quantite_utilisee' => 1,
                        ]);
                    }
                }

                return $reservation;
            });
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        $notifyHotel->handle($reservation);

        $responseData = [
            'id'               => $reservation->id,
            'code_reservation' => $reservation->code_reservation,
            'prix_total'       => $reservation->prix_total,
            'statut'           => $reservation->statut,
        ];

        if ($offre) {
            $responseData['prix_avant_reduction'] = $prixBase;
            $responseData['montant_reduction']    = $montantReduction;
            $responseData['offre']                = $offre->titre;
        }

        return response()->json([
            'message' => 'Réservation créée avec succès',
            'data'    => $responseData,
        ], 201);
    }

    #[OA\Get(
        path: '/api/client/promo/{code}',
        summary: 'Vérifier un code promo',
        description: 'Vérifie si un code promo est valide pour une chambre donnée et retourne la réduction applicable.',
        tags: ['Client - Réservations'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'code', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'propriete_id', in: 'query', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'date_debut', in: 'query', required: true, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'date_fin', in: 'query', required: true, schema: new OA\Schema(type: 'string', format: 'date')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Code promo valide'),
            new OA\Response(response: 422, description: 'Code promo invalide'),
        ]
    )]
    public function verifierPromo(Request $request, string $code, OffreService $offres): JsonResponse
    {
        $request->validate([
            'propriete_id' => 'required|exists:proprietes,id',
            'date_debut'   => 'required|date',
            'date_fin'     => 'required|date|after:date_debut',
        ]);

        $propriete = Propriete::with(['currentPrix', 'hotel'])->findOrFail($request->propriete_id);

        $nbNuits  = (new \DateTime($request->date_debut))->diff(new \DateTime($request->date_fin))->days;
        $prixNuit = $propriete->currentPrix?->prix_par_nuit ?? 0;
        $prixBase = $prixNuit * $nbNuits;

        $offre = $offres->trouverParCode($code);
        $resultat = $offre
            ? $offres->calculer($offre, $propriete, $prixBase, $nbNuits, $request->user()->id)
            : ['valide' => false, 'message' => 'Code promo invalide ou expiré.'];

        if (!$resultat['valide']) {
            return response()->json(['message' => $resultat['message']], 422);
        }

        $prixApresReduction = max(0, $prixBase - $resultat['montant_reduction']);

        return response()->json([
            'valide'             => true,
            'offre'              => $resultat['offre']->titre,
            'prix_base'          => $prixBase,
            'montant_reduction'  => $resultat['montant_reduction'],
            'prix_apres_reduction' => $prixApresReduction,
        ]);
    }

    #[OA\Patch(
        path: '/api/client/reservations/{id}/cancel',
        summary: 'Annuler une réservation',
        description: 'Le client annule sa réservation (si encore possible).',
        tags: ['Client - Réservations'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'raison', type: 'string', nullable: true, example: 'Changement de plans'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Réservation annulée'),
            new OA\Response(response: 404, description: 'Réservation non trouvée'),
            new OA\Response(response: 409, description: 'Annulation impossible (réservation déjà terminée ou annulée)'),
        ]
    )]
    public function cancel(Request $request, int $id): JsonResponse
    {
        $reservation = Reservation::where('client_id', $request->user()->id)->findOrFail($id);

        if (in_array($reservation->statut, ['annulee', 'terminee'])) {
            return response()->json(['message' => 'Cette réservation ne peut plus être annulée.'], 409);
        }

        $reservation->update([
            'statut'            => 'annulee',
            'annulee_par'       => $request->user()->id,
            'raison_annulation' => $request->input('raison'),
        ]);

        return response()->json(['message' => 'Réservation annulée avec succès.']);
    }

    #[OA\Get(
        path: '/api/client/reservations/{id}/invoice',
        summary: 'Télécharger la facture',
        description: 'Télécharge la facture PDF d\'une réservation acceptée.',
        tags: ['Client - Réservations'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Fichier PDF de la facture'),
            new OA\Response(response: 404, description: 'Réservation ou facture non trouvée'),
        ]
    )]
    public function invoice(Request $request, int $id): Response
    {
        $reservation = Reservation::with(['client', 'propriete.hotel', 'facture'])
            ->where('client_id', $request->user()->id)
            ->find($id);

        if (!$reservation || !$reservation->facture) {
            abort(404, 'Facture non trouvée.');
        }

        $facture = $reservation->facture;

        $pdf = Pdf::loadView('pdf.facture', compact('reservation', 'facture'));

        return $pdf->download("facture-{$facture->numero_facture}.pdf");
    }
}
