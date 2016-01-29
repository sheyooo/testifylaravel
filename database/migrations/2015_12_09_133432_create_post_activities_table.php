<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePostActivitiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('post_activities', function (Blueprint $table) {
          $table->engine = 'InnoDB';
          $table->charset = 'utf8';
          $table->collation = 'utf8_unicode_ci';
            $table->increments('id');
            $table->timestamps();
            $table->bigInteger('post_id')->unsigned();
            $table->string('action_type');
            $table->bigInteger('action_id');
            $table->bigInteger('user_id')->unsigned();

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
        Schema::drop('post_activities');
    }
}
