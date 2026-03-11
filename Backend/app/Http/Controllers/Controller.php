<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'EVADIA API',
    description: 'API de la plateforme de reservation EVADIA',
    contact: new OA\Contact(name: 'EVADIA', email: 'contact@evadia.com')
)]
#[OA\Server(url: 'http://localhost:8000', description: 'Serveur local')]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'Sanctum Token',
    description: 'Token obtenu via /api/auth/login ou /api/auth/register'
)]
abstract class Controller
{
    //
}
