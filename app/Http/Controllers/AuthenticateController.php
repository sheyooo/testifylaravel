<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthenticateController extends Controller
{
    //

    public function auth(Request $request)
    {
        if ($user = AppController::Login($request->user, $request->password)) {
            //dd($user);
            $token = \JWTAuth::fromUser($user, ['hash_id' => $user->hash_id]);

            return array('token' => "{$token}");
        } else {
            $c = ['status' => 'User not found'];

            return \Response::make($c, 404);
        }
    }

    public function fbToken(Request $request)
    {
        $fbuser = AppController::getFbUserFromToken($request->fb_access_token);
        if ($suser = \App\SocialUser::where('type', 'facebook')->where('social_id', $fbuser['id'])->get()->first()) {
            $token = \JWTAuth::fromUser($suser->user, ['hash_id' => $suser->user->hash_id]);
        } else {
            $user = AppController::createUserFromFbToken($request->fb_access_token);
            if (is_a($user, '\App\User')) {
                $token = \JWTAuth::fromUser($user, ['hash_id' => $user->hash_id]);
            } else {
                return $user;
            }
        }

        if ($token) {
            return \Response::make(['token' => $token]);
        } else {
            return \Response::make(['error' => 'Unable to create User from facebook login']);
        }
    }

    public function signup(Request $request)
    {
        $uc = new UsersController();
        $resp = $uc->store($request);
        if (is_a($resp, '\App\User')) {
            $user = $resp;

            return \Response::make(['token' => \JWTAuth::fromUser($user, ['hash_id' => $user->hash_id])], 201);
        } else {
            return $resp;
        }
    }
}
