<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    protected $fillable = [
        'section_id', 'title', 'type',
        'video_url', 'pdf_url', 'duration',
        'is_free', 'order',
    ];

    protected $casts = ['is_free' => 'boolean'];

    public function section()     { return $this->belongsTo(Section::class); }
    public function quiz()        { return $this->hasOne(Quiz::class); }
    public function completions() { return $this->hasMany(LessonCompletion::class); }
}
