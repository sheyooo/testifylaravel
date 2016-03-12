<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRelationshipsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        // Schema::create('relationships', function(Blueprint $table){
        //   $table->charset = "utf8";
        //   $table->collation = "utf8_unicode_ci";
        //
        //   $table->bigIncrements('id');
        //   $table->bigInteger('user1')->unsigned();
        //   $table->bigInteger('user2')->unsigned();
        //   $table->integer('status');//1=accepted, 0=not_confirmed
        //
        //   $table->timestamps();
        // });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
        //Schema::drop('relationships')
    }
}
