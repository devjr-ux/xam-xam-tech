<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ForumPost;
use App\Models\ForumReply;
use Illuminate\Http\Request;

class ForumController extends Controller
{
    public function index(Request $request)
    {
        $query = ForumPost::with(['user:id,name,avatar,role', 'replies'])
            ->withCount(['replies', 'likes']);

        if ($request->category && $request->category !== 'Tous') {
            $query->where('category', $request->category);
        }

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        return response()->json(
            $query->orderByDesc('is_pinned')->latest()->paginate(15)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'title'    => 'required|string|max:200',
            'content'  => 'required|string',
            'tags'     => 'nullable|array',
        ]);

        $post = ForumPost::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'views'   => 0,
        ]);

        return response()->json($post->load('user:id,name,avatar,role'), 201);
    }

    public function show(ForumPost $post)
    {
        $post->increment('views');
        $post->load([
            'user:id,name,avatar,role',
            'replies.user:id,name,avatar,role',
        ])->loadCount(['likes', 'replies']);

        return response()->json($post);
    }

    public function reply(Request $request, ForumPost $post)
    {
        $request->validate(['content' => 'required|string']);

        $reply = ForumReply::create([
            'post_id' => $post->id,
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        return response()->json($reply->load('user:id,name,avatar,role'), 201);
    }

    public function like(Request $request, ForumPost $post)
    {
        $toggled = $post->likes()->toggle($request->user()->id);
        $liked   = count($toggled['attached']) > 0;

        return response()->json([
            'liked'      => $liked,
            'likes_count'=> $post->likes()->count(),
        ]);
    }
}
