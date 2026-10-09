<?php

namespace App\Console\Commands;

use App\Services\AbonnementService;
use App\Services\PauseAbonnementService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TraiterEcheancesAbonnements extends Command
{
    protected $signature = 'abonnements:echeances';

    protected $description = 'Pauses (début, rappel, reprise), rappels J-7 / J-1, passage en retard et suspension des hôtels impayés';

    public function handle(PauseAbonnementService $pauses, AbonnementService $service): int
    {
        // Les pauses d'abord : une reprise du jour remet l'abonnement dans le cycle normal.
        $statsPauses = $pauses->traiterPauses();
        $stats = $service->traiterEcheances();

        $this->info(sprintf(
            'Pauses : %d début(s), %d rappel(s), %d reprise(s). Échéances : %d rappel(s), %d passage(s) en retard, %d suspension(s).',
            $statsPauses['debuts'],
            $statsPauses['rappels'],
            $statsPauses['reprises'],
            $stats['rappels'],
            $stats['retards'],
            $stats['suspensions'],
        ));
        Log::info('Échéances abonnements traitées', ['pauses' => $statsPauses, 'echeances' => $stats]);

        return self::SUCCESS;
    }
}
