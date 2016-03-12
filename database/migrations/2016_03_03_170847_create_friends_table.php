<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFriendsTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
      //
      Schema::create('friends', function(Blueprint $table){
        $table->charset = "utf8";
        $table->collation = "utf8_unicode_ci";

        $table->bigIncrements('id');
        $table->bigInteger('from')->unsigned();
        $table->bigInteger('to')->unsigned();
        $table->integer('status')->default(0);//1=accepted, 0=not_confirmed
        $table->timestamps();

        $table->foreign('from')
          ->references('id')->on('users')
          ->onDelete('cascade');

        $table->foreign('to')
          ->references('id')->on('users')
          ->onDelete('cascade');

        $table->unique('from', 'to');
      });

  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
      //
      Schema::drop('friends');
  }
}
