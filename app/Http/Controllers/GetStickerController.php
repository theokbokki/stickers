<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class GetStickerController extends Controller
{
    public function __invoke(Request $request, string $filename): BinaryFileResponse
    {
        $path = Storage::path('stickers/' . $filename);

        abort_unless(file_exists($path), 404);

        return response()->file($path);
    }
}
