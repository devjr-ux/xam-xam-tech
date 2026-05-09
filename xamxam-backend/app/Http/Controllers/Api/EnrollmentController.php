<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LessonCompletion;
use App\Models\Certificate;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function enroll(Request $request, Course $course)
    {
        // Sécurité : cours publié uniquement
        if ($course->status !== 'published') {
            return response()->json(['message' => 'Ce cours n\'est pas encore disponible.'], 403);
        }

        // Un formateur ne peut pas s'inscrire à son propre cours
        if ($course->instructor_id === $request->user()->id) {
            return response()->json(['message' => 'Vous êtes le formateur de ce cours.'], 403);
        }

        $user = $request->user();

        $existing = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)->first();

        if ($existing) {
            return response()->json([
                'message'        => 'Vous êtes déjà inscrit à ce cours.',
                'enrollment'     => $existing,
                'payment_status' => $existing->payment_status,
                'has_access'     => $existing->hasAccess(),
            ], 409);
        }

        $isFree          = !$course->price || $course->price <= 0;
        $paymentStatus   = $isFree ? 'free' : 'pending';

        $enrollment = Enrollment::create([
            'user_id'        => $user->id,
            'course_id'      => $course->id,
            'payment_status' => $paymentStatus,
            'progress'       => 0,
        ]);

        return response()->json([
            'enrollment'     => $enrollment,
            'payment_status' => $paymentStatus,
            'has_access'     => $enrollment->hasAccess(),
            'is_free'        => $isFree,
        ], 201);
    }

    /** Vérifier si l'apprenant a accès à un cours */
    public function checkAccess(Request $request, Course $course)
    {
        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return response()->json(['has_access' => false, 'enrolled' => false]);
        }

        return response()->json([
            'has_access'     => $enrollment->hasAccess(),
            'enrolled'       => true,
            'payment_status' => $enrollment->payment_status,
            'enrollment_id'  => $enrollment->id,
        ]);
    }

    public function progress(Request $request, Course $course)
    {
        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->with('lastLesson')
            ->firstOrFail();

        // Vérifier l'accès payant
        if (!$enrollment->hasAccess()) {
            return response()->json(['message' => 'Paiement requis pour accéder à ce cours.'], 403);
        }

        $completedLessons = LessonCompletion::where('user_id', $request->user()->id)
            ->whereHas('lesson.section', fn($q) => $q->where('course_id', $course->id))
            ->count();

        return response()->json([
            'enrollment'        => $enrollment,
            'completed_lessons' => $completedLessons,
        ]);
    }

    public function updateProgress(Request $request, Course $course)
    {
        $request->validate(['lesson_id' => 'required|exists:lessons,id']);

        $user = $request->user();

        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->firstOrFail();

        // Vérifier l'accès payant avant de marquer la progression
        if (!$enrollment->hasAccess()) {
            return response()->json(['message' => 'Paiement requis pour progresser dans ce cours.'], 403);
        }

        LessonCompletion::firstOrCreate([
            'user_id'   => $user->id,
            'lesson_id' => $request->lesson_id,
        ]);

        $totalLessons = $course->sections()
            ->withCount('lessons')
            ->get()
            ->sum('lessons_count');

        $completedCount = LessonCompletion::where('user_id', $user->id)
            ->whereHas('lesson.section', fn($q) => $q->where('course_id', $course->id))
            ->count();

        $progress = $totalLessons > 0 ? round(($completedCount / $totalLessons) * 100, 2) : 0;

        $enrollment->update([
            'progress'       => $progress,
            'last_lesson_id' => $request->lesson_id,
            'completed_at'   => $progress >= 100 ? now() : null,
        ]);

        if ($progress >= 100) {
            Certificate::firstOrCreate(
                ['user_id' => $user->id, 'course_id' => $course->id],
                ['score' => 100, 'issued_at' => now()]
            );
        }

        return response()->json([
            'progress'  => $progress,
            'completed' => $progress >= 100,
        ]);
    }

    public function myCourses(Request $request)
    {
        $enrollments = $request->user()
            ->enrollments()
            ->with(['course.instructor:id,name,avatar', 'course.category', 'lastLesson'])
            ->get();

        return response()->json($enrollments);
    }
}
