<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AppController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('App', [
            'images' => $this->images(),
        ]);
    }

    protected function images(): array
    {
        return collect(Storage::disk('public')->files('stickers'))
            ->filter(fn ($file) => str_ends_with($file, '.webp'))
            ->values()
            ->all();
    }
}
