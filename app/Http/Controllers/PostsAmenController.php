<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class PostsAmenController extends Controller
{
 /**
  * Store a newly created resource in storage.
  *
  * @param  \Illuminate\Http\Request  $request
  * @return \Illuminate\Http\Response
  */
 public function store($id, Request $request)
 {
     //
     $post = \App\Post::findorFail($id);
     $action = new \App\Amen;
     $activity = new \App\PostActivity;
     $user = \JWTAuth::parseToken()->toUser();
     $action->user_id =$user->id;
     $action = $post->amens()->save($action);
     $activity->action()->associate($action);
     $activity->user()->associate($user);
     $activity->post()->associate($post);
     $activity->save();

     return \Response::make(['status' => true, 'count' => $post->amens()->count()]);
 }


 /**
  * Remove the specified resource from storage.
  *
  * @param  int  $id of the Post
  * @return \Illuminate\Http\Response
  */
 public function destroy($id)
 {
     //
     $uid = \JWTAuth::parseToken()->toUser()->id;
     $post = \App\Post::findorFail($id);
     $action = $post->amens->where('user_id', $uid)->first();
     $action->postActivity()->delete();
     $action->delete();

     return \Response::make(['status' => false, 'count' => $post->amens()->count()]);
 }
}
