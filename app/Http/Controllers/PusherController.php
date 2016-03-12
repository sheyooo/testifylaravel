<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Vinkla\Pusher\PusherManager;

class PusherController extends Controller
{
    //
    protected $pusher;
    private $user = null;
    private $channelName = null;
    private $socketID = null;

    public function __construct(PusherManager $pusher)
    {
        $this->pusher = $pusher;
        try{
            $this->user = \JWTAuth::parseToken()->toUser();
        }catch(\Exception $exception){
            $this->user = null;
        }
    }

    public function auth(Request $request)
    {
        if (is_null($this->user)){
            return \Response::make(['status' => 'Forbidden'], 403);
        }

        $this->channelName = $request->channel_name;
        $this->socketID = $request->socket_id;

        if (preg_match('/private-notifications-*/', $this->channelName))
        {
            return $this->userNotificationAuth();
        } elseif (preg_match('/private-message-*/', $this->channelName))
        {
            return $this->chatAuth();
        }
    }

    public function userNotificationAuth()
    {
        if ($this->channelName == 'private-notifications-'.$this->user->hash_id) {
            $pusherAuth = $this->pusher->socket_auth($this->channelName, $this->socketID);

            return \Response::make($pusherAuth, 200);
        } else {
            return \Response::make(['status' => 'Forbidden'], 403);
        }
    }

    public function chatAuth()
    {
        $chatID = explode('-', $this->channelName)[2];

        $userSubs = $this->user->chatSubs()
                            ->select('chat_id')
                            ->get();
        $userSubs->transform(function ($item, $key){
            return $item['chat_id'];
        });

        if ( $userSubs->search($chatID) >= 0 ){
            $pusherAuth = $this->pusher->socket_auth($this->channelName, $this->socketID);

            return \Response::make($pusherAuth, 200);
        }
    }




}
