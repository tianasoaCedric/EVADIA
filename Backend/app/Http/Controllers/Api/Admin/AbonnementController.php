<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Abonnement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AbonnementController extends Controller
{
    #[OA\Get(
        path: '/api/admin/subscriptions',
        summary: 'Liste des abonnements',
        description: 'Retourne la liste paginée des abonnements hôteliers.',
        tags: ['Admin - Abonnements'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'statut', in: 'query', required: false, description: 'actif ou expire', schema: new OA\Schema(type: 'string', enum: ['actif', 'expire'])),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste des abonnements',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'hotel_id', type: 'integer', example: 5),
                            new OA\Property(property: 'type_abonnement', type: 'string', example: 'premium'),
                            new OA\Property(property: 'date_debut', type: 'string', format: 'date', example: '2026-01-01'),
                            new OA\Property(property: 'date_fin', type: 'string', format: 'date', nullable: true, example: '2026-12-31'),
                            new OA\Property(property: 'prix_mensuel', type: 'number', format: 'float', example: 99.99),
                            new OA\Property(property: 'devise', type: 'string', example: 'EUR'),
                            new OA\Property(property: 'hotel', type: 'object', properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 5),
                                new OA\Property(property: 'nom', type: 'string', example: 'Hôtel Renaissance'),
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
        $query = Abonnement::with('hotel');

        if ($request->input('statut') === 'actif') {
            $query->actif();
        } elseif ($request->input('statut') === 'expire') {
            $query->expire();
        }

        return response()->json($query->latest('created_at')->paginate(15));
    }

    #[OA\Post(
        path: '/api/admin/subscriptions',
        summary: 'Créer un abonnement',
        description: 'Crée un nouvel abonnement pour un hôtel.',
        tags: ['Admin - Abonnements'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['hotel_id', 'type_abonnement', 'date_debut', 'prix_mensuel'],
                properties: [
                    new OA\Property(property: 'hotel_id', type: 'integer', example: 5),
                    new OA\Property(property: 'type_abonnement', type: 'string', example: 'premium'),
                    new OA\Property(property: 'date_debut', type: 'string', format: 'date', example: '2026-01-01'),
                    new OA\Property(property: 'date_fin', type: 'string', format: 'date', nullable: true, example: '2026-12-31'),
                    new OA\Property(property: 'prix_mensuel', type: 'number', format: 'float', example: 99.99),
                    new OA\Property(property: 'devise', type: 'string', example: 'EUR'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Abonnement créé', content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Abonnement créé avec succès'),
                    new OA\Property(property: 'abonnement', type: 'object'),
                ]
            )),
            new OA\Response(response: 422, description: 'Erreur de validation'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
            'type_abonnement' => 'required|string|max:100',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut',
            'prix_mensuel' => 'required|numeric|min:0',
            'devise' => 'nullable|string|max:10',
        ]);

        $abonnement = Abonnement::create($validated);

        return response()->json(['message' => 'Abonnement créé avec succès', 'abonnement' => $abonnement], 201);
    }

    #[OA\Get(
        path: '/api/admin/subscriptions/{id}',
        summary: 'Détails d\'un abonnement',
        tags: ['Admin - Abonnements'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Détails de l\'abonnement', content: new OA\JsonContent(
                properties: [new OA\Property(property: 'data', type: 'object')]
            )),
            new OA\Response(response: 404, description: 'Abonnement non trouvé'),
        ]
    )]
    public function show(int $id): JsonResponse
    {
        $abonnement = Abonnement::with(['hotel', 'historique'])->find($id);

        if (!$abonnement) {
            return response()->json(['message' => 'Abonnement non trouvé'], 404);
        }

        return response()->json(['data' => $abonnement]);
    }
}
