<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CreateStickerController extends Controller
{
    public function __invoke(Request $request)
    {
        $filename = Str::uuid().'.webp';

        $request->image->storeAs('stickers', $filename, 'public');

        return to_route('app', [
            'image' => 'stickers/'.$filename,
        ]);
    }
}
