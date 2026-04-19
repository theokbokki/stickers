<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Sticker;

class CreateStickerController extends Controller
{
    public function __invoke(Request $request)
    {
        $filename = Str::uuid().'.webp';

        $request->image->storeAs('stickers', $filename);

        Sticker::query()->create([
            'src' => $filename,
        ]);

        return to_route('app');
    }
}
