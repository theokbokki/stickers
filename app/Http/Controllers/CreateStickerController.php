<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;

class CreateStickerController extends Controller
{
    public function __invoke(Request $request)
    {
        $filename = Str::uuid().'.webp';
        File::ensureDirectoryExists(Storage::disk('public')->path('images'));
        $path = Storage::disk('public')->path('images/'.$filename);

        ImageManager::usingDriver(Driver::class)
            ->decodePath($request->image->getRealPath())
            ->scale(width: 800)->encodeUsingFormat(Format::WEBP, quality: 85)
            ->save($path);

        return to_route('app', [
            'image' => 'images/'.$filename,
        ]);
    }
}
