<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PostsController extends Controller
{
    private static $hashid_salt = 'post';

    public function __construct()
    {
        //$this->middleware('jwt.refresh', ['except' => ['index', 'show']]);

        $this->middleware('jwt.auth', ['except' => ['index', 'show', 'getComments']]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $posts = \App\Post::orderBy('created_at', 'desc');
        if ($request->category) {
            $posts = $posts->whereHas('categories', function ($query) use ($request) {
              $query->where('name', $request->category);
          });
        };
        $posts = Tools::paginateByID($request, $posts);
        $posts = $posts->get();
        $posts = $this->formatPostsIfAnon($posts);

        return $posts;
    }

    public function formatPostsIfAnon($posts)
    {
        $posts = $posts->each(function ($post, $key) {
       $post = $this->formatPostIfAnon($post);
      });

        return $posts;
    }

    public function formatPostIfAnon($post)
    {
        $user_id = false;
        try {
            $user_id = \JWTAuth::parseToken()->toUser()->id;
        } catch (\Exception $e) {
        }
        $post->images;
        $post->categories;

        if (!$post['anonymous'] || $post->user->id == $user_id) {
            //echo($post->user->id);
        $post->user;
            if ($post['user']) {
                $post->user->profile;
            }
        } else {
            unset($post['user']);
        };

        return $post;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
        $post = new \App\Post();
        $post->text = htmlspecialchars($request->post);
        $post->anonymous = htmlspecialchars($request->anonymous);

        try {
            $user = \JWTAuth::parseToken()->toUser();
            if ($user->posts()->save($post)) {
                $hash = Tools::generateHashID(self::$hashid_salt, $post->id);
                $post->hash_id = $hash;
                $post->categories()->sync($request->categories);
                if ($request->images) {
                    $post->images()->sync($request->images);
                }
                $post->save();

                $action = $post;
                $activity = new \App\PostActivity();
                $action->user_id = $user->id;
                $activity->action()->associate($post);
                $activity->user()->associate($user);
                $activity->post()->associate($post);
                $activity->save();

                $post = $this->show($post->id);

                return \Response::make($post, 201);
            } else {
                return \Response::make(['error' => 'Could not create post'], 400);
            }
        } catch (Exception $e) {
            return \Response::make(['status' => 'Unauthorized'], 401);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param mixed $id identifier can be id or hash_id
     *
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //

        try {
            $id = Tools::decodeHashID(self::$hashid_salt, $id);
            $post = \App\Post::findOrFail($id);
        } catch (\Exception $e) {
            try {
                $post = \App\Post::findOrFail($id);
            } catch (\Exception $e) {
            }
        }

        if ($post) {
            $post = $this->formatPostIfAnon($post);

            return $post;
        } else {
            return \Response::make(['error' => 'No post found'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param int                      $id
     *
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param mixed $id or hash_id
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
        try {
            $id = Tools::decodeHashID(self::$hashid_salt, $id);
        } catch (\Exception $e) {
        }
        try {
            $post = \App\Post::findorFail($id);
            if (\JWTAuth::parseToken()->toUser()->id == $post->user->id) {
                $post->delete();
            }
        } catch (\Exception $e) {
            return \Response::make(['error' => 'Forbidden'], 401);
        }
    }

    public function getComments($id)
    {
        $comments = \App\Post::findOrFail($id)->comments()
                                           ->with('user')
                                           ->orderBy('created_at', 'desc')
                                           ->get()
                                           ->all();

        return $comments;
    }

    public function storeComment($id, Request $request)
    {
        try {
            $user = \JWTAuth::parseToken()->toUser();
            $comment = new \App\Comment();
            $activity = new \App\PostActivity();
            $comment->text = htmlspecialchars($request->text);
            $post = \App\Post::find($id);
            $post->comments()->save($comment->user()->associate($user));
            //$comment->user;
            $activity->action()->associate($comment);
            $activity->user()->associate($user);
            $activity->post()->associate($post);
            $activity->save();

            return $comment;
        } catch (\Exception $e) {
            return \Response::make(['error' => 'Unable to post comment'], 400);
        }
    }

    public static function transformHashID($hash)
    {
        //Throws exception if it is already an ID
      return Tools::decodeHashID(self::$hashid_salt, $hash);
    }
}
