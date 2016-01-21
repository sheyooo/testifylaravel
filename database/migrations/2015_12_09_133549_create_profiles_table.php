<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProfilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('profiles', function (Blueprint $table) {
          $table->engine = 'InnoDB';
            $table->increments('id');
            $table->timestamps();
            $table->bigInteger('user_id')->unsigned();
            $table->string('favorite_book');
            $table->string('favorite_verse');
            $table->string('favorite_parable');
            $table->string('denomination');
            $table->integer('preference_messaging');

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
        Schema::drop('profiles');
    }
}
