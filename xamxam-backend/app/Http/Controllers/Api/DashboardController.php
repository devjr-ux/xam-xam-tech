<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Certificate;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        switch ($request->user()->role) {
            case 'admin':      return $this->adminStats();
            case 'instructor': return $this->instructorStats($request);
            default:           return $this->studentStats($request->user());
        }
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
            'top_courses'        => Course::withCount('enrollments')
                ->where('status', 'published')
                ->orderByDesc('enrollments_count')
                ->take(5)->get(),
        ]);
    }

    public function instructorStats(Request $request)
    {
        $instructor = $request->user();
        $courseIds  = Course::where('instructor_id', $instructor->id)->pluck('id');

        $totalStudents = Enrollment::whereIn('course_id', $courseIds)
            ->distinct('user_id')->count('user_id');

        $totalRevenue = Course::whereIn('courses.id', $courseIds)
            ->join('enrollments', 'courses.id', '=', 'enrollments.course_id')
            ->sum('courses.price');

        $avgRating = Course::whereIn('id', $courseIds)->avg('rating') ?? 0;

        $coursesBreakdown = Course::whereIn('id', $courseIds)
            ->withCount('enrollments as students_count')
            ->with('category')
            ->latest()
            ->get();

        $quizAttempts = QuizAttempt::whereHas('quiz.lesson.section.course', function ($q) use ($instructor) {
            $q->where('instructor_id', $instructor->id);
        });

        $monthlyEnrollments = Enrollment::whereIn('course_id', $courseIds)
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as count')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($row) {
                $months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
                return [
                    'month'   => $months[$row->month - 1],
                    'year'    => $row->year,
                    'count'   => $row->count,
                ];
            });

        return response()->json([
            'total_courses'        => $courseIds->count(),
            'total_students'       => $totalStudents,
            'avg_rating'           => round($avgRating, 1),
            'total_revenue'        => $totalRevenue,
            'courses_breakdown'    => $coursesBreakdown,
            'monthly_enrollments'  => $monthlyEnrollments,
            'total_quiz_attempts'  => $quizAttempts->count(),
            'quiz_pass_rate'       => $quizAttempts->count() > 0
                ? round($quizAttempts->where('passed', true)->count() / $quizAttempts->count() * 100)
                : 0,
        ]);
    }

    private function studentStats(User $user)
    {
        return response()->json([
            'enrolled_courses' => $user->enrollments()->with('course:id,title,thumbnail')->get(),
            'certificates'     => $user->certificates()->with('course:id,title')->get(),
            'quiz_attempts'    => QuizAttempt::where('user_id', $user->id)->count(),
            'quiz_passed'      => QuizAttempt::where('user_id', $user->id)->where('passed', true)->count(),
            'avg_quiz_score'   => QuizAttempt::where('user_id', $user->id)->avg('score') ?? 0,
        ]);
    }
}
