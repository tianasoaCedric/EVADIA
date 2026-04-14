<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        channels: __DIR__.'/../routes/channels.php',
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);

        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'level' => \App\Http\Middleware\CheckRoleLevel::class,
            'password.change' => \App\Http\Middleware\ForcePasswordChange::class,
        ]);

        $middleware->redirectGuestsTo(fn ($request) => match(true) {
            str_starts_with($request->path(), 'api/') => null,
            str_starts_with($request->path(), 'hotel') => '/hotel/login',
            default => '/',
        });
        $middleware->redirectUsersTo('/admin/dashboard');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
