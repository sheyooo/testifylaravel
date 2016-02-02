<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    //
    public function users(){
      return $this->hasManyThrough('\App\User', '\App\ChatSub', 'chat_id', 'id');
    }

    public function subs(){
      return $this->hasMany('\App\ChatSub');
    }

    public function messages(){
      return $this->hasMany('\App\ChatMessage');
    }
}
