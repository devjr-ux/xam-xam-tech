<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id', 'category_id', 'title', 'slug',
        'description', 'level', 'language', 'price',
        'thumbnail', 'status', 'rating', 'ratings_count',
    ];

    protected $casts = ['price' => 'float', 'rating' => 'float'];

    public function instructor()  { return $this->belongsTo(User::class, 'instructor_id'); }
    public function category()    { return $this->belongsTo(Category::class); }
    public function sections()    { return $this->hasMany(Section::class)->orderBy('order'); }
    public function enrollments() { return $this->hasMany(Enrollment::class); }
    public function certificates(){ return $this->hasMany(Certificate::class); }
    public function favoritedBy() { return $this->belongsToMany(User::class, 'course_user_favorites'); }

    public function getLessonsCountAttribute()
    {
        return $this->sections()->withCount('lessons')->get()->sum('lessons_count');
    }

    public function scopePublished($query) { return $query->where('status', 'published'); }
}
