<?php

namespace App\Http\Controllers;

use App\Models\Sticker;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class AppController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('App', [
            'stickers' => $this->stickers()
        ]);
    }

    public function stickers(): Collection
    {
        return Sticker::all()->map(fn ($sticker) => [
            ...$sticker->toArray(),
            'src' => route('sticker.get', [
                'filename' => $sticker->src,
            ]),
        ]);
    }
}
