<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumReply extends Model
{
    protected $fillable = ['post_id', 'user_id', 'content', 'is_accepted'];

    protected $casts = ['is_accepted' => 'boolean'];

    public function user() { return $this->belongsTo(User::class); }
    public function post() { return $this->belongsTo(ForumPost::class); }
}
