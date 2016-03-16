<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationsController extends Controller
{
    //

    private $user = null;

    public function __construct(){
        try{
            $this->user = \JWTAuth::parseToken()->toUser();
        }catch(\Exception $exception){
            $this->user = null;
        }
    }

    public function storeGcm(Request $request)
    {
        try {
            $user = \JWTAuth::parseToken()->toUser();
            $gcm = new \App\AndroidGcm();
            $gcm->gcm_id = $request->registration_id;
            $user->gcmIds()->save($gcm);
        } catch (\Exception $e) {
        }
    }

    public function getNotifications(Request $request)
    {
        if (is_null($this->user)){
            return \Response::make(['error' => 'Unauthorized'], 401);
        }

        $friendIDs = FriendshipController::getFriends($this->user);


        $postSubs = \App\PostSub::where('user_id', $this->user->id)
                                ->select('post_id')
                                ->get();

        $postSubs = $postSubs->toArray();
        //Subscription for posts to get good notifications
        $activities = \App\PostActivity::where(function ($query) use ($friendIDs){
                                            $query->whereIn('user_id', $friendIDs)
                                            ->where('action_type', "App\\Post");
                                        })
                                        ->orWhereIn('post_id', $postSubs)
                                        ->where('user_id', '!=', $this->user->id)
                                        ->where('created_at', '>', $this->user->last_notif_seen);

        if ($request->profiles == true){
            $activities->with('user');
        }

        return $activities->get();
    }

    public static function getNotificationsss()
    {
        //$gen = AppController::getGeneralNotif();
        $user = null;
        try{
            $user = \JWTAuth::parseToken()->toUser();
        }catch(\Exception $exception){
            return \Response::make([], 401);
        }

        $activities = FriendshipController::friendsActivity($user)
                                            ->where('created_at', '>', $user->last_notif_seen)
                                            ->get();

        return $activities;
    }


}
