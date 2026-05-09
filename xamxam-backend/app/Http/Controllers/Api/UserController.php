<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Admin : liste tous les users
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->role)   $query->where('role', $request->role);
        if ($request->search) $query->where(fn($q) =>
            $q->where('name', 'like', "%{$request->search}%")
              ->orWhere('email', 'like', "%{$request->search}%")
        );

        return response()->json($query->latest()->paginate(20));
    }

    // Mise à jour du profil (utilisateur connecté)
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'             => 'sometimes|string|min:2|max:100',
            'phone'            => 'nullable|string|max:30',
            'country'          => 'nullable|string|max:100',
            'bio'              => 'nullable|string|max:500',
            'current_password' => 'required_with:new_password|string',
            'new_password'     => ['nullable', 'confirmed', \Illuminate\Validation\Rules\Password::min(8)->letters()->numbers()],
        ]);

        if (isset($validated['new_password'])) {
            if (! Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Mot de passe actuel incorrect.'], 422);
            }
            $validated['password'] = Hash::make($validated['new_password']);
        }

        // Sanitiser les champs texte
        if (isset($validated['name']))    $validated['name']    = strip_tags($validated['name']);
        if (isset($validated['bio']))     $validated['bio']     = strip_tags($validated['bio']);
        if (isset($validated['country'])) $validated['country'] = strip_tags($validated['country']);

        unset($validated['current_password'], $validated['new_password'], $validated['new_password_confirmation']);
        $user->update($validated);

        return response()->json($user->fresh()->only(['id','name','email','role','avatar','country','bio','phone']));
    }

    // Admin : modifier rôle/statut d'un user
    public function adminUpdate(Request $request, User $user)
    {
        $validated = $request->validate([
            'role'   => 'sometimes|in:admin,instructor,student',
            'status' => 'sometimes|in:active,suspended',
        ]);

        $user->update($validated);
        return response()->json($user);
    }

    // Admin : supprimer un user
    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Impossible de supprimer votre propre compte.'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    // Instructor : liste ses apprenants avec détails
    public function myStudents(Request $request)
    {
        $courseIds = $request->user()->courses()->pluck('id');

        $query = Enrollment::whereIn('course_id', $courseIds)
            ->with([
                'user:id,name,email,avatar,country',
                'course:id,title',
            ]);

        if ($request->search) {
            $query->whereHas('user', fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            );
        }

        if ($request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        $enrollments = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json($enrollments);
    }
}
