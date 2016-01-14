<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
 protected $appends = ['count'];

 public function getCountAttribute(){
  return $this->posts()->count();
 }

 public function posts(){
  return $this->belongsToMany('\App\Post');
 }

}
