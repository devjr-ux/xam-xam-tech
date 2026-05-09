<?php
// app/Http/Controllers/Api/CourseController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with(['instructor:id,name,avatar', 'category'])
            ->where('status', 'published');

        if ($request->category)  $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        if ($request->level)     $query->where('level', $request->level);
        if ($request->search)    $query->where('title', 'like', "%{$request->search}%");
        if ($request->sort === 'popular') $query->orderByDesc('students_count');
        if ($request->sort === 'newest')  $query->latest();

        return response()->json(
            $query->withCount('enrollments as students_count')
                  ->paginate($request->per_page ?? 12)
        );
    }

    public function show(Course $course)
    {
        $course->load([
            'instructor:id,name,avatar,bio',
            'category',
            'sections.lessons',
        ])->loadCount('enrollments as students_count');

        return response()->json($course);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:200',
            'description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'level'       => 'required|in:Débutant,Intermédiaire,Avancé',
            'price'       => 'nullable|numeric|min:0',
            'language'    => 'string|max:50',
        ]);

        $course = Course::create([
            ...$validated,
            'instructor_id' => $request->user()->id,
            'slug'          => Str::slug($validated['title']) . '-' . Str::random(6),
            'status'        => 'draft',
        ]);

        return response()->json($course, 201);
    }

    public function update(Request $request, Course $course)
    {
        $this->authorize('update', $course);
        $course->update($request->only(['title', 'description', 'price', 'level', 'language', 'thumbnail']));
        return response()->json($course);
    }

    public function destroy(Course $course)
    {
        $this->authorize('delete', $course);
        $course->delete();
        return response()->json(['message' => 'Cours supprimé.']);
    }

    public function publish(Course $course)
    {
        $course->update(['status' => 'published']);
        return response()->json(['message' => 'Cours publié.']);
    }

    public function reject(Course $course)
    {
        $course->update(['status' => 'rejected']);
        return response()->json(['message' => 'Cours refusé.']);
    }

    public function toggleFavorite(Request $request, Course $course)
    {
        $user = $request->user();
        $toggled = $user->favorites()->toggle($course->id);
        $isFav   = count($toggled['attached']) > 0;
        return response()->json(['favorited' => $isFav]);
    }

    public function favorites(Request $request)
    {
        return response()->json(
            $request->user()->favorites()->with('instructor:id,name', 'category')->get()
        );
    }
}
