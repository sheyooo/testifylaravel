<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/
Route::get('/', function(){
  return File::get(public_path() . '/index.html');
});

Route::group(['prefix' => 'api/v1'], function(){
  Route::post('signup', 'AuthenticateController@signup');
  Route::post('authenticate', 'AuthenticateController@auth');
  Route::post('fb-token', 'AuthenticateController@fbToken');
  Route::get('search', 'AppController@search');
  Route::resource('categories', 'CategoriesController', ['only' => ['index']]);
  Route::post('posts/{id}/taps', 'PostsTapController@store');
  Route::delete('posts/{id}/taps', 'PostsTapController@destroy');
  Route::post('posts/{id}/favorites', 'PostsFavoriteController@store');
  Route::delete('posts/{id}/favorites', 'PostsFavoriteController@destroy');
  Route::post('posts/{id}/amens', 'PostsAmenController@store');
  Route::get('posts/{id}/comments', 'PostsController@getComments');
  Route::post('posts/{id}/comments', 'PostsController@storeComment');
  Route::get('users/{id}/favorites', 'UsersController@getFavorites');
  Route::get('users/{id}/activities', 'UsersController@getActivities');
  Route::get('users/{id}/taps', 'UsersController@getTaps');
  Route::get('users/{id}', 'UsersController@show');

  Route::post('users/{id}/messages', 'UsersController@sendMessage');
  Route::get('me', 'UsersController@show');
  Route::get('me/messages/unread', 'UsersController@getUnreadMessages');
  Route::patch('me/messages/{id}/read', 'UsersController@setChatRead');
  Route::get('me/messages/{user_id}', 'UsersController@getChatMessages');
  Route::get('me/messages', 'UsersController@getActiveChats');
  Route::get('me/notifications', 'NotificationsController@getNotifications');
  Route::get('me/friend_requests', 'UsersController@getFriendRequests');
  Route::post('me/friend_requests', 'UsersController@acceptRequest');
  Route::delete('me/friend_requests/{user_id}', 'UsersController@deleteRelationship');
  Route::get('me/friends', 'UsersController@getFriends');
  Route::get('me/friends/activities', 'FriendshipController@getFriendsActivity');
  Route::post('me/friends', 'UsersController@sendFriendRequest');

  Route::post('me/profile/avatar', 'UsersController@setAvatar');
  Route::post('me/password', 'UsersController@changePassword');
  Route::post('me/profile', 'UsersController@updateProfile');

  Route::resource('users', 'UsersController');
  Route::resource('posts', 'PostsController', ['only' => ['index', 'show', 'store', 'destroy']]);
  Route::resource('comments', 'CommentsController', ['only' => ['store', 'destroy']]);
  Route::resource('images', 'ImagesController', ['only' => ['store', 'destroy']]);

  Route::post('pusher/auth', 'PusherController@auth');
  Route::post('register_gcm/', 'NotificationsController@storeGcm');
});
// if the unfound url start with api return a 404
Route::get('{first?}/{second?}/{third?}', function($first = 1, $second = 2, $third = 3)
{
  if(preg_match("/api/", $first) ){
    return abort(404);
  }else{
    return File::get(public_path() . '/index.html');
  }
});
