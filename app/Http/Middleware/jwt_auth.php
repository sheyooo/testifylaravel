<?php

namespace App\Http\Middleware;

use Closure;

class jwt_auth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
     try{
      if(\JWTAuth::parseToken()->toUser()->id){
       return $next($request);
      }else{
       return \Response::make(['error' => 'Bad Authorization'], 401);
      }
     }catch(Exception $e){
      return \Response::make(['error' => 'Bad Authorization'], 401);
     }
    }
}
