<?php
/*
 * ─────────────────────────────────────────────────────────────
 *  XamXam Tech — Migrations Laravel
 *  Copiez chaque bloc dans son fichier de migration séparé
 * ─────────────────────────────────────────────────────────────
 */

// ── 1. users (modifier la migration existante) ───────────────
// database/migrations/0001_01_01_000000_create_users_table.php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->enum('role', ['admin', 'instructor', 'student'])->default('student');
    $table->enum('status', ['active', 'suspended'])->default('active');
    $table->string('avatar')->nullable();
    $table->string('country')->nullable();
    $table->text('bio')->nullable();
    $table->string('phone')->nullable();
    $table->timestamps();
});

// ── 2. categories ─────────────────────────────────────────────
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->string('icon')->nullable();
    $table->timestamps();
});

// ── 3. courses ────────────────────────────────────────────────
Schema::create('courses', function (Blueprint $table) {
    $table->id();
    $table->foreignId('instructor_id')->constrained('users')->cascadeOnDelete();
    $table->foreignId('category_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->string('slug')->unique();
    $table->text('description');
    $table->enum('level', ['Débutant', 'Intermédiaire', 'Avancé'])->default('Débutant');
    $table->string('language')->default('Français');
    $table->decimal('price', 10, 2)->default(0);
    $table->string('thumbnail')->nullable();
    $table->enum('status', ['draft', 'pending', 'published', 'rejected'])->default('draft');
    $table->float('rating')->default(0);
    $table->integer('ratings_count')->default(0);
    $table->timestamps();
});

// ── 4. sections ───────────────────────────────────────────────
Schema::create('sections', function (Blueprint $table) {
    $table->id();
    $table->foreignId('course_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->integer('order')->default(0);
    $table->timestamps();
});

// ── 5. lessons ────────────────────────────────────────────────
Schema::create('lessons', function (Blueprint $table) {
    $table->id();
    $table->foreignId('section_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->enum('type', ['video', 'pdf', 'quiz'])->default('video');
    $table->string('video_url')->nullable();
    $table->string('pdf_url')->nullable();
    $table->integer('duration')->default(0); // in seconds
    $table->boolean('is_free')->default(false);
    $table->integer('order')->default(0);
    $table->timestamps();
});

// ── 6. enrollments ────────────────────────────────────────────
Schema::create('enrollments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('course_id')->constrained()->cascadeOnDelete();
    $table->float('progress')->default(0);
    $table->foreignId('last_lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
    $table->timestamp('completed_at')->nullable();
    $table->timestamps();
    $table->unique(['user_id', 'course_id']);
});

// ── 7. lesson_completions ─────────────────────────────────────
Schema::create('lesson_completions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
    $table->timestamps();
    $table->unique(['user_id', 'lesson_id']);
});

// ── 8. quizzes ────────────────────────────────────────────────
Schema::create('quizzes', function (Blueprint $table) {
    $table->id();
    $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->integer('passing_score')->default(60);
    $table->integer('duration')->default(900); // seconds
    $table->timestamps();
});

// ── 9. quiz_questions ─────────────────────────────────────────
Schema::create('quiz_questions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
    $table->text('question');
    $table->json('options');
    $table->integer('correct_option');
    $table->text('explanation')->nullable();
    $table->integer('points')->default(1);
    $table->timestamps();
});

// ── 10. quiz_attempts ─────────────────────────────────────────
Schema::create('quiz_attempts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
    $table->integer('score');
    $table->boolean('passed')->default(false);
    $table->json('answers');
    $table->json('details');
    $table->timestamps();
});

// ── 11. certificates ──────────────────────────────────────────
Schema::create('certificates', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('course_id')->constrained()->cascadeOnDelete();
    $table->string('certificate_id')->unique(); // XXT-2024-XXXXX
    $table->integer('score');
    $table->timestamp('issued_at');
    $table->timestamps();
    $table->unique(['user_id', 'course_id']);
});

// ── 12. course_favorites (pivot) ─────────────────────────────
Schema::create('course_user_favorites', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('course_id')->constrained()->cascadeOnDelete();
    $table->primary(['user_id', 'course_id']);
});

// ── 13. forum_posts ───────────────────────────────────────────
Schema::create('forum_posts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('category');
    $table->string('title');
    $table->text('content');
    $table->json('tags')->nullable();
    $table->boolean('is_pinned')->default(false);
    $table->boolean('is_solved')->default(false);
    $table->integer('views')->default(0);
    $table->timestamps();
});

// ── 14. forum_replies ─────────────────────────────────────────
Schema::create('forum_replies', function (Blueprint $table) {
    $table->id();
    $table->foreignId('post_id')->constrained('forum_posts')->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->text('content');
    $table->boolean('is_accepted')->default(false);
    $table->timestamps();
});

// ── 15. notifications ─────────────────────────────────────────
Schema::create('notifications', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('type');
    $table->morphs('notifiable');
    $table->json('data');
    $table->timestamp('read_at')->nullable();
    $table->timestamps();
});
