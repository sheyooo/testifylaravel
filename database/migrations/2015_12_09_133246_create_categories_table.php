<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCategoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('categories', function (Blueprint $table) {
          $table->engine = 'InnoDB';
          $table->charset = 'utf8';
          $table->collation = 'utf8_unicode_ci';
            $table->bigIncrements('id');
            $table->timestamps();
            $table->string('name');
            $table->string('type');
            $table->integer('sort');
        });


        DB::table('categories')->insert([
          ['name' => 'Health',
            'type' => 'testimony',
              'sort' => 1
          ],['name' => 'Career',
              'type' => 'testimony',
              'sort' => 2
          ],['name' => 'Family',
              'type' => 'testimony',
              'sort' => 3
          ],['name' => 'Financial',
              'type' => 'testimony',
              'sort' => 4
          ],['name' => 'Protection',
              'type' => 'testimony',
              'sort' => 5
          ],['name' => 'Provision',
              'type' => 'testimony',
              'sort' => 6
          ],['name' => 'Education',
              'type' => 'testimony',
              'sort' => 7
          ],['name' => 'Deliverance',
              'type' => 'testimony',
              'sort' => 8
          ],['name' => 'Addiction',
              'type' => 'testimony',
              'sort' => 9
          ],['name' => 'General',
              'type' => 'testimony',
              'sort' => 10
          ],['name' => 'The little things',
              'type' => 'testimony',
              'sort' => 11
          ],['name' => 'Prayer Request',
              'type' => 'prayer',
              'sort' => 12
          ]
        ]
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('categories');
    }
}
