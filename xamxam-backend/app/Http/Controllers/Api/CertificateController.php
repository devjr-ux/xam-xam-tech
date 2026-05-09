<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $certificates = $request->user()
            ->certificates()
            ->with('course:id,title,thumbnail,instructor_id', 'course.instructor:id,name')
            ->latest()
            ->get();

        return response()->json($certificates);
    }

    public function show(Request $request, $id)
    {
        $cert = Certificate::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->with('course.instructor', 'user:id,name,email,country')
            ->firstOrFail();

        return response()->json($cert);
    }

    public function download(Request $request, $id)
    {
        $cert = Certificate::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->with('course', 'user')
            ->firstOrFail();

        // Return certificate data for PDF generation on frontend
        return response()->json([
            'certificate_id' => $cert->certificate_id,
            'student_name'   => $cert->user->name,
            'course_title'   => $cert->course->title,
            'instructor'     => $cert->course->instructor->name,
            'score'          => $cert->score,
            'issued_at'      => $cert->issued_at->format('d F Y'),
        ]);
    }
}
