<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Validator;
use App\Http\Controllers\Controller;
use Vinkla\Pusher\Facades\Pusher;

class UsersController extends Controller
{
    private static $hashIDSalt = 'user';
    private $user = null;

    /**
     * Try to instantiate a User model as a property from the Bearer Token
     */
    public function __construct()
    {
        try{
            $this->user = \JWTAuth::parseToken()->toUser();
        }catch(\Exception $e){
            $this->user = null;
        }
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //This is supposed to list users leave it this way for now
        if (is_null($this->user)){
            return \Response::make(['error' => 'No profile found'], 404);
        }

        $this->user->load('profile');

        return $this->user;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     *
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

        if ($validator->fails()) {
            return ['status' => 'Form not complete'];
        } else {
            $input = $details;
            if ($request->has('password')) {
                $password = $request->input('password');
                $input['password'] = \Hash::make($password);
            }
            try {
                $user = \App\User::create($input);
                $hash = Tools::generateHashID(self::$hashIDSalt, $user->id);
                $user->hash_id = $hash;
                $user->save();

                return $user;
            } catch (\Exception $exception) {
                return \Response::make(['error' => 'Duplicate email or username'], 409);
            }
        };
    }

    /**
     * Display the specified resource.
     *
     * @param mixed $id
     *
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $userID = null)
    {
        if (is_null($userID)){
            $user = $this->user;
        }else{
            $user = $this->findUser($userID);
        }

        if (is_null($user)){
            return \Response::make(['error' => 'User not found'], 404);
        }

        if ($request->profile) {
            $user->load('profile');
        }

        if ( ! is_null($this->user) && $this->user->id != $user->id && $request->relationship){
            $relationship = FriendshipController::getRelationship($user, $this->user);
            $user['relationship'] = $relationship;
        }

        return $user;
    }

    public function findUser($userID)
    {
        //$userID can be the username, hash_id or databse id of the user;
      $user = null;
        try {
            $uname = str_replace('@', '', $userID);
            $user = \App\User::where('username', $uname)->firstOrFail();
        } catch (\Exception $exception) {
            try {
                $userID = Tools::decodeHashID(self::$hashIDSalt, $userID);
                $user = \App\User::findOrFail($userID);
            } catch (\Exception $exception) {
                $user = \App\User::find($userID);
            }
        }

        return $user;
    }

    public function updateProfile(Request $request)
    {
        if (is_null($this->user)){
            return \Response::make('', 401);
        }

        if (is_null($this->user->profile)) {
            $this->user->profile()->save(new \App\Profile());
            $this->user->save();
        }

        if ($request->preference_messaging) {
            $this->user->profile->preference_messaging = $request->preference_messaging;
        }

        if ($request->last_name) {
            $this->user->last_name = $request->last_name;
            $this->user->first_name = $request->first_name;
            if ($request->username) {
                $this->user->username = $request->username;
            }

            $this->user->save();
        }

        if ($request->location) {
            $this->user->location = $request->location;
            $this->user->profile->favorite_book = $request->favorite_book;
            $this->user->profile->favorite_verse = $request->favorite_verse;
            $this->user->profile->favorite_parable = $request->favorite_parable;
            $this->user->profile->denomination = $request->denomination;

            $this->user->save();
            $this->user->profile->save();
        }
    }

    public function getFavorites(Request $request, $userID)
    {
        try {
            $user = $this->findUser($userID);
            $posts = \App\Post::whereHas('favorites', function ($query) use ($user) {
              return $query->where('user_id', $user->id);
            });
            // $user->favorites()->orderBy('created_at', 'desc')->get();
            $posts = Tools::paginateByID($request, $posts);
            $posts = $posts->get();
            $postsCtrl = new PostsController();
            $posts = $postsCtrl->formatPostsIfAnon($posts);

            return $posts;
        } catch (Exception $exception) {
            return \Response::make(['error' => 'User not found'], 404);
        }
    }

    public function getTaps(Request $request, $userID)
    {
        try {
            $user = $this->findUser($userID);
            $posts = \App\Post::whereHas('taps', function ($query) use ($user) {
              return $query->where('user_id', $user->id);
            });// $user->favorites()->orderBy('created_at', 'desc')->get();
            $posts = Tools::paginateByID($request, $posts);
            $posts = $posts->get();
            //return ($fav_posts);
            $postsCtrl = new PostsController();
            $posts = $postsCtrl->formatPostsIfAnon($posts);

            //dd($favorites);
            return $posts;
        } catch (Exception $exception) {
            return \Response::make(['error' => 'User not found'], 404);
        }
    }

    public function getActivities(Request $request, $userID)
    {
        try {
            $jwtUser = \JWTAuth::parseToken()->toUser();
        } catch (\Exception $exception) {
            $jwtUser = null;
        };

        try {
            $user = $this->findUser($userID);
            $posts = \App\Post::whereHas('postActivities', function ($query) use ($user) {
              return $query->where('user_id', $user->id);
                            //->where('action_type', '!=', 'App\\Post');
            });

            $posts = $posts->orWhereHas('user', function ($query) use ($user) {
          return $query->where('user_id', $user->id);
        })->where([
          ['user_id', $user->id],
        ]);

            if ($jwtUser) {
                if ($jwtUser->id == $user->id) {
                    //Do nothing so anonymous posts of the jwtUser will be sent
                } else {
                    $posts = $posts->where('anonymous', '0');
                }
            } else {
                $posts = $posts->where('anonymous', '0');
            }

            $posts = $posts->orderBy('created_at', 'desc');
            $posts = Tools::paginateByID($request, $posts);
            $posts = $posts->get();

            $posts = $posts->each(function ($post, $key) use ($user) {
              $userRef = [
                'name' => $user->name,
                'hash_id' => $user->hash_id,
              ];
              $post['user_ref'] = $userRef;
              $post['user_ref_activities'] = $post->postActivities()->whereHas('user', function ($query) use ($user) {
                  return $query->where('user_id', $user->id);
              })->get();

            });

            $postsCtrl = new PostsController();
            $posts = $postsCtrl->formatPostsIfAnon($posts);

            return $posts;
        } catch (Exception $exception) {
            return \Response::make(['error' => 'User not found'], 404);
        }
    }

    public function sendFriendRequest(Request $request)
    {
        if (is_null($this->user)){
            return \Response::make(['status' => 'Unauthorized'], 401);
        }

        $toUser = $this->findUser($request->user_id);

        if ($toUser) {
            $friendRequest = new \App\Friend();
            $friendRequest->from = $this->user->id;
            $friendRequest->to = $toUser->id;
            $friendRequest->status = 1;
            $friendRequest->save();

            return \Response::make($friendRequest, 200);
        } else {
            return \Response::make(['status' => 'User not found'], 400);
        }
    }

    public function setAvatar(Request $request)
    {
        if (is_null($this->user)){
            return \Response::make('', 401);
        }

        $img = ImagesController::saveImage($request->file,
                                            $this->user, 'avatars/');
        if ($img) {
            $this->user->avatar = $img->url;
            $this->user->save();

            return \Response::make($img, 201);
        } else {
            return \Response::make(['status' => 'Error'], 400);
        }
    }

    public function changePassword(Request $request)
    {
        if (is_null($this->user)){
            return \Response::make('', 401);
        }

        if (\Hash::check($request->oldPassword, $this->user->password) || $this->user->password == null) {
            $validator = Validator::make($request->all(), [
              'newPassword' => 'min:6',
            ]);
            if ($validator->fails()) {
                return \Response::make(['status' => 'New password not up to 6 characters'], 400);
            } else {
                $this->user->password = \Hash::make($request->newPassword);
                $this->user->save();

                return \Response::make(['status' => 'Successfully changed password'], 202);
            }
        } else {
            return \Response::make(['status' => 'Old password doesn\'t match'], 400);
        }
    }

    public function sendMessage(Request $request, $userID)
    {
        if (is_null($this->user)){
          return \Response::make(['status' => 'Unauthorized'], 401);
        }

        $toUser = $this->findUser($userID);
        if (is_null($toUser)) {
            return \Response::make(['status' => 'User not found'], 404);
        }

        $chat = $this->getChat($toUser);

        if (true) {
            $message = new \App\ChatMessage();
            $message->text = $request->message;
            $chat->last_message = $request->message;
            $message->user()->associate($this->user);
            $chat->messages()->save($message);
            $chat->save();

            //Pusher::trigger('general', 'news_feed', ['message' => $request->message]);
            Pusher::trigger('private-message-'.$chat->id, 'new_message', $message, $request->socket_id);
            Pusher::trigger('private-notifications-'.$toUser->hash_id, 'new_message', $this->user);

            if (count($toUser->gcmIds)) {
                $deviceToken = $toUser->gcmIds;
                \PushNotification::app('appNameAndroid')
                  ->to($deviceToken)
                  ->send('Hello World, i`m a push message');
            };

            return \Response::make($message, 201);
        }
    }

    public function getChatMessages(Request $request, $userID)
    {
        if(is_null($this->user)){
            return \Response::make(['status' => 'Unauthorized'], 401);
        }

        $toUser = $this->findUser($userID);
        if (is_null($toUser) || $toUser->id == $this->user->id) {
            return \Response::make(['status' => 'User not found'], 404);
        }

        $chat = $this->getChat($toUser);
        $sub = $chat->subs()->where('user_id', $this->user->id)->first();
        //update for notification purposes
        $sub->last_seen = \Carbon\Carbon::now();
        $sub->save();

        $messages = Tools::paginateByID(
                            $request, $chat->messages()->with('user')
                                            ->orderBy('created_at', 'desc')
                                        )->get();
        //return $messages;
        return \Response::make($messages->reverse()->values())
                        ->header('X-CHAT-ID', $chat->id);
    }

    public function getActiveChats()
    {
        if(is_null($this->user)){
            return \Response::make(['status' => 'Not Authorized'], 401);
        }

        $user = $this->user;
        $chats = \App\Chat::whereHas('subs', function ($query) use ($user) {
          $query->where('user_id', $this->user->id);
        })->has('messages')->with('subs.user')->get();

        return $chats;
    }

    public function getUnreadMessages()
    {
        if(is_null($this->user)){
            return \Response::make(['status' => 'Unauthorized'], 401);
        }

        $unread = \App\Chat::leftJoin('chat_subs', function ($join) {
                        $join->on('chats.id', '=', 'chat_subs.chat_id')
                            ->on('chats.updated_at', '>', 'chat_subs.last_seen');
                        })
                        ->leftJoin('users', 'users.id', '=', 'chat_subs.user_id')
                        ->where('users.id', $this->user->id)
                        ->select('chats.*')
                        ->get();

        return $unread;
    }

    public function setChatRead($userID)
    {
        if(is_null($this->user)){
            return \Response::make(['status' => 'Unauthorized'], 401);
        }

        $chat = \App\Chat::find($userID);
        $subs = $chat->subs()->where('user_id', $this->user->id)->first();

        if ($subs) {
            $subs->last_seen = \Carbon\Carbon::now();
            $subs->save();
        }
    }

    public function getChat($toUser)
    {
        if(is_null($this->user)){
            return \Response::make(['error' => 'Unauthorized'], 401);
        }

        $user = $this->user;
        try {
            $chat = \App\Chat::whereHas('subs', function ($query) use ($user) {
              $query->where('user_id', $this->user->id);
          })->whereHas('subs', function ($query) use ($toUser) {
              $query->where('user_id', $toUser->id);
          })->firstOrFail();
        } catch (\Exception $exception) {
            $chat = new \App\Chat();
            $sub = new \App\ChatSub();
            $sub1 = new \App\ChatSub();

            $chat->save();

            $sub->user()->associate($this->user);
            $sub1->user()->associate($toUser);

            $sub->chat()->associate($chat);
            $sub1->chat()->associate($chat);

            $sub->save();
            $sub1->save();
        }

        return $chat;
    }

    public function getFriends()
    {
        if(is_null($this->user)){
            return \Response::make(['error' => 'Unauthorized'], 401);
        }

        return FriendshipController::getFriends($this->user);
    }

    public function getFriendRequests()
    {
        if(is_null($this->user)){
            return \Response::make(['error' => 'Unauthorized'], 401);
        }

        $request = Request::capture();

        if ($this->user) {
            $reqs = \App\Friend::where('to', $this->user->id)->where('status', 1);
            if ($request->profile) {
                $reqs = $reqs->with('fromUser')->with('toUser');
            }

            return $reqs->get();
        }
    }

    public function acceptRequest()
    {
        if(is_null($this->user)){
            return \Response::make(['error' => 'Unauthorized'], 401);
        }

        $request = Request::capture();

        if ($request->user_id) {
          $req = \App\Friend::where('to', $this->user->id)
                            ->where('from', $request->user_id)
                            ->first();

          $req->status = 2;
          $req->save();

          return \Response::make($req, 200);
        }
    }

    public function deleteRelationship($userID)
    {
        if(is_null($this->user)){
            return \Response::make(['error' => 'Unauthorized'], 401);
        }

        $who = \App\User::find($userID);

        if ($who) {
          $req = FriendshipController::getRelationship($who, $this->user);
          $req->delete();

          return \Response::make('', 200);
        }
    }

    public function update(Request $request, $userID)
    {
    }

    public function destroy($userID)
    {
        //
    }

}
