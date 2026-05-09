<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LessonController extends Controller
{
    public function store(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'title'      => 'required|string|max:200',
            'type'       => 'required|in:video,pdf,quiz',
            'video_url'  => 'nullable|string|max:500',
            'pdf_url'    => 'nullable|string|max:500',
            'duration'   => 'nullable|integer|min:0',
            'is_free'    => 'boolean',
            'order'      => 'nullable|integer|min:0',
        ]);

        $section = Section::findOrFail($validated['section_id']);
        if ($section->course_id !== $course->id) {
            return response()->json(['message' => 'Section invalide.'], 422);
        }

        $order = $validated['order'] ?? ($section->lessons()->max('order') + 1);
        $lesson = Lesson::create(array_merge($validated, ['order' => $order]));

        return response()->json($lesson, 201);
    }

    public function update(Request $request, Lesson $lesson)
    {
        $this->authorize('update', $lesson->section->course);

        $lesson->update($request->only([
            'title', 'type', 'video_url', 'pdf_url', 'duration', 'is_free', 'order'
        ]));

        return response()->json($lesson);
    }

    public function destroy(Lesson $lesson)
    {
        $this->authorize('delete', $lesson->section->course);

        if ($lesson->pdf_url && !str_starts_with($lesson->pdf_url, 'http')) {
            Storage::disk('public')->delete($lesson->pdf_url);
        }

        $lesson->delete();
        return response()->json(['message' => 'Leçon supprimée.']);
    }

    public function uploadFile(Request $request, Lesson $lesson)
    {
        $this->authorize('update', $lesson->section->course);

        $request->validate([
            'file' => 'required|file|max:102400',
            'type' => 'required|in:video,pdf',
        ]);

        $field = $request->type === 'video' ? 'video_url' : 'pdf_url';

        if ($lesson->$field && !str_starts_with($lesson->$field, 'http')) {
            Storage::disk('public')->delete($lesson->$field);
        }

        $dir  = $request->type === 'video' ? 'lessons/videos' : 'lessons/pdfs';
        $path = $request->file('file')->store($dir, 'public');

        $lesson->update([$field => $path]);

        return response()->json([
            'path' => $path,
            'url'  => Storage::url($path),
        ]);
    }

    public function reorder(Request $request, Section $section)
    {
        $this->authorize('update', $section->course);

        $request->validate([
            'lessons'         => 'required|array',
            'lessons.*.id'    => 'required|integer|exists:lessons,id',
            'lessons.*.order' => 'required|integer|min:0',
        ]);

        foreach ($request->lessons as $item) {
            Lesson::where('id', $item['id'])
                  ->where('section_id', $section->id)
                  ->update(['order' => $item['order']]);
        }

        return response()->json(['message' => 'Ordre mis à jour.']);
    }
}
