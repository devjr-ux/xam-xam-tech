<?php
// app/Http/Controllers/Api/DashboardController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Certificate;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return match ($user->role) {
            'admin'      => $this->adminStats(),
            'instructor' => $this->instructorStats($request),
            default      => $this->studentStats($user),
        };
    }

    private function adminStats()
    {
        return response()->json([
            'total_users'        => User::count(),
            'total_students'     => User::where('role', 'student')->count(),
            'total_instructors'  => User::where('role', 'instructor')->count(),
            'total_courses'      => Course::where('status', 'published')->count(),
            'pending_courses'    => Course::where('status', 'pending')->count(),
            'total_enrollments'  => Enrollment::count(),
            'total_certificates' => Certificate::count(),
            'recent_users'       => User::latest()->take(5)->get(['id','name','email','role','created_at']),
            'top_courses'        => Course::withCount('enrollments')->where('status','published')->orderByDesc('enrollments_count')->take(5)->get(),
        ]);
    }

    public function instructorStats(Request $request)
    {
        $instructor = $request->user();
        $courseIds  = Course::where('instructor_id', $instructor->id)->pluck('id');

        return response()->json([
            'total_courses'      => $courseIds->count(),
            'total_students'     => Enrollment::whereIn('course_id', $courseIds)->distinct('user_id')->count(),
            'avg_rating'         => Course::whereIn('id', $courseIds)->avg('rating'),
            'total_revenue'      => Course::whereIn('id', $courseIds)->sum(\DB::raw('price * (SELECT COUNT(*) FROM enrollments WHERE course_id = courses.id)')),
            'courses_breakdown'  => Course::whereIn('id', $courseIds)->withCount('enrollments')->get(),
        ]);
    }

    private function studentStats(User $user)
    {
        return response()->json([
            'enrolled_courses'   => $user->enrollments()->with('course:id,title,thumbnail')->get(),
            'certificates'       => $user->certificates()->with('course:id,title')->get(),
            'quiz_attempts'      => QuizAttempt::where('user_id', $user->id)->count(),
            'quiz_passed'        => QuizAttempt::where('user_id', $user->id)->where('passed', true)->count(),
            'avg_quiz_score'     => QuizAttempt::where('user_id', $user->id)->avg('score'),
        ]);
    }
}
