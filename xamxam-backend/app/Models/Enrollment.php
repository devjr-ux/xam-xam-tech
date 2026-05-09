<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    protected $fillable = [
        'user_id', 'course_id', 'payment_status',
        'payment_reference', 'paid_at',
        'progress', 'last_lesson_id', 'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'paid_at'      => 'datetime',
        'progress'     => 'float',
    ];

    public function user()       { return $this->belongsTo(User::class); }
    public function course()     { return $this->belongsTo(Course::class); }
    public function lastLesson() { return $this->belongsTo(Lesson::class, 'last_lesson_id'); }

    /** Vérifie si l'apprenant a accès au contenu du cours */
    public function hasAccess(): bool
    {
        return in_array($this->payment_status, ['free', 'paid']);
    }
}
