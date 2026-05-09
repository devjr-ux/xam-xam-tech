<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /** Initier le paiement pour une inscription en attente */
    public function initiate(Request $request, Enrollment $enrollment)
    {
        if ($enrollment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        if ($enrollment->payment_status === 'paid') {
            return response()->json(['message' => 'Ce cours est déjà payé.', 'has_access' => true], 200);
        }

        if ($enrollment->payment_status === 'free') {
            return response()->json(['message' => 'Ce cours est gratuit.', 'has_access' => true], 200);
        }

        $course = $enrollment->course()->with('instructor:id,name')->first();

        return response()->json([
            'enrollment_id' => $enrollment->id,
            'course'        => [
                'id'         => $course->id,
                'title'      => $course->title,
                'price'      => $course->price,
                'instructor' => $course->instructor ? $course->instructor->name : null,
            ],
            'amount'        => $course->price,
            'currency'      => 'FCFA',
            'reference'     => 'PAY-' . strtoupper(Str::random(10)),
        ]);
    }

    /**
     * Confirmer le paiement (simulation Wave / Orange Money).
     * En production, ce endpoint serait appelé par le webhook du prestataire.
     */
    public function confirm(Request $request, Enrollment $enrollment)
    {
        if ($enrollment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        if ($enrollment->payment_status === 'paid') {
            return response()->json([
                'message'    => 'Paiement déjà confirmé.',
                'has_access' => true,
            ]);
        }

        $request->validate([
            'phone'    => 'required|string|min:8|max:20',
            'method'   => 'required|in:wave,orange_money,free_money',
            'reference'=> 'nullable|string|max:100',
        ]);

        // Simulation du paiement (toujours approuvé pour la démo)
        $reference = $request->reference ?? 'PAY-' . strtoupper(Str::random(10));

        $enrollment->update([
            'payment_status'    => 'paid',
            'payment_reference' => $reference,
            'paid_at'           => now(),
        ]);

        return response()->json([
            'message'        => 'Paiement confirmé ! Vous avez maintenant accès au cours.',
            'has_access'     => true,
            'payment_status' => 'paid',
            'reference'      => $reference,
            'enrollment_id'  => $enrollment->id,
            'course_id'      => $enrollment->course_id,
        ]);
    }

    /** Vérifier le statut d'un paiement */
    public function status(Request $request, Enrollment $enrollment)
    {
        if ($enrollment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        return response()->json([
            'enrollment_id'  => $enrollment->id,
            'payment_status' => $enrollment->payment_status,
            'has_access'     => $enrollment->hasAccess(),
            'paid_at'        => $enrollment->paid_at,
        ]);
    }
}
