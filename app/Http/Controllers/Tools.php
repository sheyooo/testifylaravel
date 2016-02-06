<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class Tools extends Controller
{
    //
    public static function paginateByID(Request $request, $data){
      if($request->after || $request->before){
        try{
          if($request->after){
            $request->after = PostsController::transformHashID($request->after);
          }elseif($request->before){
            $request->before = PostsController::transformHashID($request->before);
          }
        }catch(\Exception $e){
        }
      }

      if($request->after){
        $data = $data->where('id' , '>' , $request->after);
      }elseif($request->before){
        $data = $data->where('id' , '<' , $request->before);
      }

      if($request->limit){
        if($request->limit <= 15 && $request->limit >= 0){
          $data = $data->take($request->limit);
        }else{
          $data = $data->take(15);
        }
      }else{
        $data = $data->take(15);
      }

      return $data;
    }

    public static function paginateByTimestamp(Request $request, $data){

      if($request->after){
        $data = $data->where('created_at' , '>' , $request->after);
      }elseif($request->before){
        $data = $data->where('created_at' , '<' , $request->before);
      }

      if($request->limit){
        if($request->limit <= 15 && $request->limit >= 0){
          $data = $data->take($request->limit);
        }else{
          $data = $data->take(15);
        }
      }else{
        $data = $data->take(15);
      }

      return $data;
    }

    public static function uploadToAmazon($file, $key, $folder){
      if(!$folder){
        $folder = 'posts/';
      }

   		$client = \Aws\S3\S3Client::factory([
   			'region' => 'us-west-2',
   			'version' => '2006-03-01',
   			'http' => ['verify' => false]
   				]
   			);
   		$bucket = getenv('S3_BUCKET')?: die('No "S3_BUCKET" config var in found in env!');

   		$result = $client->putObject(array(
   				    'Bucket'     => $bucket,
   				    'Key'        => 'posts/' . $key,
   				    'SourceFile' => $file
   				));
   		return $result;
   	}

    public static function generateHashID($salt, $id){
      $hashids = new \Hashids\Hashids($salt, 10);
      $id = $hashids->encode($id);
      //$numbers = $hashids->decode($id);
      //echo $id;
      return $id;
    }

    public static function decodeHashID($salt, $hash_id){
      $hashids = new \Hashids\Hashids($salt, 10);
      $number = $hashids->decode($hash_id);
      //print_r($number);
      if(isset($number[0])){
        return $number[0];
      }else{
        throw new \Exception("Unable to decode hash_id");
      }
    }
}
