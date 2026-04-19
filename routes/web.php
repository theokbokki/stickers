<?php

use App\Http\Controllers\GetStickerController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AppController;
use App\Http\Controllers\CreateStickerController;
use App\Http\Controllers\UpdateStickerController;

Route::get('/', AppController::class)->name('app');

Route::post('/stickers/create', CreateStickerController::class)->name('stickers.create');
Route::post('/stickers/{sticker}', UpdateStickerController::class)->name('stickers.update');
Route::get('/stickers/{filename}', GetStickerController::class)->name('sticker.get');
