<?php

namespace App\Traits;

use App\Models\LogAdmin;

trait LogsAdminAction
{
    /**
     * Log an admin action.
     */
    protected function logAction(string $action, ?string $details = null): void
    {
        LogAdmin::create([
            'admin_id' => auth()->id(),
            'action' => $action,
            'details' => $details,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
