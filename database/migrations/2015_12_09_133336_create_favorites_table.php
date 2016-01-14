<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFavoritesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('favorites', function (Blueprint $table) {
          $table->engine = 'InnoDB';
            $table->increments('id');
            $table->timestamps();
            $table->bigInteger('post_id')->unsigned();
            $table->bigInteger('user_id')->unsigned();
            $table->unique(['user_id', 'post_id']);


            $table->foreign('post_id')
              ->references('id')->on('posts')
              ->onDelete('cascade');
            $table->foreign('user_id')
              ->references('id')->on('users')
              ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('favorites');
    }
}
