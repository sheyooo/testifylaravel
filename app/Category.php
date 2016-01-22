<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{

  protected $hidden = ['created_at', 'updated_at'];

 public function posts(){
  return $this->belongsToMany('\App\Post');
 }

}
