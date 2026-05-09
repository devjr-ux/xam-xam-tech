<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    // ── Public: catalogue ────────────────────────────────────────
    public function index(Request $request)
    {
        $query = Course::with(['instructor:id,name,avatar', 'category'])
            ->where('status', 'published');

        if ($request->category) $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        if ($request->level)    $query->where('level', $request->level);
        if ($request->search)   $query->where('title', 'like', "%{$request->search}%");
        if ($request->sort === 'popular') $query->orderByDesc('students_count');
        if ($request->sort === 'newest')  $query->latest();

        return response()->json(
            $query->withCount('enrollments as students_count')->paginate($request->per_page ?? 12)
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

    // ── Admin: tous les cours ────────────────────────────────────
    public function adminIndex(Request $request)
    {
        $query = Course::with(['instructor:id,name', 'category'])
            ->withCount('enrollments as students_count');

        if ($request->status) $query->where('status', $request->status);
        if ($request->search) $query->where(function ($q) use ($request) {
            $q->where('title', 'like', "%{$request->search}%")
              ->orWhereHas('instructor', fn($q2) => $q2->where('name', 'like', "%{$request->search}%"));
        });

        return response()->json($query->latest()->paginate($request->per_page ?? 20));
    }

    // ── Instructor: mes cours ─────────────────────────────────────
    public function myCourses(Request $request)
    {
        $courses = Course::with(['category'])
            ->where('instructor_id', $request->user()->id)
            ->withCount('enrollments as students_count')
            ->when($request->search, fn($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate($request->per_page ?? 10);

        return response()->json($courses);
    }

    // ── Instructor: créer un cours ───────────────────────────────
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:200',
            'description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'level'       => 'required|in:Débutant,Intermédiaire,Avancé',
            'language'    => 'nullable|string|max:50',
            'price'       => 'nullable|numeric|min:0',
        ]);

        $course = Course::create(array_merge($validated, [
            'instructor_id' => $request->user()->id,
            'slug'          => Str::slug($validated['title']) . '-' . Str::random(6),
            'status'        => 'draft',
            'language'      => $validated['language'] ?? 'Français',
            'price'         => $validated['price'] ?? 0,
        ]));

        return response()->json($course->load('category'), 201);
    }

    // ── Instructor: modifier un cours ────────────────────────────
    public function update(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'title'       => 'sometimes|string|max:200',
            'description' => 'sometimes|string',
            'category_id' => 'sometimes|exists:categories,id',
            'level'       => 'sometimes|in:Débutant,Intermédiaire,Avancé',
            'language'    => 'sometimes|string|max:50',
            'price'       => 'sometimes|numeric|min:0',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        }

        $course->update($validated);
        return response()->json($course->load('category'));
    }

    // ── Instructor: upload thumbnail ─────────────────────────────
    public function uploadThumbnail(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $request->validate([
            'thumbnail' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($course->thumbnail) {
            Storage::disk('public')->delete($course->thumbnail);
        }

        $path = $request->file('thumbnail')->store('thumbnails', 'public');
        $course->update(['thumbnail' => $path]);

        return response()->json([
            'thumbnail'     => $path,
            'thumbnail_url' => Storage::url($path),
        ]);
    }

    // ── Instructor: soumettre pour validation ────────────────────
    public function submit(Course $course)
    {
        $this->authorize('update', $course);

        if ($course->status !== 'draft' && $course->status !== 'rejected') {
            return response()->json(['message' => 'Ce cours ne peut pas être soumis.'], 422);
        }

        $course->update(['status' => 'pending']);
        return response()->json(['message' => 'Cours soumis pour validation.', 'course' => $course]);
    }

    // ── Instructor: supprimer ────────────────────────────────────
    public function destroy(Course $course)
    {
        $this->authorize('delete', $course);

        if ($course->thumbnail) {
            Storage::disk('public')->delete($course->thumbnail);
        }

        $course->delete();
        return response()->json(['message' => 'Cours supprimé.']);
    }

    // ── Admin: publier ───────────────────────────────────────────
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

    // ── Student: favoris ─────────────────────────────────────────
    public function toggleFavorite(Request $request, Course $course)
    {
        $toggled = $request->user()->favorites()->toggle($course->id);
        return response()->json(['favorited' => count($toggled['attached']) > 0]);
    }

    public function favorites(Request $request)
    {
        return response()->json(
            $request->user()->favorites()->with('instructor:id,name', 'category')->get()
        );
    }
}
