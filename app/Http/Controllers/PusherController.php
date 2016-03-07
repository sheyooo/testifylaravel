<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Vinkla\Pusher\PusherManager;

class PusherController extends Controller
{
    //
    protected $pusher;

    public function __construct(PusherManager $pusher)
    {
        $this->pusher = $pusher;
    }

    public function auth(Request $request)
    {
        try {
            $user = \JWTAuth::parseToken()->toUser();
            if (preg_match('/private-notifications-*/', $request->channel_name)) {
                if ($request->channel_name == 'private-notifications-'.$user->hash_id) {
                    return \Response::make($this->pusher->socket_auth($request->channel_name, $request->socket_id), 200);
                } else {
                    return \Response::make(['status' => 'Forbidden'], 403);
                }
            } elseif (preg_match('/private-message-*/', $request->channel_name)) {
                $exploded = explode('-', $request->channel_name);
          //dd($exploded);
          $chat = \App\Chat::find($exploded[2]);
                $users = $chat->users;
                foreach ($users as $ch_user) {
                    if ($ch_user->id == $user->id) {
                        return \Response::make($this->pusher->socket_auth($request->channel_name, $request->socket_id), 200);
                    }
                }

                return \Response::make(['status' => 'Forbidden'], 403);
            } else {
                return \Response::make(['status' => 'Forbidden'], 403);
            }
        } catch (Exception $e) {
            return \Response::make(['status' => 'Forbidden'], 403);
        }
    }
}
