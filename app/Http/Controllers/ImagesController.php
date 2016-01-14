<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class ImagesController extends Controller
{


    /* DIR PARAMETER IS THE AMAZON BUCKET */
    public static function saveImage($image, $user, $dir){


        if(!$image->isValid())
          return false;
    


      $key = $user->id . time() . $image->getClientOriginalName();

  		$extension = $image->getClientOriginalExtension();
      Tools::uploadToAmazon($image, $key, $dir);

	  	$img = new \App\Image;
      //$img->user_id = 1;
      $img->file_name = $key;
      $img->url = "https://testify.imgix.net/" . $key;
      $user->images()->save($img);

	  	return $img;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
      $user = null;
      try{
        $user = \JWTAuth::parseToken()->toUser();
      }catch(\Exception $e){
        return \Response::make('', 401);
      }
        //
      $file = $request->file('file');
      if($img = self::saveImage($file, $user, 'posts/')){
        return \Response::make(["status" => true,"image_id" => $img->id], 201);
      }else{
        return \Response::make(['error' => 'Bad request'], 400);
      }

    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
