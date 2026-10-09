<?php

namespace App\Jobs;

use App\Mail\HotelAdminCredentials;
use App\Models\Hotel;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendHotelAdminCredentials implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public User $adminUser,
        public Hotel $hotel,
    ) {
    }

    public function handle(): void
    {
        Mail::to($this->adminUser->email)
            ->send(new HotelAdminCredentials($this->adminUser, $this->hotel));
    }
}
