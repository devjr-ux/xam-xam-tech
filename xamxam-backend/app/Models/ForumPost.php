<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumPost extends Model
{
    protected $fillable = [
        'user_id', 'category', 'title', 'content',
        'tags', 'is_pinned', 'is_solved', 'views',
    ];

    protected $casts = [
        'tags'      => 'array',
        'is_pinned' => 'boolean',
        'is_solved' => 'boolean',
    ];

    public function user()    { return $this->belongsTo(User::class); }
    public function replies() { return $this->hasMany(ForumReply::class, 'post_id'); }
    public function likes()   { return $this->belongsToMany(User::class, 'forum_post_likes'); }
}
