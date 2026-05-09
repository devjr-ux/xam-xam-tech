<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SectionController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\ForumController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PaymentController;

// ─── Auth (public) — rate limité ───────────────────────────────
Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// ─── Public ────────────────────────────────────────────────────
Route::get('/categories',        [CategoryController::class, 'index']);
Route::get('/courses',           [CourseController::class,   'index']);
Route::get('/courses/{course}',  [CourseController::class,   'show']);

// ─── Authenticated ─────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Profile
    Route::put('/profile', [UserController::class, 'update']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Notifications
    Route::get('/notifications',             [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read',  [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all',   [NotificationController::class, 'markAllRead']);

    // Enrollments / My courses
    Route::post('/courses/{course}/enroll',         [EnrollmentController::class, 'enroll']);
    Route::get('/courses/{course}/access',          [EnrollmentController::class, 'checkAccess']);
    Route::get('/courses/{course}/progress',        [EnrollmentController::class, 'progress']);
    Route::post('/courses/{course}/progress',       [EnrollmentController::class, 'updateProgress']);
    Route::get('/my-courses',                       [EnrollmentController::class, 'myCourses']);

    // Paiements
    Route::get('/enrollments/{enrollment}/payment',         [PaymentController::class, 'initiate']);
    Route::post('/enrollments/{enrollment}/payment/confirm',[PaymentController::class, 'confirm']);
    Route::get('/enrollments/{enrollment}/payment/status',  [PaymentController::class, 'status']);

    // Favoris
    Route::post('/courses/{course}/favorite', [CourseController::class, 'toggleFavorite']);
    Route::get('/favorites',                  [CourseController::class, 'favorites']);

    // Certificates
    Route::get('/certificates',              [CertificateController::class, 'index']);
    Route::get('/certificates/{id}',         [CertificateController::class, 'show']);
    Route::get('/certificates/{id}/download',[CertificateController::class, 'download']);

    // Quiz (apprenant)
    Route::get('/lessons/{lesson}/quiz',    [QuizController::class, 'getByLesson']);
    Route::post('/quizzes/{quiz}/submit',   [QuizController::class, 'submit']);
    Route::get('/quizzes/{quiz}/results',   [QuizController::class, 'results']);

    // Forum
    Route::get('/forum/posts',                   [ForumController::class, 'index']);
    Route::post('/forum/posts',                  [ForumController::class, 'store']);
    Route::get('/forum/posts/{post}',            [ForumController::class, 'show']);
    Route::post('/forum/posts/{post}/reply',     [ForumController::class, 'reply']);
    Route::post('/forum/posts/{post}/like',      [ForumController::class, 'like']);

    // ── Formateur & Admin ──────────────────────────────────────
    Route::middleware('role:instructor,admin')->group(function () {

        // Mes cours
        Route::get('/instructor/courses',                    [CourseController::class, 'myCourses']);
        Route::get('/instructor/students',                   [UserController::class, 'myStudents']);
        Route::get('/instructor/stats',                      [DashboardController::class, 'instructorStats']);

        // CRUD cours
        Route::post('/courses',                              [CourseController::class, 'store']);
        Route::put('/courses/{course}',                      [CourseController::class, 'update']);
        Route::delete('/courses/{course}',                   [CourseController::class, 'destroy']);
        Route::post('/courses/{course}/thumbnail',           [CourseController::class, 'uploadThumbnail']);
        Route::post('/courses/{course}/submit',              [CourseController::class, 'submit']);

        // CRUD sections
        Route::get('/courses/{course}/sections',             [SectionController::class, 'index']);
        Route::post('/courses/{course}/sections',            [SectionController::class, 'store']);
        Route::put('/sections/{section}',                    [SectionController::class, 'update']);
        Route::delete('/sections/{section}',                 [SectionController::class, 'destroy']);
        Route::post('/courses/{course}/sections/reorder',    [SectionController::class, 'reorder']);

        // CRUD leçons
        Route::post('/courses/{course}/lessons',             [LessonController::class, 'store']);
        Route::put('/lessons/{lesson}',                      [LessonController::class, 'update']);
        Route::delete('/lessons/{lesson}',                   [LessonController::class, 'destroy']);
        Route::post('/lessons/{lesson}/upload',              [LessonController::class, 'uploadFile']);
        Route::post('/sections/{section}/lessons/reorder',   [LessonController::class, 'reorder']);

        // CRUD quiz (formateur)
        Route::get('/quizzes/{quiz}/instructor',             [QuizController::class, 'showForInstructor']);
        Route::post('/lessons/{lesson}/quiz',                [QuizController::class, 'store']);
        Route::put('/quizzes/{quiz}',                        [QuizController::class, 'update']);
        Route::post('/quizzes/{quiz}/questions',             [QuizController::class, 'addQuestion']);
        Route::put('/quizzes/{quiz}/questions/{question}',   [QuizController::class, 'updateQuestion']);
        Route::delete('/quizzes/{quiz}/questions/{question}',[QuizController::class, 'destroyQuestion']);
    });

    // ── Admin ──────────────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/users',               [UserController::class, 'index']);
        Route::put('/admin/users/{user}',        [UserController::class, 'adminUpdate']);
        Route::delete('/admin/users/{user}',     [UserController::class, 'destroy']);
        Route::get('/admin/courses',             [CourseController::class, 'adminIndex']);
        Route::post('/admin/courses/{course}/publish', [CourseController::class, 'publish']);
        Route::post('/admin/courses/{course}/reject',  [CourseController::class, 'reject']);
        Route::delete('/admin/courses/{course}', [CourseController::class, 'destroy']);
        Route::get('/admin/stats',               [DashboardController::class, 'adminStats']);
    });
});
