<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AppController;
use App\Http\Controllers\CreateStickerController;

Route::get('/', AppController::class)->name('app');

Route::post('/create-sticker', CreateStickerController::class)->name('create-sticker');
