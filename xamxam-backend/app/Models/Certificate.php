<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Certificate extends Model
{
    protected $fillable = ['user_id', 'course_id', 'certificate_id', 'score', 'issued_at'];

    protected $casts = ['issued_at' => 'datetime'];

    protected static function booted()
    {
        static::creating(function ($cert) {
            $cert->certificate_id = 'XXT-' . date('Y') . '-' . strtoupper(Str::random(6));
            $cert->issued_at      = $cert->issued_at ?? now();
        });
    }

    public function user()   { return $this->belongsTo(User::class); }
    public function course() { return $this->belongsTo(Course::class); }
}
