<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Amen extends Model
{
    //
    public function post(){

     return $this->belongsTo('\App\Post');
    }

    public function postActivity(){
      return $this->morphOne('\App\PostActivity', 'action');
    }

    public function user(){
     return $this->belongsTo('\App\User');
    }
}
