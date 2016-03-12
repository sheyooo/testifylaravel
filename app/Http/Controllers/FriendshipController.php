<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

class FriendshipController extends Controller
{
    /**
     * Get or check the relationship status between two users
     * @param  \App\User $who    The user to check against
     * @param  \App\User $meUser The current user optional can be gotten from token
     * @return \App\Friend         Returns the relationship model
     */
    public static function getRelationship($who, $meUser = null)
    {
        if (!$meUser){
            try{
                $meUser = \JWTAuth::parseToken()->toUser();
                if(!$who){
                    throw new Exception("User not supplied");
                }
            }catch(\Exception $exception){
                return null;
            }
        }

        $relationship = \App\Friend::where(function ($query) use ($meUser, $who) {
                                    $query->where('to', $meUser->id)
                                          ->orWhere('to', $who->id);
                                })
                              ->where(function ($query) use ($meUser, $who) {
                                    $query->where('from', $who->id)
                                          ->orWhere('from', $meUser->id);
                                })
                              ->first();

         return $relationship;
    }

    /**
     * Get friends ID or Models of a User depending on $mode argument
     * @param  \App\User $user The User Model to work with
     * @param  boolean $mode true to get models, false for iis_get_dir_security
     * @return \Illuminate\Database\Eloquent\Collection       Results in an Eloquent Collection
     */
    public static function getFriends($user, $mode = false)
    {
        try{
            $user = \JWTAuth::parseToken()->toUser();
        }catch(\Exception $exception){
            return collect([]);
        }

        $friendsRelationship = \App\Friend::where(function ($query) use ($user) {
                                    $query->where('from', $user->id)
                                          ->orWhere('to', $user->id);
                                })
                              ->where('status', 1)
                              ->get();
        $friendsArray = [];

        foreach ($friendsRelationship as $relationship) {
            $friend = $relationship->toUser;
            if ($relationship->to == $user->id){
                $friend = $relationship->fromUser;
            }

            if ($mode == true){
                $friendsArray[] = $friend;
            }else{
                $friendsArray[] = $friend->id;
            }
        };

        return $friendsArray;
    }


    public static function friendsActivity($user)
    {
        $friendIDs = self::getFriends($user);

        return \App\PostActivity::whereIn('user_id', $friendIDs);
    }

    public static function getFriendsActivity($user = null)
    {
        if(!$user){
            try{
                $user = \JWTAuth::parseToken()->toUser();
            }catch(\Exception $exception){
                return "Error";
            }
        }

        $activities = self::friendsActivity($user);

        return $activities->get();
    }


}
