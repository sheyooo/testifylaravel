<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCategoryPostTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('category_post', function (Blueprint $table) {
          $table->engine = 'InnoDB';
          $table->charset = 'utf8';
          $table->collation = 'utf8_unicode_ci';
            $table->increments('id');
            $table->timestamps();
            $table->bigInteger('post_id')->unsigned();
            $table->bigInteger('category_id')->unsigned();

            $table->foreign('post_id')
              ->references('id')->on('posts')
              ->onDelete('cascade');
            $table->foreign('category_id')
              ->references('id')->on('categories')
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
        Schema::drop('category_post');
    }
}
