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
          ],['name' => 'Career/Business',
              'type' => 'testimony',
              'sort' => 2
          ],['name' => 'Family',
              'type' => 'testimony',
              'sort' => 3
          ],['name' => 'Relationship/Love',
              'type' => 'testimony',
              'sort' => 4
          ],['name' => 'Financial',
              'type' => 'testimony',
              'sort' => 5
          ],['name' => 'Safety/Protection',
              'type' => 'testimony',
              'sort' => 6
          ],['name' => 'Provision',
              'type' => 'testimony',
              'sort' => 7
          ],['name' => 'Education',
              'type' => 'testimony',
              'sort' => 8
          ],['name' => 'Deliverance',
              'type' => 'testimony',
              'sort' => 9
          ],['name' => 'Addiction',
              'type' => 'testimony',
              'sort' => 10
          ],['name' => 'General',
              'type' => 'testimony',
              'sort' => 11
          ],['name' => 'The little things',
              'type' => 'testimony',
              'sort' => 12
          ],['name' => 'Prayer Request',
              'type' => 'prayer',
              'sort' => 13
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
