<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypesAvantage extends Model
{
    protected $table = 'types_avantages';
    public $timestamps = false;

    protected $fillable = ['code', 'nom', 'description'];
}
