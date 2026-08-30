<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHabitRequest;
use App\Http\Requests\UpdateHabitRequest;
use App\Models\Habit;
use App\Models\HabitCompletion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HabitController extends Controller
{
    public function index(Request $request): Response
    {
        $habits = $request->user()
            ->habits()
            ->orderBy('name')
            ->get()
            ->map(fn (Habit $habit) => $this->habitPayload($habit));

        return Inertia::render('habits/index', [
            'habits' => $habits,
        ]);
    }

    public function store(StoreHabitRequest $request): RedirectResponse
    {
        $request->user()->habits()->create($this->habitAttributes($request->validated()));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Habit created.')]);

        return to_route('habits.index');
    }

    public function update(UpdateHabitRequest $request, Habit $habit): RedirectResponse
    {
        $this->authorize('update', $habit);

        $habit->update($this->habitAttributes($request->validated()));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Habit updated.')]);

        return to_route('habits.index');
    }

    public function destroy(Request $request, Habit $habit): RedirectResponse
    {
        $this->authorize('delete', $habit);

        $habit->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Habit deleted.')]);

        return to_route('habits.index');
    }

    public function toggleCompletion(Request $request, Habit $habit): RedirectResponse
    {
        $this->authorize('update', $habit);

        $today = today();
        $completion = $habit->completions()->whereDate('completed_date', $today)->first();

        if ($completion) {
            $completion->delete();
        } else {
            HabitCompletion::query()->create([
                'habit_id' => $habit->id,
                'completed_date' => $today,
            ]);
        }

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    public static function habitPayload(Habit $habit): array
    {
        return [
            'id' => $habit->id,
            'name' => $habit->name,
            'cadence' => $habit->cadence->value,
            'weekdays' => $habit->weekdayNumbers(),
            'streak' => $habit->currentStreak(),
            'completed_today' => $habit->isCompletedOn(today()),
            'scheduled_today' => $habit->isScheduledOn(today()),
            'heatmap' => $habit->heatmapWeeks(),
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function habitAttributes(array $validated): array
    {
        return [
            'name' => $validated['name'],
            'cadence' => $validated['cadence'],
            'weekdays_mask' => $validated['cadence'] === 'weekdays'
                ? Habit::maskFromWeekdays($validated['weekdays'] ?? [])
                : 0,
        ];
    }
}
