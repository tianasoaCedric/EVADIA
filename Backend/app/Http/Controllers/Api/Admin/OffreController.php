<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Offre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class OffreController extends Controller
{
    #[OA\Get(
        path: '/api/admin/offers',
        summary: 'Liste des offres',
        description: 'Retourne la liste paginée des offres et promotions.',
        tags: ['Admin - Offres'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'statut', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['active', 'inactive', 'expiree'])),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste des offres',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'titre', type: 'string', example: 'Promo été -20%'),
                            new OA\Property(property: 'description', type: 'string', example: 'Réduction sur toutes les chambres'),
                            new OA\Property(property: 'code_promo', type: 'string', example: 'ETE2026'),
                            new OA\Property(property: 'date_debut', type: 'string', format: 'date', example: '2026-06-01'),
                            new OA\Property(property: 'date_fin', type: 'string', format: 'date', example: '2026-08-31'),
                            new OA\Property(property: 'statut', type: 'string', example: 'active'),
                            new OA\Property(property: 'hotel_id', type: 'integer', nullable: true, example: null),
                        ])),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = Offre::with(['hotel', 'avantages']);

        if ($statut = $request->input('statut')) {
            $query->where('statut', $statut);
        }

        return response()->json($query->latest('created_at')->paginate(15));
    }

    #[OA\Post(
        path: '/api/admin/offers',
        summary: 'Créer une offre',
        description: 'Crée une nouvelle offre globale ou liée à un hôtel.',
        tags: ['Admin - Offres'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['titre', 'date_debut', 'date_fin'],
                properties: [
                    new OA\Property(property: 'titre', type: 'string', example: 'Promo été -20%'),
                    new OA\Property(property: 'description', type: 'string', example: 'Réduction de 20% sur les chambres doubles'),
                    new OA\Property(property: 'date_debut', type: 'string', format: 'date', example: '2026-06-01'),
                    new OA\Property(property: 'date_fin', type: 'string', format: 'date', example: '2026-08-31'),
                    new OA\Property(property: 'code_promo', type: 'string', example: 'ETE2026'),
                    new OA\Property(property: 'hotel_id', type: 'integer', nullable: true, example: null),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Offre créée', content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Offre créée avec succès'),
                    new OA\Property(property: 'offre', type: 'object'),
                ]
            )),
            new OA\Response(response: 422, description: 'Erreur de validation'),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titre'      => 'required|string|max:255',
            'description'=> 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after:date_debut',
            'code_promo' => 'nullable|string|max:50|unique:offres,code_promo',
            'hotel_id'   => 'nullable|exists:hotels,id',
            'remise_pct' => 'nullable|integer|min:0|max:100',
            'conditions' => 'nullable|array',
            'conditions.*' => 'string|max:500',
        ]);

        $offre = Offre::create([
            ...$validated,
            'statut'     => 'active',
            'created_by' => auth()->id(),
        ]);

        return response()->json(['message' => 'Offre créée avec succès', 'offre' => $offre], 201);
    }

    #[OA\Patch(
        path: '/api/admin/offers/{id}/toggle',
        summary: 'Activer/désactiver une offre',
        tags: ['Admin - Offres'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Statut modifié', content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Offre désactivée.'),
                    new OA\Property(property: 'statut', type: 'string', example: 'inactive'),
                ]
            )),
            new OA\Response(response: 404, description: 'Offre non trouvée'),
        ]
    )]
    public function toggle(int $id): JsonResponse
    {
        $offre = Offre::findOrFail($id);
        $offre->update([
            'statut' => $offre->statut === 'active' ? 'inactive' : 'active',
        ]);

        return response()->json([
            'message' => $offre->statut === 'active' ? 'Offre activée.' : 'Offre désactivée.',
            'statut' => $offre->statut,
        ]);
    }
}
