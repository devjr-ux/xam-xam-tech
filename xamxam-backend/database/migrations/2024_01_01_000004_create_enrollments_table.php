<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEnrollmentsTable extends Migration
{
    public function up()
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->float('progress')->default(0);
            $table->unsignedBigInteger('last_lesson_id')->nullable();
            $table->foreign('last_lesson_id')->references('id')->on('lessons')->nullOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'course_id']);
        });

        Schema::create('lesson_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->unique(['user_id', 'lesson_id']);
        });

        Schema::create('course_user_favorites', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'course_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('course_user_favorites');
        Schema::dropIfExists('lesson_completions');
        Schema::dropIfExists('enrollments');
    }
}
