<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role',
        'status', 'avatar', 'country', 'bio', 'phone',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function courses()      { return $this->hasMany(Course::class, 'instructor_id'); }
    public function enrollments()  { return $this->hasMany(Enrollment::class); }
    public function certificates() { return $this->hasMany(Certificate::class); }
    public function favorites()    { return $this->belongsToMany(Course::class, 'course_user_favorites'); }
    public function quizAttempts() { return $this->hasMany(QuizAttempt::class); }
    public function forumPosts()   { return $this->hasMany(ForumPost::class); }
    public function forumReplies() { return $this->hasMany(ForumReply::class); }

    public function isAdmin()      { return $this->role === 'admin'; }
    public function isInstructor() { return $this->role === 'instructor'; }
    public function isStudent()    { return $this->role === 'student'; }
}
