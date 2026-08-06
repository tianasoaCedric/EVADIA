<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Disponibilite;
use App\Models\Offre;
use App\Models\OffreUtilisation;
use App\Models\Propriete;
use App\Models\Reservation;
use Barryvdh\DomPDF\Facade\Pdf;
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
        $query = Reservation::with(['propriete.hotel', 'propriete.photoPrincipale'])
            ->where('client_id', $request->user()->id);

        if ($statut = $request->input('statut')) {
            $query->where('statut', $statut);
        }

        return response()->json($query->latest('date_reservation')->paginate(10));
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
        $reservation = Reservation::with(['propriete.hotel', 'propriete.photos', 'facture', 'services', 'avis'])
            ->where('client_id', $request->user()->id)
            ->find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Réservation non trouvée'], 404);
        }

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
    public function store(Request $request): JsonResponse
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
            'devise'         => 'nullable|string|in:MGA,EUR',
        ]);

        $propriete = Propriete::with(['currentPrix', 'hotel'])->findOrFail($validated['propriete_id']);

        // Vérification de disponibilité
        $indisponible = Disponibilite::where('propriete_id', $propriete->id)
            ->where('est_disponible', false)
            ->whereBetween('date', [$validated['date_debut'], $validated['date_fin']])
            ->exists();

        if ($indisponible) {
            return response()->json(['message' => 'La chambre n\'est pas disponible pour ces dates.'], 409);
        }

        // Vérification des conflits de réservation
        $conflit = Reservation::where('propriete_id', $propriete->id)
            ->whereIn('statut', ['en_attente', 'acceptee'])
            ->where('date_debut', '<', $validated['date_fin'])
            ->where('date_fin', '>', $validated['date_debut'])
            ->exists();

        if ($conflit) {
            return response()->json(['message' => 'La chambre est déjà réservée pour ces dates.'], 409);
        }

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

        if (!empty($validated['code_promo'])) {
            $resultat = $this->appliquerCodePromo(
                $validated['code_promo'],
                $propriete,
                $prixBase,
                $nbNuits,
                $request->user()->id
            );

            if (!$resultat['valide']) {
                return response()->json(['message' => $resultat['message']], 422);
            }

            $offre            = $resultat['offre'];
            $montantReduction = $resultat['montant_reduction'];
            $prixTotal        = max(0, $prixBase - $montantReduction);
            $codePromoUtilise = strtoupper($validated['code_promo']);
        }

        // Création de la réservation + enregistrement utilisation dans une transaction
        $reservation = DB::transaction(function () use (
            $request, $validated, $propriete, $prixBase, $prixTotal,
            $montantReduction, $offre, $codePromoUtilise, $nbNuits, $devise
        ) {
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

    /**
     * Vérifie un code promo et calcule la réduction applicable.
     *
     * @return array{valide: bool, message?: string, offre?: Offre, montant_reduction?: float}
     */
    private function appliquerCodePromo(
        string $code,
        Propriete $propriete,
        float $prixBase,
        int $nbNuits,
        int $clientId
    ): array {
        $offre = Offre::with(['avantages.type', 'avantages.utilisations'])
            ->where('code_promo', strtoupper($code))
            ->where('statut', 'active')
            ->where('date_debut', '<=', now())
            ->where('date_fin', '>=', now())
            ->first();

        if (!$offre) {
            return ['valide' => false, 'message' => 'Code promo invalide ou expiré.'];
        }

        // Vérifier que l'offre s'applique à cet hôtel ou à cette propriété
        $hotelId     = $propriete->hotel_id;
        $proprieteId = $propriete->id;
        $applicable  = false;

        foreach ($offre->avantages as $avantage) {
            foreach ($avantage->applications as $application) {
                if (
                    ($application->entite_type === 'hotel'    && $application->entite_id === $hotelId) ||
                    ($application->entite_type === 'propriete' && $application->entite_id === $proprieteId)
                ) {
                    $applicable = true;
                    break 2;
                }
            }
            // Si aucune application définie, l'offre s'applique partout (offre globale EVADIA)
            if ($avantage->applications->isEmpty()) {
                $applicable = true;
                break;
            }
        }

        if (!$applicable) {
            return ['valide' => false, 'message' => 'Ce code promo ne s\'applique pas à cette chambre.'];
        }

        // Vérifier que le client n'a pas déjà utilisé cette offre
        $dejaUtilise = OffreUtilisation::whereHas('avantage', fn($q) => $q->where('offre_id', $offre->id))
            ->where('client_id', $clientId)
            ->exists();

        if ($dejaUtilise) {
            return ['valide' => false, 'message' => 'Vous avez déjà utilisé ce code promo.'];
        }

        // Calculer la réduction totale en cumulant les avantages monétaires
        $montantReduction = 0;

        foreach ($offre->avantages as $avantage) {
            // Vérifier que la quantité max n'est pas atteinte
            if ($avantage->quantite_max !== null) {
                $utilisations = $avantage->utilisations->count();
                if ($utilisations >= $avantage->quantite_max) {
                    continue; // cet avantage est épuisé, on passe au suivant
                }
            }

            $code = $avantage->type?->code;

            switch ($code) {
                case 'reduction_pct':
                    // valeur = pourcentage (ex: 20 pour -20%)
                    $montantReduction += $prixBase * ($avantage->valeur / 100);
                    break;

                case 'reduction_montant':
                    // valeur = montant fixe à déduire
                    $montantReduction += $avantage->valeur;
                    break;

                case 'nuit_gratuite':
                    // valeur = nombre de nuits gratuites offertes
                    $nuitsGratuites    = min((int) $avantage->valeur, $nbNuits);
                    $prixNuit          = $nbNuits > 0 ? $prixBase / $nbNuits : 0;
                    $montantReduction += $prixNuit * $nuitsGratuites;
                    break;

                // Les autres types (petit_dejeuner, spa_offert, etc.) sont des avantages
                // en nature — ils ne modifient pas le prix, on les enregistre quand même.
                default:
                    break;
            }
        }

        // La réduction ne peut pas dépasser le prix de base
        $montantReduction = min(round($montantReduction, 2), $prixBase);

        return [
            'valide'           => true,
            'offre'            => $offre,
            'montant_reduction' => $montantReduction,
        ];
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
    public function verifierPromo(Request $request, string $code): JsonResponse
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

        $resultat = $this->appliquerCodePromo(
            $code,
            $propriete,
            $prixBase,
            $nbNuits,
            $request->user()->id
        );

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
