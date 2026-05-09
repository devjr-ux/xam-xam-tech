<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Section;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function index(Course $course)
    {
        $this->authorize('update', $course);
        return response()->json(
            $course->sections()->with('lessons')->get()
        );
    }

    public function store(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'order' => 'nullable|integer|min:0',
        ]);

        $order = $validated['order'] ?? ($course->sections()->max('order') + 1);

        $section = $course->sections()->create([
            'title' => $validated['title'],
            'order' => $order,
        ]);

        return response()->json($section->load('lessons'), 201);
    }

    public function update(Request $request, Section $section)
    {
        $this->authorize('update', $section->course);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:200',
            'order' => 'sometimes|integer|min:0',
        ]);

        $section->update($validated);
        return response()->json($section);
    }

    public function destroy(Section $section)
    {
        $this->authorize('delete', $section->course);
        $section->delete();
        return response()->json(['message' => 'Section supprimée.']);
    }

    public function reorder(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $request->validate([
            'sections'         => 'required|array',
            'sections.*.id'    => 'required|integer|exists:sections,id',
            'sections.*.order' => 'required|integer|min:0',
        ]);

        foreach ($request->sections as $item) {
            Section::where('id', $item['id'])
                   ->where('course_id', $course->id)
                   ->update(['order' => $item['order']]);
        }

        return response()->json(['message' => 'Ordre mis à jour.']);
    }
}
