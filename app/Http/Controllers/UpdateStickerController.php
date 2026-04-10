<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sticker;

class UpdateStickerController extends Controller
{
    public function __invoke(Request $request, Sticker $sticker)
    {
        $sticker->update($request->validate([
            'x' => 'required|numeric',
            'y' => 'required|numeric',
        ]));

        return to_route('app');
    }
}
