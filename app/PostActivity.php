<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PostActivity extends Model
{
    //

    public function user(){
      return $this->belongsTo('\App\User');
    }

    public function action(){
      return $this->morphTo();
    }

    public function post(){
      return $this->belongsTo('\App\Post');
    }
}
