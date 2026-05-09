<?php
// app/Http/Controllers/Api/QuizController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Certificate;
use App\Models\Lesson;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function getByLesson(Lesson $lesson)
    {
        $quiz = $lesson->quiz()->with('questions')->firstOrFail();
        // Ne pas exposer les bonnes réponses
        $quiz->questions->each(fn($q) => $q->makeHidden('correct_option'));
        return response()->json($quiz);
    }

    public function store(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'title'         => 'required|string',
            'passing_score' => 'integer|min:0|max:100',
            'duration'      => 'integer|min:1',
            'questions'     => 'required|array|min:1',
            'questions.*.question'       => 'required|string',
            'questions.*.options'        => 'required|array|min:2',
            'questions.*.correct_option' => 'required|integer|min:0',
            'questions.*.explanation'    => 'nullable|string',
        ]);

        $quiz = $lesson->quiz()->create([
            'title'         => $validated['title'],
            'passing_score' => $validated['passing_score'] ?? 60,
            'duration'      => $validated['duration'] ?? 15,
        ]);

        foreach ($validated['questions'] as $q) {
            $quiz->questions()->create($q);
        }

        return response()->json($quiz->load('questions'), 201);
    }

    public function update(Request $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz);
        $quiz->update($request->only(['title', 'passing_score', 'duration']));
        return response()->json($quiz);
    }

    public function submit(Request $request, Quiz $quiz)
    {
        $request->validate([
            'answers' => 'required|array',
        ]);

        $quiz->load('questions');
        $user    = $request->user();
        $answers = $request->answers;
        $correct = 0;
        $total   = $quiz->questions->count();
        $details = [];

        foreach ($quiz->questions as $i => $question) {
            $userAnswer    = $answers[$i] ?? null;
            $isCorrect     = $userAnswer === $question->correct_option;
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

        $attempt = QuizAttempt::create([
            'user_id'   => $user->id,
            'quiz_id'   => $quiz->id,
            'score'     => $score,
            'passed'    => $passed,
            'answers'   => $answers,
            'details'   => $details,
        ]);

        // Générer le certificat si le cours est complété et quiz passé
        if ($passed) {
            $course = $quiz->lesson->section->course;
            $enrolled = $user->enrollments()->where('course_id', $course->id)->first();
            if ($enrolled && $enrolled->progress >= 100) {
                Certificate::firstOrCreate(
                    ['user_id' => $user->id, 'course_id' => $course->id],
                    ['score' => $score, 'issued_at' => now()]
                );
            }
        }

        return response()->json([
            'score'   => $score,
            'passed'  => $passed,
            'correct' => $correct,
            'total'   => $total,
            'details' => $details,
        ]);
    }

    public function results(Quiz $quiz)
    {
        $attempt = QuizAttempt::where('user_id', auth()->id())
            ->where('quiz_id', $quiz->id)
            ->latest()
            ->firstOrFail();
        return response()->json($attempt);
    }
}
