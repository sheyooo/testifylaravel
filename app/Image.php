<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    //
    public function post(){
      return $this->belongsToMany('\App\Post');
    }

    public function user(){
      return $this->belongsTo('\App\User');
    }
}
