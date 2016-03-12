<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     *
     * @return void
     */
    public function testBasicExample()
    {
        $this->json('get', '/api/v1/categories')
             ->seeJsonStructure([
                 [
                     'id',
                     'name',
                     'sort',
                     'type'
                 ]

             ]);
    }
}
