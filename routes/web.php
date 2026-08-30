<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HabitController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\NoteItemController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('notes', [NoteController::class, 'index'])->name('notes.index');
    Route::get('notes/archived', [NoteController::class, 'archived'])->name('notes.archived');
    Route::post('notes', [NoteController::class, 'store'])->name('notes.store');
    Route::patch('notes/reorder', [NoteController::class, 'reorder'])->name('notes.reorder');
    Route::patch('notes/{note}', [NoteController::class, 'update'])->name('notes.update');
    Route::patch('notes/{note}/items/{item}', [NoteItemController::class, 'update'])->name('notes.items.update');
    Route::patch('notes/{note}/archive', [NoteController::class, 'archive'])->name('notes.archive');
    Route::patch('notes/{note}/unarchive', [NoteController::class, 'unarchive'])->name('notes.unarchive');
    Route::delete('notes/{note}', [NoteController::class, 'destroy'])->name('notes.destroy');
    Route::get('habits', [HabitController::class, 'index'])->name('habits.index');
    Route::post('habits', [HabitController::class, 'store'])->name('habits.store');
    Route::patch('habits/{habit}', [HabitController::class, 'update'])->name('habits.update');
    Route::patch('habits/{habit}/toggle', [HabitController::class, 'toggleCompletion'])->name('habits.toggle');
    Route::delete('habits/{habit}', [HabitController::class, 'destroy'])->name('habits.destroy');
});

require __DIR__.'/settings.php';
