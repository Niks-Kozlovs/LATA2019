<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class StopTimes extends Model
{
    public function stops() {
        return $this->hasMany(Stop::class, 'stop_id', 'stop_id');
    }

    public function trip() {
        return $this->belongsTo(Trips::class);
    }
}
