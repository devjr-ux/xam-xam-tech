<?php
/*
 * ─────────────────────────────────────────────────────────────
 *  XamXam Tech — Modèles Eloquent Laravel
 * ─────────────────────────────────────────────────────────────
 */

// ── app/Models/User.php ──────────────────────────────────────
namespace App\Models;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable {
    use HasApiTokens, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'status', 'avatar', 'country', 'bio', 'phone'];
    protected $hidden   = ['password', 'remember_token'];

    public function courses()     { return $this->hasMany(Course::class, 'instructor_id'); }
    public function enrollments() { return $this->hasMany(Enrollment::class); }
    public function certificates(){ return $this->hasMany(Certificate::class); }
    public function favorites()   { return $this->belongsToMany(Course::class, 'course_user_favorites'); }
    public function quizAttempts(){ return $this->hasMany(QuizAttempt::class); }
    public function forumPosts()  { return $this->hasMany(ForumPost::class); }
    public function isAdmin()     { return $this->role === 'admin'; }
    public function isInstructor(){ return $this->role === 'instructor'; }
}

// ── app/Models/Course.php ────────────────────────────────────
class Course extends \Illuminate\Database\Eloquent\Model {
    protected $fillable = ['instructor_id','category_id','title','slug','description','level','language','price','thumbnail','status','rating','ratings_count'];

    public function instructor()  { return $this->belongsTo(User::class, 'instructor_id'); }
    public function category()    { return $this->belongsTo(Category::class); }
    public function sections()    { return $this->hasMany(Section::class)->orderBy('order'); }
    public function enrollments() { return $this->hasMany(Enrollment::class); }
    public function certificates(){ return $this->hasMany(Certificate::class); }
    public function favoritedBy() { return $this->belongsToMany(User::class, 'course_user_favorites'); }

    public function getLessonsCountAttribute() {
        return $this->sections()->withCount('lessons')->get()->sum('lessons_count');
    }
}

// ── app/Models/Section.php ───────────────────────────────────
class Section extends \Illuminate\Database\Eloquent\Model {
    protected $fillable = ['course_id', 'title', 'order'];
    public function course()  { return $this->belongsTo(Course::class); }
    public function lessons() { return $this->hasMany(Lesson::class)->orderBy('order'); }
}

// ── app/Models/Lesson.php ────────────────────────────────────
class Lesson extends \Illuminate\Database\Eloquent\Model {
    protected $fillable = ['section_id','title','type','video_url','pdf_url','duration','is_free','order'];
    public function section()     { return $this->belongsTo(Section::class); }
    public function quiz()        { return $this->hasOne(Quiz::class); }
    public function completions() { return $this->hasMany(LessonCompletion::class); }
}

// ── app/Models/Enrollment.php ────────────────────────────────
class Enrollment extends \Illuminate\Database\Eloquent\Model {
    protected $fillable = ['user_id', 'course_id', 'progress', 'last_lesson_id', 'completed_at'];
    public function user()       { return $this->belongsTo(User::class); }
    public function course()     { return $this->belongsTo(Course::class); }
    public function lastLesson() { return $this->belongsTo(Lesson::class, 'last_lesson_id'); }
}

// ── app/Models/Quiz.php ──────────────────────────────────────
class Quiz extends \Illuminate\Database\Eloquent\Model {
    protected $fillable = ['lesson_id', 'title', 'passing_score', 'duration'];
    public function lesson()    { return $this->belongsTo(Lesson::class); }
    public function questions() { return $this->hasMany(QuizQuestion::class); }
    public function attempts()  { return $this->hasMany(QuizAttempt::class); }
}

// ── app/Models/QuizQuestion.php ──────────────────────────────
class QuizQuestion extends \Illuminate\Database\Eloquent\Model {
    protected $fillable = ['quiz_id', 'question', 'options', 'correct_option', 'explanation', 'points'];
    protected $casts    = ['options' => 'array'];
}

// ── app/Models/QuizAttempt.php ───────────────────────────────
class QuizAttempt extends \Illuminate\Database\Eloquent\Model {
    protected $fillable = ['user_id', 'quiz_id', 'score', 'passed', 'answers', 'details'];
    protected $casts    = ['answers' => 'array', 'details' => 'array', 'passed' => 'boolean'];
    public function user() { return $this->belongsTo(User::class); }
    public function quiz() { return $this->belongsTo(Quiz::class); }
}

// ── app/Models/Certificate.php ───────────────────────────────
class Certificate extends \Illuminate\Database\Eloquent\Model {
    protected $fillable = ['user_id', 'course_id', 'certificate_id', 'score', 'issued_at'];
    protected $casts    = ['issued_at' => 'datetime'];

    protected static function booted() {
        static::creating(function ($cert) {
            $cert->certificate_id = 'XXT-' . date('Y') . '-' . strtoupper(\Illuminate\Support\Str::random(6));
        });
    }

    public function user()   { return $this->belongsTo(User::class); }
    public function course() { return $this->belongsTo(Course::class); }
}

// ── app/Models/ForumPost.php ─────────────────────────────────
class ForumPost extends \Illuminate\Database\Eloquent\Model {
    protected $fillable = ['user_id','category','title','content','tags','is_pinned','is_solved','views'];
    protected $casts    = ['tags' => 'array', 'is_pinned' => 'boolean', 'is_solved' => 'boolean'];
    public function user()    { return $this->belongsTo(User::class); }
    public function replies() { return $this->hasMany(ForumReply::class, 'post_id'); }
}

// ── app/Models/ForumReply.php ────────────────────────────────
class ForumReply extends \Illuminate\Database\Eloquent\Model {
    protected $fillable = ['post_id', 'user_id', 'content', 'is_accepted'];
    public function user() { return $this->belongsTo(User::class); }
    public function post() { return $this->belongsTo(ForumPost::class); }
}
