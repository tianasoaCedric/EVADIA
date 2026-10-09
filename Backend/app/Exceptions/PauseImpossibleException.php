<?php

namespace App\Exceptions;

use DomainException;
use Illuminate\Support\Collection;

/**
 * Pause refusée. $reservations contient les réservations qui la bloquent
 * (vide si le refus a une autre cause), pour les montrer à l'admin.
 */
class PauseImpossibleException extends DomainException
{
    public function __construct(string $message, public readonly Collection $reservations = new Collection())
    {
        parent::__construct($message);
    }
}
