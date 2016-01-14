<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Hash;

class AppController extends Controller
{
    //

    public function search(){
     return \App\Repo::where('item', 'like', '{$query}%')->where('item', 'like', '#{$query}%')->get()->all();
    }

    public static function Login($u, $p){
        try{
          $user = \App\User::where('email', $u)->firstOrFail();
          //dd($user->password);
          if(Hash::check($p, $user->password)){
            return $user;
          }else{
            return false;
          }
        }catch(Exception $e){
          return false;
        }


  		}

    public static function getFb(){
  			$fb = new \Facebook\Facebook([
  			  'app_id' => env('FACEBOOK_APP_ID'),
  			  'app_secret' => env('FACEBOOK_APP_SECRET'),
  			  'default_graph_version' => 'v2.4',

  			  ]);

  			return $fb;
  		}

  		public static function getFbUserFromToken($token){
  			$fb = AppController::getFb();

  			//Use the javascript helper when done with testing if you prefer from the fb sdk for php to get the access token from cookie after setting cookie = true
  			try {
  			    // Returns a `Facebook\FacebookResponse` object
  			    $response = $fb->get('/me?fields=id,name,first_name,last_name,email', $token);
  			} catch(\Facebook\Exceptions\FacebookResponseException $e) {
  			    echo 'Graph returned an error: ' . $e->getMessage();
  			    exit;
  			} catch(\Facebook\Exceptions\FacebookSDKException $e) {
  			    echo 'Facebook SDK returned an error: ' . $e->getMessage();
  			    exit;
  			}
  			$user = $response->getGraphUser();

  			if($user){
  				return $user;
  				//print_r($user);
  			}else{
  				return false;
  			}
  		}

    public static function createUserFromFbToken($token){
  			$fbuser = AppController::getFbUserFromToken($token);
  			if($fbuser){
  				$f = $fbuser;
  				$fb = AppController::getFb();
  				$r = $fb->get("/{$f['id']}/picture?type=square&width=500&height=500&redirect=0", $token);

  				$fb_pic = $r->getGraphUser()['url'];
  				$details = ["first_name" => "{$f['first_name']}",		"last_name" => "{$f['last_name']}"
  					];
  				if(isset($f['email'])){
  					$details["email"] = $f['email'];
  				}

      $uc = new UsersController;

      $req = \Request::instance();
      $req->replace($details);

      $resp = $uc->store($req);
      if(is_a($resp, '\App\User')){
       $user = $resp;
       $su = new \App\SocialUser;
       $su->social_id = $f['id'];
       $su->type = 'facebook';
       $su->name = $f['name'];

       $user->social_profile()->save($su);
       $user->avatar = $fb_pic;
       $user->save();

  		   return $user;
      }else{
       return $resp;
      }

  			}

  		}






}
