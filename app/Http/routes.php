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
  Route::get('users/{id}/profile', 'UsersController@getProfile');
  Route::post('users/{id}/profile/avatar', 'UsersController@setAvatar');
  Route::post('users/{id}/password', 'UsersController@changePassword');
  Route::post('users/{id}/profile', 'UsersController@updateProfile');
  Route::post('users/{id}/messages', 'UsersController@sendMessage');
  Route::get('me/messages/{user_id}', 'UsersController@getChatMessages');
  Route::resource('users', 'UsersController');
  Route::resource('posts', 'PostsController', ['only' => ['index', 'show', 'store', 'destroy']]);
  Route::resource('comments', 'CommentsController', ['only' => ['store', 'destroy']]);
  Route::resource('images', 'ImagesController', ['only' => ['store', 'destroy']]);
});

Route::get('{first?}/{second?}/{third?}', function($first = 1, $second = 2, $third = 3)
{
  if(preg_match("/api/", $first) ){
    return abort(404);
  }else{
    return File::get(public_path() . '/index.html');
  }
});
