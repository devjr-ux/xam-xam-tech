<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(
            Category::withCount(['courses' => fn($q) => $q->where('status', 'published')])->get()
        );
    }
}
