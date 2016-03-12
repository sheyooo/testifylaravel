<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Friend extends Model
{
    //
    public function toUser(){
      return $this->hasOne('\App\User', 'id', 'to');
    }

    public function fromUser(){
      return $this->hasOne('\App\User', 'id', 'from');
    }
}
