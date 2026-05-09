<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('forum_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('category');
            $table->string('title');
            $table->text('content');
            $table->text('tags')->nullable(); // JSON string
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_solved')->default(false);
            $table->integer('views')->default(0);
            $table->timestamps();
        });

        Schema::create('forum_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('forum_posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->boolean('is_accepted')->default(false);
            $table->timestamps();
        });

        Schema::create('forum_post_likes', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('forum_post_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'forum_post_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('forum_post_likes');
        Schema::dropIfExists('forum_replies');
        Schema::dropIfExists('forum_posts');
    }
};
