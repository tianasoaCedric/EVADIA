<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class HotelController extends Controller
{
    #[OA\Get(
        path: '/api/client/hotels',
        summary: 'Rechercher des hôtels',
        description: 'Recherche et filtre les hôtels actifs par destination, étoiles, nom. Retourne les photos et prix.',
        tags: ['Client - Hôtels'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'search', in: 'query', required: false, description: 'Recherche par nom', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'destination_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'etoiles_min', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 5)),
            new OA\Parameter(name: 'date_debut', in: 'query', required: false, description: 'Date d\'arrivée', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'date_fin', in: 'query', required: false, description: 'Date de départ', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'nb_adultes', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 2)),
            new OA\Parameter(name: 'sort', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['etoiles', 'nom', 'prix'], default: 'nom')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste des hôtels',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'nom', type: 'string', example: 'Hôtel Renaissance'),
                            new OA\Property(property: 'description', type: 'string'),
                            new OA\Property(property: 'etoiles', type: 'integer', example: 4),
                            new OA\Property(property: 'photo_principale', type: 'string', nullable: true, example: 'https://s3.../photo.jpg'),
                            new OA\Property(property: 'adresse', type: 'object', nullable: true, properties: [
                                new OA\Property(property: 'ville', type: 'string', example: 'Paris'),
                                new OA\Property(property: 'pays', type: 'string', example: 'France'),
                            ]),
                            new OA\Property(property: 'prix_min', type: 'number', format: 'float', nullable: true, example: 89.00),
                            new OA\Property(property: 'note_moyenne', type: 'number', format: 'float', nullable: true, example: 4.2),
                        ])),
                        new OA\Property(property: 'current_page', type: 'integer'),
                        new OA\Property(property: 'last_page', type: 'integer'),
                        new OA\Property(property: 'total', type: 'integer'),
                    ]
                )
            ),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = Hotel::with(['photoPrincipale', 'adresse', 'currentStatut'])
            ->whereHas('currentStatut', fn($q) => $q->where('statut', 'actif'));

        if ($search = $request->input('search')) {
            $query->where('nom', 'ilike', "%{$search}%");
        }

        if ($destinationId = $request->input('destination_id')) {
            $query->whereHas('destinations', fn($q) => $q->where('destinations.id', $destinationId));
        }

        if ($etoilesMin = $request->input('etoiles_min')) {
            $query->where('etoiles', '>=', $etoilesMin);
        }

        $sort = $request->input('sort', 'nom');
        match ($sort) {
            'etoiles' => $query->orderByDesc('etoiles'),
            default => $query->orderBy('nom'),
        };

        $hotels = $query->paginate(12);

        $hotels->getCollection()->transform(function ($hotel) {
            $prixMin = $hotel->proprietes()
                ->whereHas('currentPrix')
                ->with('currentPrix')
                ->get()
                ->min(fn($p) => $p->currentPrix?->prix_par_nuit);

            $noteMoyenne = $hotel->proprietes()
                ->withAvg('avis', 'note')
                ->get()
                ->avg('avis_avg_note');

            return [
                'id' => $hotel->id,
                'nom' => $hotel->nom,
                'description' => $hotel->description,
                'etoiles' => $hotel->etoiles,
                'photo_principale' => $hotel->photoPrincipale?->url_photo,
                'adresse' => $hotel->adresse ? [
                    'ville' => $hotel->adresse->ville,
                    'pays' => $hotel->adresse->pays,
                ] : null,
                'prix_min' => $prixMin,
                'note_moyenne' => $noteMoyenne ? round($noteMoyenne, 1) : null,
            ];
        });

        return response()->json($hotels);
    }

    #[OA\Get(
        path: '/api/client/hotels/{id}',
        summary: 'Détails d\'un hôtel',
        description: 'Retourne les informations complètes d\'un hôtel : description, photos, chambres avec prix, services, avis.',
        tags: ['Client - Hôtels'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Détails de l\'hôtel',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'hotel', type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'nom', type: 'string', example: 'Hôtel Renaissance'),
                            new OA\Property(property: 'description', type: 'string'),
                            new OA\Property(property: 'etoiles', type: 'integer', example: 4),
                            new OA\Property(property: 'email_contact', type: 'string'),
                            new OA\Property(property: 'telephone', type: 'string'),
                            new OA\Property(property: 'site_web', type: 'string', nullable: true),
                        ]),
                        new OA\Property(property: 'photos', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'url_photo', type: 'string'),
                            new OA\Property(property: 'legende', type: 'string', nullable: true),
                        ])),
                        new OA\Property(property: 'chambres', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer'),
                            new OA\Property(property: 'nom', type: 'string'),
                            new OA\Property(property: 'type_propriete', type: 'string'),
                            new OA\Property(property: 'capacite', type: 'integer'),
                            new OA\Property(property: 'prix_par_nuit', type: 'number', nullable: true),
                            new OA\Property(property: 'photo', type: 'string', nullable: true),
                        ])),
                        new OA\Property(property: 'services', type: 'array', items: new OA\Items(type: 'object')),
                        new OA\Property(property: 'note_moyenne', type: 'number', format: 'float', nullable: true),
                        new OA\Property(property: 'nb_avis', type: 'integer'),
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Hôtel non trouvé'),
        ]
    )]
    public function show(int $id): JsonResponse
    {
        $hotel = Hotel::with(['photos', 'adresse', 'services', 'currentStatut'])
            ->whereHas('currentStatut', fn($q) => $q->where('statut', 'actif'))
            ->find($id);

        if (!$hotel) {
            return response()->json(['message' => 'Hôtel non trouvé'], 404);
        }

        $chambres = $hotel->proprietes()
            ->with(['currentPrix', 'photoPrincipale', 'currentStatut'])
            ->whereHas('currentStatut', fn($q) => $q->where('statut', 'disponible'))
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'nom' => $p->nom,
                'type_propriete' => $p->type_propriete,
                'capacite' => $p->capacite,
                'nb_chambres' => $p->nb_chambres,
                'nb_lits' => $p->nb_lits,
                'superficie' => $p->superficie,
                'prix_par_nuit' => $p->currentPrix?->prix_par_nuit,
                'photo' => $p->photoPrincipale?->url_photo,
            ]);

        $avis = $hotel->proprietes()->withCount('avis')->withAvg('avis', 'note')->get();
        $nbAvis = $avis->sum('avis_count');
        $noteMoyenne = $avis->avg('avis_avg_note');

        return response()->json([
            'hotel' => $hotel,
            'photos' => $hotel->photos,
            'chambres' => $chambres,
            'services' => $hotel->services,
            'note_moyenne' => $noteMoyenne ? round($noteMoyenne, 1) : null,
            'nb_avis' => $nbAvis,
        ]);
    }
}
