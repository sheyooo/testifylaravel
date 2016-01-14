<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
  /**
   * The database table used by the model.
   *
   * @var string
   */
  protected $table = 'users';

  /**
   * The attributes that are mass assignable.
   *
   * @var array
   */
  protected $fillable = ['hash_id', 'username', 'first_name', 'last_name', 'email', 'sex', 'avatar', 'password'];

  /**
   * The attributes excluded from the model's JSON form.
   *
   * @var array
   */
  protected $hidden = ['password', 'remember_token'];

  protected $appends = ['name'];

  public function getNameAttribute(){
   return $this->first_name . " " . $this->last_name;
  }

  public function getAvatarAttribute($value){
   if($value){
    return $value;
   }else{
    return 'img/guest.png';
   }

  }

  public function profile(){

    return $this->hasOne('\App\Profile');
  }

  public function social_profile(){

    return $this->hasOne('\App\SocialUser');
  }

  public function posts(){

    return $this->hasMany('\App\Post');
  }

  public function images(){
    return $this->hasMany('\App\Image');
  }

  public function favorites(){

    return $this->hasManyThrough('\App\Post', '\App\Favorite', 'post_id', 'user_id');
  }

  public function postActivities(){
    return $this->hasMany('\App\PostActivity');
  }

}
