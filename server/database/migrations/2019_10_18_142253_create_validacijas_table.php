<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateValidacijasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('validacijas', function (Blueprint $table) {
            $table->string('Ier_ID')->primary();
            $table->string('Parks')->nullable();
            $table->string('TranspVeids')->nullable();
            $table->integer('GarNr')->nullable();
            $table->string('MarsNos')->nullable();
            $table->string('TMarsruts')->nullable();
            $table->string('Virziens')->nullable();
            $table->integer('ValidTalonaId')->nullable();
            $table->string('Laiks')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('validacijas');
    }
}
