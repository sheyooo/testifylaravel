<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Validator;
use App\Http\Controllers\Controller;
use Vinkla\Pusher\Facades\Pusher;

class UsersController extends Controller
{
    private static $hashIDSalt = 'user';

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        try {
            $user = \JWTAuth::parseToken()->toUser();
            $user['profile'] = $user->profile();

            return $user;
        } catch (\Exception $exception) {
            return \Response::make(['error' => 'No profile found'], 404);
        }
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
    public function show(Request $request, $userID)
    {
        $user = $this->findUser($userID);

        if ($user) {
            if ($request->profile) {
                $user->profile;
            }

            return $user;
        } else {
            return \Response::make(['error' => 'User not found'], 404);
        }
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

    public function getProfile(Request $request, $userID)
    {
        try {
            $user = $this->findUser($userID);
            $user->profile;

            return $user;
        } catch (\Exception $exception) {
            return \Response::make(['error' => 'User not found'], 404);
        }
    }

    public function updateProfile(Request $request, $userID)
    {
        try {
            $user = \JWTAuth::parseToken()->toUser();
        } catch (Exception $exception) {
        }

        if (!$user->profile) {
            $user->profile()->save(new \App\Profile());
            $user->save();
        }

        if ($request->preference_messaging) {
            $user->profile->preference_messaging = $request->preference_messaging;
        }

        if ($request->last_name) {
            $user->last_name = $request->last_name;
            $user->first_name = $request->first_name;
            if ($request->username) {
                $user->username = $request->username;
            }

            $user->save();
        }

        if ($request->location) {
            $user->location = $request->location;
            $user->profile->favorite_book = $request->favorite_book;
            $user->profile->favorite_verse = $request->favorite_verse;
            $user->profile->favorite_parable = $request->favorite_parable;
            $user->profile->denomination = $request->denomination;

            $user->save();
            $user->profile->save();
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
        try {
            $user = \JWTAuth::parseToken()->toUser();
        } catch (Exception $exception) {
            $user = null;
        }

        $toUser = $this->findUser($request->user_id);

        if ($user && $toUser) {
            $request = new \App\Friend();
            $request->from = $user->id;
            $request->to = $toUser->id;
            $request->save();
        } else {
            return \Response::make(['status' => 'Fatal error'], 400);
        }
    }

    public function setAvatar(Request $request, $userID)
    {
        $user = null;
        try {
            $user = \JWTAuth::parseToken()->toUser();
        } catch (\Exception $exception) {
            //$user = \App\User::find(1);
        return \Response::make('', 401);
        }

        if ($img = ImagesController::saveImage($request->file, $user, 'avatars/')) {
            $user->avatar = $img->url;
            $user->save();

            return \Response::make($img, 201);
        } else {
            return \Response::make(['status' => 'Error'], 400);
        }
    }

    public function changePassword(Request $request)
    {
        $user = null;
        try {
            $user = \JWTAuth::parseToken()->toUser();
        } catch (\Exception $exception) {
            //$user = \App\User::find(1);
        return \Response::make('', 401);
        }

        if (\Hash::check($request->oldPassword, $user->password) || $user->password == null) {
            $validator = Validator::make($request->all(), [
              'newPassword' => 'min:6',
            ]);
            if ($validator->fails()) {
                return \Response::make(['status' => 'New password not up to 6 characters'], 400);
            } else {
                $user->password = \Hash::make($request->newPassword);
                $user->save();

                return \Response::make(['status' => 'Successfully changed password'], 202);
            }
        } else {
            return \Response::make(['status' => 'Old password doesn\'t match'], 400);
        }
    }

    public function sendMessage(Request $request, $userID)
    {
        //$pusher = Pusher;
      try {
          $user = \JWTAuth::parseToken()->toUser();
      } catch (\Exception $exception) {
          return \Response::make(['status' => 'Unauthorized'], 401);
      }

        $toUser = $this->findUser($userID);
        if (!$toUser) {
            return \Response::make(['status' => 'User not found'], 404);
        }

        $chat = self::getChat($user, $toUser);

        if (true) {
            $message = new \App\ChatMessage();
            $message->text = $request->message;
            $chat->last_message = $request->message;
            $message->user()->associate($user);
            $chat->messages()->save($message);
            $chat->save();

        //Pusher::trigger('general', 'news_feed', ['message' => $request->message]);
        Pusher::trigger('private-message-'.$chat->id, 'new_message', $message, $request->socket_id);
            Pusher::trigger('private-notifications-'.$toUser->hash_id, 'new_message', $chat->load('users'));

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
        try {
            $user = \JWTAuth::parseToken()->toUser();
        } catch (\Exception $exception) {
            return \Response::make(['status' => 'Unauthorized'], 401);
        }

        $toUser = $this->findUser($userID);
        if (!$toUser || $toUser->id == $user->id) {
            return \Response::make(['status' => 'User not found'], 404);
        }

        $chat = self::getChat($user, $toUser);
        $sub = $chat->subs()->where('user_id', $user->id)->first();
        $sub->last_seen = \Carbon\Carbon::now();//update for notification purposes
        $sub->save();

        $messages = Tools::paginateByID(
                            $request, $chat->messages()->with('user')->orderBy('created_at', 'desc')
                            )->get();
        //return $messages;
        return \Response::make(array_reverse($messages->toArray()))->header('X-CHAT-ID', $chat->id);
    }

    public function getActiveChats()
    {
        try {
            $user = \JWTAuth::parseToken()->toUser();
        } catch (\Exception $exception) {
            return \Response::make(['status' => 'Not Authorized'], 401);
        }
      //ammend this query
      $chats = \App\Chat::whereHas('subs', function ($query) use ($user) {
          $query->where('user_id', $user->id);
      })->has('messages')->with('subs.user')->get();

      //dd($chats);

      return $chats;
    }

    public function getUnreadMessages()
    {
        try {
            $user = \JWTAuth::parseToken()->toUser();
        } catch (\Exception $exception) {
            return \Response::make(['status' => 'Unauthorized'], 401);
        }

        $unread = \App\Chat::leftJoin('chat_subs', function ($join) {
                        $join->on('chats.id', '=', 'chat_subs.chat_id')
                              ->on('chats.updated_at', '>', 'chat_subs.last_seen');
                      })
                      ->leftJoin('users', 'users.id', '=', 'chat_subs.user_id')
                      ->where('users.id', $user->id)
                      ->select('chats.*')
                      ->get();

        return $unread;
    }

    public function setChatRead($userID)
    {
        try {
            $user = \JWTAuth::parseToken()->toUser();
        } catch (\Exception $exception) {
            return \Response::make(['status' => 'Unauthorized'], 401);
        }

        $chat = \App\Chat::find($userID);
        $subs = $chat->subs()->where('user_id', $user->id)->first();

        if ($subs) {
            $subs->last_seen = \Carbon\Carbon::now();
            $subs->save();
        }
    }

    public static function getChat($user, $toUser)
    {
        try {
            $chat = \App\Chat::whereHas('subs', function ($query) use ($user) {
              $query->where('user_id', $user->id);
          })->whereHas('subs', function ($query) use ($toUser) {
              $query->where('user_id', $toUser->id);
          })->firstOrFail();
        } catch (\Exception $exceptionxception) {
            $chat = new \App\Chat();
            $sub = new \App\ChatSub();
            $sub1 = new \App\ChatSub();

            $chat->save();

            $sub->user()->associate($user);
            $sub1->user()->associate($toUser);

            $sub->chat()->associate($chat);
            $sub1->chat()->associate($chat);

            $sub->save();
            $sub1->save();
        }

        return $chat;
    }

    public function getFriendRequests()
    {
        try {
            $user = \JWTAuth::parseToken()->toUser();
        } catch (Exception $exception) {
            $user = null;
        }
        $request = Request::capture();

        if ($user) {
            $reqs = \App\Friend::where('to', $user->id)->where('status', 0);
            if ($request->profiles == 'true') {
                $reqs = $reqs->with('fromUser')->with('toUser');
            }

            return $reqs->get();
        }
    }

    public function acceptRequest()
    {
        try {
            $user = \JWTAuth::parseToken()->toUser();
        } catch (Exception $exception) {
            $user = null;
        }
        $request = Request::capture();
      //$who

      if ($user && $request->user_id) {
          $reqs = \App\Friend::where('to', $user->id)->where('status', 0);
          if ($request->profiles == 'true') {
              $reqs = $reqs->with('fromUser')->with('toUser');
          }

          return $reqs->get();
      }
    }

    public function getNotifications()
    {
        //$gen = AppController::getGeneralNotif();
        //return $friend_requests = $this->getFriendRequests();
    }

    public function update(Request $request, $userID)
    {
    }

    public function destroy($userID)
    {
        //
    }
}
