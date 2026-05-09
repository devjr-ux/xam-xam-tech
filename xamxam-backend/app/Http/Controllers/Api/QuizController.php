<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\Certificate;
use App\Models\Lesson;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    // ── Formateur: voir quiz complet (avec bonnes réponses) ───────
    public function showForInstructor(Quiz $quiz)
    {
        $this->authorize('update', $quiz->lesson->section->course);
        return response()->json($quiz->load('questions'));
    }

    // ── Apprenant: voir quiz (sans bonnes réponses) ───────────────
    public function getByLesson(Lesson $lesson)
    {
        $quiz = $lesson->quiz()->with('questions')->firstOrFail();
        $quiz->questions->each(fn($q) => $q->makeHidden('correct_option'));
        return response()->json($quiz);
    }

    // ── Formateur: créer un quiz pour une leçon ───────────────────
    public function store(Request $request, Lesson $lesson)
    {
        $this->authorize('update', $lesson->section->course);

        $validated = $request->validate([
            'title'         => 'required|string|max:200',
            'passing_score' => 'integer|min:0|max:100',
            'duration'      => 'integer|min:1',
            'questions'     => 'required|array|min:1',
            'questions.*.question'       => 'required|string',
            'questions.*.options'        => 'required|array|min:2',
            'questions.*.correct_option' => 'required|integer|min:0',
            'questions.*.explanation'    => 'nullable|string',
            'questions.*.points'         => 'nullable|integer|min:1',
        ]);

        if ($lesson->quiz()->exists()) {
            return response()->json(['message' => 'Ce leçon a déjà un quiz.'], 422);
        }

        $quiz = $lesson->quiz()->create([
            'title'         => $validated['title'],
            'passing_score' => $validated['passing_score'] ?? 60,
            'duration'      => $validated['duration'] ?? 15,
        ]);

        foreach ($validated['questions'] as $q) {
            $quiz->questions()->create([
                'question'       => $q['question'],
                'options'        => $q['options'],
                'correct_option' => $q['correct_option'],
                'explanation'    => $q['explanation'] ?? null,
                'points'         => $q['points'] ?? 1,
            ]);
        }

        return response()->json($quiz->load('questions'), 201);
    }

    // ── Formateur: modifier le quiz ───────────────────────────────
    public function update(Request $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz->lesson->section->course);

        $quiz->update($request->only(['title', 'passing_score', 'duration']));

        if ($request->has('questions')) {
            $request->validate([
                'questions'                  => 'array',
                'questions.*.question'       => 'required|string',
                'questions.*.options'        => 'required|array|min:2',
                'questions.*.correct_option' => 'required|integer|min:0',
                'questions.*.explanation'    => 'nullable|string',
                'questions.*.points'         => 'nullable|integer|min:1',
            ]);

            $quiz->questions()->delete();
            foreach ($request->questions as $q) {
                $quiz->questions()->create([
                    'question'       => $q['question'],
                    'options'        => $q['options'],
                    'correct_option' => $q['correct_option'],
                    'explanation'    => $q['explanation'] ?? null,
                    'points'         => $q['points'] ?? 1,
                ]);
            }
        }

        return response()->json($quiz->load('questions'));
    }

    // ── Formateur: ajouter une question ───────────────────────────
    public function addQuestion(Request $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz->lesson->section->course);

        $validated = $request->validate([
            'question'       => 'required|string',
            'options'        => 'required|array|min:2',
            'correct_option' => 'required|integer|min:0',
            'explanation'    => 'nullable|string',
            'points'         => 'nullable|integer|min:1',
        ]);

        $question = $quiz->questions()->create($validated);
        return response()->json($question, 201);
    }

    // ── Formateur: modifier une question ──────────────────────────
    public function updateQuestion(Request $request, Quiz $quiz, QuizQuestion $question)
    {
        $this->authorize('update', $quiz->lesson->section->course);

        $question->update($request->only([
            'question', 'options', 'correct_option', 'explanation', 'points'
        ]));

        return response()->json($question);
    }

    // ── Formateur: supprimer une question ─────────────────────────
    public function destroyQuestion(Quiz $quiz, QuizQuestion $question)
    {
        $this->authorize('update', $quiz->lesson->section->course);
        $question->delete();
        return response()->json(['message' => 'Question supprimée.']);
    }

    // ── Apprenant: soumettre un quiz ──────────────────────────────
    public function submit(Request $request, Quiz $quiz)
    {
        $request->validate(['answers' => 'required|array']);

        // Vérifier que l'apprenant a accès payant au cours
        $course = $quiz->lesson->section->course;
        $enrollment = \App\Models\Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment || !$enrollment->hasAccess()) {
            return response()->json([
                'message' => 'Vous devez être inscrit et avoir payé ce cours pour accéder aux quiz.',
            ], 403);
        }

        $quiz->load('questions');
        $user    = $request->user();
        $answers = $request->answers;
        $correct = 0;
        $total   = $quiz->questions->count();
        $details = [];

        foreach ($quiz->questions as $i => $question) {
            $userAnswer = $answers[$i] ?? null;
            $isCorrect  = $userAnswer === $question->correct_option;
            if ($isCorrect) $correct++;
            $details[] = [
                'question_id'    => $question->id,
                'user_answer'    => $userAnswer,
                'correct_answer' => $question->correct_option,
                'is_correct'     => $isCorrect,
                'explanation'    => $question->explanation,
            ];
        }

        $score  = $total > 0 ? round(($correct / $total) * 100) : 0;
        $passed = $score >= $quiz->passing_score;

        QuizAttempt::create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score'   => $score,
            'passed'  => $passed,
            'answers' => $answers,
            'details' => $details,
        ]);

        if ($passed) {
            $course   = $quiz->lesson->section->course;
            $enrolled = $user->enrollments()->where('course_id', $course->id)->first();
            if ($enrolled && $enrolled->progress >= 100) {
                Certificate::firstOrCreate(
                    ['user_id' => $user->id, 'course_id' => $course->id],
                    ['score' => $score, 'issued_at' => now()]
                );
            }
        }

        return response()->json([
            'score' => $score, 'passed' => $passed,
            'correct' => $correct, 'total' => $total, 'details' => $details,
        ]);
    }

    public function results(Quiz $quiz)
    {
        $attempt = QuizAttempt::where('user_id', auth()->id())
            ->where('quiz_id', $quiz->id)
            ->latest()->firstOrFail();
        return response()->json($attempt);
    }
}
