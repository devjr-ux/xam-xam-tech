<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\ForumController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DashboardController;

// ─── Auth (public) ────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// ─── Public ───────────────────────────────────────────────────
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/courses',    [CourseController::class,  'index']);
Route::get('/courses/{course}', [CourseController::class, 'show']);

// ─── Authenticated ────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Profile
    Route::put('/profile', [UserController::class, 'update']);

    // Dashboard (role-based)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Notifications
    Route::get('/notifications',            [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all',  [NotificationController::class, 'markAllRead']);

    // Enrollments
    Route::post('/courses/{course}/enroll',    [EnrollmentController::class, 'enroll']);
    Route::get('/courses/{course}/progress',   [EnrollmentController::class, 'progress']);
    Route::post('/courses/{course}/progress',  [EnrollmentController::class, 'updateProgress']);
    Route::get('/my-courses',                  [EnrollmentController::class, 'myCourses']);

    // Favorites
    Route::post('/courses/{course}/favorite',   [CourseController::class, 'toggleFavorite']);
    Route::get('/favorites',                    [CourseController::class, 'favorites']);

    // Certificates
    Route::get('/certificates',         [CertificateController::class, 'index']);
    Route::get('/certificates/{id}',    [CertificateController::class, 'show']);
    Route::get('/certificates/{id}/download', [CertificateController::class, 'download']);

    // Quiz
    Route::get('/lessons/{lesson}/quiz',    [QuizController::class, 'getByLesson']);
    Route::post('/quizzes/{quiz}/submit',   [QuizController::class, 'submit']);
    Route::get('/quizzes/{quiz}/results',   [QuizController::class, 'results']);

    // Forum
    Route::get('/forum/posts',           [ForumController::class, 'index']);
    Route::post('/forum/posts',          [ForumController::class, 'store']);
    Route::get('/forum/posts/{post}',    [ForumController::class, 'show']);
    Route::post('/forum/posts/{post}/reply', [ForumController::class, 'reply']);
    Route::post('/forum/posts/{post}/like',  [ForumController::class, 'like']);

    // ── Instructor only ───────────────────────────────────────
    Route::middleware('role:instructor,admin')->group(function () {
        Route::post('/courses',              [CourseController::class, 'store']);
        Route::put('/courses/{course}',      [CourseController::class, 'update']);
        Route::delete('/courses/{course}',   [CourseController::class, 'destroy']);
        Route::post('/courses/{course}/lessons',          [LessonController::class, 'store']);
        Route::put('/lessons/{lesson}',                   [LessonController::class, 'update']);
        Route::delete('/lessons/{lesson}',                [LessonController::class, 'destroy']);
        Route::post('/lessons/{lesson}/quiz',             [QuizController::class, 'store']);
        Route::put('/quizzes/{quiz}',                     [QuizController::class, 'update']);
        Route::get('/instructor/students',                [UserController::class, 'myStudents']);
        Route::get('/instructor/stats',                   [DashboardController::class, 'instructorStats']);
    });

    // ── Admin only ────────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/users',              [UserController::class, 'index']);
        Route::put('/admin/users/{user}',       [UserController::class, 'adminUpdate']);
        Route::delete('/admin/users/{user}',    [UserController::class, 'destroy']);
        Route::post('/admin/courses/{course}/publish', [CourseController::class, 'publish']);
        Route::post('/admin/courses/{course}/reject',  [CourseController::class, 'reject']);
        Route::get('/admin/stats',                     [DashboardController::class, 'adminStats']);
    });
});
