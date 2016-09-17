<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    //
    protected $hidden = ['user_id'];

    protected $casts = ['anonymous' => 'boolean'];

    protected $appends = ['favorited', 'tapped_into', 'amen', 'prayer', 'amens_count', 'favorites_count', 'taps_count', 'comments_count'];

    public function getTextAttribute(){
      $emojiClient = new \Emojione\Client(new \Emojione\Ruleset());  
      return $emojiClient->shortnameToUnicode($this->text);
    }

    public function getFavoritedAttribute(){
     try{
      $user = \JWTAuth::parseToken()->toUser();
      if($this->favorites()->where('user_id', $user->id)->count()){
       return true;
      }else{
       return false;
      }
     }catch(\Exception $e){
      return false;
     }
    }

    public function getTappedIntoAttribute(){
     try{
      $user = \JWTAuth::parseToken()->toUser();
      if($this->taps()->where('user_id', $user->id)->count()){
       return true;
      }else{
       return false;
      }
     }catch(\Exception $e){
      return false;
     }
    }

    public function getAmenAttribute(){
     try{
      $user = \JWTAuth::parseToken()->toUser();
      if($this->amens()->where('user_id', $user->id)->count()){
       return true;
      }else{
       return false;
      }
     }catch(\Exception $e){
      return false;
     }
    }

    public function getPrayerAttribute(){
     if($this->categories->where('type', 'prayer')->count()){
      return true;
     }else{
      return false;
     }
    }

    public function getAmensCountAttribute(){
     return $this->amens()->count();
    }

    public function getFavoritesCountAttribute(){
     return $this->favorites()->count();
    }

    public function getTapsCountAttribute(){
     return $this->taps()->count();
    }

    public function getCommentsCountAttribute(){
     return $this->comments()->count();
    }

    public function user(){
        return $this->belongsTo('\App\User');
    }

    public function categories(){
     return $this->belongsToMany('\App\Category');
    }

    public function images(){
      return $this->belongsToMany('\App\Image');
    }

    public function comments(){
     return $this->hasMany('\App\Comment');
    }

    public function favorites(){
     return $this->hasMany('\App\Favorite');
    }

    public function taps(){
     return $this->hasMany('\App\Tap');
    }

    public function amens(){
     return $this->hasMany('\App\Amen');
    }

    public function postActivities(){
      return $this->hasMany('\App\PostActivity');
    }

    public function postActivity(){
      return $this->morphOne('\App\PostActivity', 'action');
    }
}
