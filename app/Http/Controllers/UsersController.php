<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Validator;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Vinkla\Pusher\PusherManager;


class UsersController extends Controller
{
  private static $hashid_salt = 'user';

  protected $pusher;

    public function __construct(PusherManager $pusher)
    {
        $this->pusher = $pusher;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        try{
         $user = \JWTAuth::parseToken()->toUser();
         $user['profile'] = $user->profile();
         return $user;

        }catch(\Exception $e){
         return \Response::make(['error' => 'No profile found'], 404);
        }
    }



    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
        $details = $request->all();
        $validator = Validator::make($details, [
          'first_name' => 'required',
          'last_name' => 'required',
        ]);

        if($validator->fails()){
          return ['status' => 'Form not complete'];
        }else{
          $input = $details;
          if($request->has('password')){
            $p = $request->input('password');
            $input['password'] = \Hash::make($p);
          }
          try{
            $u = \App\User::create($input);
            $hash = Tools::generateHashID(self::$hashid_salt, $u->id);
            $u->hash_id = $hash;
            $u->save();
            return $u;
          }catch(\Exception $e){
            return \Response::make(['error' => 'Duplicate email or username'], 409);
          }
        };
    }

    /**
     * Display the specified resource.
     *
     * @param  mixed  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $user = $this->findUser($id);

        if($user){

         if($request->profile){
           $user->profile;
         }

         return $user;
        }else{
         return \Response::make(['error' => 'User not found'], 404);
        }


    }

    public function findUser($id){
      //ID can be the username, hash_id or databse id of the user;
      $user = null;
      try{
        $uname = str_replace('@', '', $id);
        $user = \App\User::where('username', $uname)->firstOrFail();
      }catch(\Exception $e){
        try{
          $id = Tools::decodeHashID(self::$hashid_salt, $id);
          $user = \App\User::findOrFail($id);
        }catch(\Exception $e){
          $user = \App\User::find($id);
        }
      }

      return $user;
    }

    public function getProfile(Request $request, $id){
      try{
        $user = $this->findUser($id);
        $user->profile;
        return $user;
      }catch(\Exception $e){
        return \Response::make(['error' => 'User not found'], 404);

      }
    }

    public function updateProfile(Request $request, $id){
      try{
        $user = \JWTAuth::parseToken()->toUser();
      }catch(Exception $e){

      }

      if(!$user->profile){
        $user->profile()->save(new \App\Profile);
        $user->save();
      }

      if($request->preference_messaging){
        $user->profile->preference_messaging = $request->preference_messaging;
      }

      if($request->last_name){
        $user->last_name = $request->last_name;
        $user->first_name = $request->first_name;
        if($request->username){
          $user->username = $request->username;
        }

        $user->save();
      }

      if($request->location){
        $user->location = $request->location;
        $user->profile->favorite_book = $request->favorite_book;
        $user->profile->favorite_verse = $request->favorite_verse;
        $user->profile->favorite_parable = $request->favorite_parable;
        $user->profile->denomination = $request->denomination;

        $user->save();
        $user->profile->save();
      }



    }

    public function getFavorites(Request $request, $id){

      try{
        $user = $this->findUser($id);
        $posts = \App\Post::whereHas('favorites', function($query) use($user){
          return $query->where('user_id', $user->id);
        });// $user->favorites()->orderBy('created_at', 'desc')->get();
        $posts = Tools::paginateByID($request, $posts);
        $posts = $posts->get();
        //return ($fav_posts);
        $pc = new PostsController();
        $posts = $pc->formatPostsIfAnon($posts);

        //dd($favorites);
        return $posts;
      }catch( Exception $e){
        return \Response::make(['error' => 'User not found'], 404);
      }

    }

    public function getTaps(Request $request, $id){

      try{
        $user = $this->findUser($id);
        $posts = \App\Post::whereHas('taps', function($query) use($user){
          return $query->where('user_id', $user->id);
        });// $user->favorites()->orderBy('created_at', 'desc')->get();
        $posts = Tools::paginateByID($request, $posts);
        $posts = $posts->get();
        //return ($fav_posts);
        $pc = new PostsController();
        $posts = $pc->formatPostsIfAnon($posts);

        //dd($favorites);
        return $posts;
      }catch( Exception $e){
        return \Response::make(['error' => 'User not found'], 404);
      }

    }

    public function getActivities(Request $request, $id){
      try{
        $jwtUser = \JWTAuth::parseToken()->toUser();
      }catch(\Exception $e){
        $jwtUser = null;
      };



      try{
        $user = $this->findUser($id);
        $posts = \App\Post::whereHas('postActivities', function($query) use($user){
          return $query->where('user_id', $user->id);
        });

        $posts = $posts->orWhereHas('user', function($query) use($user){
          return $query->where('user_id', $user->id);
        })->where([
          ['user_id', $user->id]
        ]);

        if($jwtUser){
          if($jwtUser->id == $user->id){
            //Do nothing so anonymous posts of the jwtUser will be sent
          }else{
            $posts = $posts->where('anonymous', '0');
          }
        }else {
          $posts = $posts->where('anonymous', '0');
        }

        $posts = $posts->orderBy('created_at', 'desc');
        $posts = Tools::paginateByID($request, $posts);
        $posts = $posts->get();

        $posts = $posts->each(function ($post, $key) use($user) {
          $user_ref = [
            'name' => $user->name,
            'hash_id' => $user->hash_id
          ];
          $post['user_ref'] = $user_ref;
          $post['user_ref_activities'] = $post->postActivities()->whereHas('user', function($query) use($user){
            return $query->where('user_id', $user->id);
          })->get();

        });

        $pc = new PostsController();
        $posts = $pc->formatPostsIfAnon($posts);


        return $posts;
      }catch( Exception $e){
        return \Response::make(['error' => 'User not found'], 404);
      }

    }

    public function setAvatar(Request $request, $id){
      $user = null;
      try{
        $user = \JWTAuth::parseToken()->toUser();
      }catch(\Exception $e){
        //$user = \App\User::find(1);
        return \Response::make('', 401);
      }

      if($img = ImagesController::saveImage($request->file, $user, 'avatars/')){
        $user->avatar = $img->url;
        $user->save();
        return \Response::make($img, 201);
      }else{
        return \Response::make(['status' => 'Error'], 400);
      }
    }

    public function changePassword(Request $request){
      $user = null;
      try{
        $user = \JWTAuth::parseToken()->toUser();
      }catch(\Exception $e){
        //$user = \App\User::find(1);
        return \Response::make('', 401);
      }

      if(\Hash::check($request->oldPassword, $user->password) || $user->password == null){

        $v = Validator::make($request->all(), [
          'newPassword' => 'min:6'
        ]);
        if($v->fails()){
            return \Response::make(['status' => 'New password not up to 6 characters'], 400);
        }else{
          $user->password = \Hash::make($request->newPassword);
          $user->save();
          return \Response::make(['status' => 'Successfully changed password'], 202);
        }
      }else{
        return \Response::make(['status' => 'Old password doesn\'t match'], 400);
      }
    }

    public function sendMessage(Request $request, $id){
      try{
        $user = \JWTAuth::parseToken()->toUser();
      }catch(\Exception $e){
        return \Response::make(['status' => 'Unauthorized'], 401);
      }

      $to_user = $this->findUser($id);
      if(!$to_user)
        return \Response::make(['status' => 'User not found'], 404);

      try{
        $chat = \App\Chat::whereHas('subs', function ($query) use($user){
            $query->where('user_id', $user->id);
        })->whereHas('subs', function ($query) use($to_user){
            $query->where('user_id', $to_user->id);
        })->firstOrFail();

      }catch(\Exception $e){
        $chat = new \App\Chat;
        $sub = new \App\ChatSub;
        $sub1 = new \App\ChatSub;

        $chat->save();

        $sub->user()->associate($user);
        $sub1->user()->associate($to_user);

        $sub->chat()->associate($chat);
        $sub1->chat()->associate($chat);

        $sub->save();
        $sub1->save();
      }



      if(true){
        $message = new \App\ChatMessage;
        $message->text = $request->message;
        $chat->last_message = $request->message;
        $message->user()->associate($user);
        //$chat->messages()->save($message);
        //$chat->save();


        $this->pusher->trigger('test_channel', 'my_event', ['message' => $request->message]);
        $this->pusher->trigger('private-notifications-' . $to_user->hash_id, 'new_message', [
          //'user' => $user,
          'message' => $message
        ]);
        \PushNotification::app('appNameIOS')
                ->to($deviceToken)
                ->send('Hello World, i`m a push message');

        return \Response::make($message, 201);
      }



    }

    public function getChatMessages($user_id){
      try{
        $user = \JWTAuth::parseToken()->toUser();
      }catch(\Exception $e){
        return \Response::make(['status' => 'Unauthorized'], 401);
      }

      $to_user = $this->findUser($user_id);
      if(!$to_user || $to_user->id == $user->id)
        return \Response::make(['status' => 'User not found'], 404);


      try{
        $chat = \App\Chat::whereHas('subs', function ($query) use($user){
            $query->where('user_id', $user->id);
        })->whereHas('subs', function ($query) use($to_user){
            $query->where('user_id', $to_user->id);
        })->with('messages.user')->firstOrFail();

        return $chat->messages;

      }catch(\Exception $e){
        return [];
      }

    }

    public function getActiveChats(){
      try{
        $user = \JWTAuth::parseToken()->toUser();
      }catch(\Exception $e){
        return \Response::make(['status' => 'Not Authorized'], 401);
      }

      $chats = \App\Chat::whereHas('subs', function ($query) use($user){
          $query->where('user_id', $user->id);
      })->with('users')->get();



      return $chats;
    }


    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
