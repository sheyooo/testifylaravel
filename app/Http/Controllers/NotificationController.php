<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    //
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
}
