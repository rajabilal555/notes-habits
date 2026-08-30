<?php

namespace App\Http\Controllers;

use App\Models\Habit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $dueToday = $user->notes()
            ->active()
            ->whereDate('reminder_at', today())
            ->orderBy('reminder_at')
            ->get(['id', 'title', 'body', 'reminder_at']);

        $habits = $user->habits()
            ->orderBy('name')
            ->get()
            ->map(fn (Habit $habit) => HabitController::habitPayload($habit));

        return Inertia::render('dashboard', [
            'dueToday' => $dueToday,
            'habits' => $habits,
        ]);
    }
}
