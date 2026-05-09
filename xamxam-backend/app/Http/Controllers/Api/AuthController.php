<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|min:2|max:100',
            'email'    => 'required|email|max:191|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'role'     => 'nullable|string|in:student,instructor',
        ]);

        $user  = User::create([
            'name'     => strip_tags($validated['name']),
            'email'    => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'role'     => $validated['role'] ?? 'student',
        ]);

        $token = $user->createToken('xamxam_token')->plainTextToken;

        return response()->json([
            'user'  => $user->only(['id', 'name', 'email', 'role', 'avatar']),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', strtolower(trim($request->email)))->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email ou mot de passe incorrect.'],
            ]);
        }

        if ($user->status === 'suspended') {
            return response()->json(['message' => 'Votre compte a été suspendu. Contactez l\'administration.'], 403);
        }

        // Révoquer les anciens tokens (optionnel — sécurité session unique)
        // $user->tokens()->delete();

        $token = $user->createToken('xamxam_token')->plainTextToken;

        return response()->json([
            'user'  => $user->only(['id', 'name', 'email', 'role', 'avatar', 'country', 'bio', 'phone']),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    public function me(Request $request)
    {
        return response()->json(
            $request->user()->only(['id', 'name', 'email', 'role', 'avatar', 'country', 'bio', 'phone', 'status'])
        );
    }
}
