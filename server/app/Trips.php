<?php

namespace App;


use Illuminate\Database\Eloquent\Model;

class Trips extends Model
{
    public function route() {
        return $this->hasMany(StopTimes::class);
    }
}
