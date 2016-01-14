<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SocialUser extends Model
{
    //
    public function user(){
     return $this->belongsTo('\App\User');
    }
}
