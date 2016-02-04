<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateChatSubsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chat_subs', function (Blueprint $table) {
          $table->charset = "utf8";
          $table->collation = "utf8_unicode_ci";

          $table->bigIncrements('id');
          $table->bigInteger('chat_id')->unsigned();
          $table->bigInteger('user_id')->unsigned();
          $table->timestamp('last_seen');
          $table->timestamps();

          $table->foreign('chat_id')
          ->references('id')->on('chats')
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
        Schema::drop('chat_subs');
    }
}
