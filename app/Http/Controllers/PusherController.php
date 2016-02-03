<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Vinkla\Pusher\PusherManager;

class PusherController extends Controller
{
    //
    protected $pusher;

    public function __construct(PusherManager $pusher)
    {
        $this->pusher = $pusher;
    }

    public function auth(Request $request){
      try {
        $user = \JWTAuth::parseToken()->toUser();

        if ( $request->channel_name == "private-notifications-" . $user->hash_id )
        {
          return \Response::make($this->pusher->socket_auth($request->channel_name, $request->socket_id), 200);
          //echo $pusher->socket_auth($_POST['channel_name'], $_POST['socket_id']);
        }
        else
        {
          return \Response::make(['status' => 'Forbidden'], 403);
        }
      } catch (\Exception $e) {
        return \Response::make(['status' => 'Forbidden'], 403);

      }
    }





}
