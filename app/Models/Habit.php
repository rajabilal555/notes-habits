<?php

namespace App\Models;

use App\Enums\HabitCadence;
use Carbon\CarbonInterface;
use Database\Factories\HabitFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property HabitCadence $cadence
 * @property int $weekdays_mask
 */
#[Fillable(['user_id', 'name', 'cadence', 'weekdays_mask'])]
class Habit extends Model
{
    /** @use HasFactory<HabitFactory> */
    use HasFactory;

    public const HEATMAP_WEEKS = 26;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cadence' => HabitCadence::class,
            'weekdays_mask' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<HabitCompletion, $this>
     */
    public function completions(): HasMany
    {
        return $this->hasMany(HabitCompletion::class);
    }

    public function isScheduledOn(CarbonInterface $date): bool
    {
        if ($this->cadence === HabitCadence::Daily) {
            return true;
        }

        $bit = 1 << $date->dayOfWeek;

        return ($this->weekdays_mask & $bit) !== 0;
    }

    public function isCompletedOn(CarbonInterface $date): bool
    {
        return $this->completions()
            ->whereDate('completed_date', $date)
            ->exists();
    }

    public function currentStreak(): int
    {
        $date = today();
        $streak = 0;

        while (true) {
            if (! $this->isScheduledOn($date)) {
                $date = $date->copy()->subDay();

                continue;
            }

            if (! $this->isCompletedOn($date)) {
                break;
            }

            $streak++;
            $date = $date->copy()->subDay();
        }

        return $streak;
    }

    /**
     * @return list<list<array{date: string, scheduled: bool, completed: bool, future: bool}>>
     */
    public function heatmapWeeks(int $weeks = self::HEATMAP_WEEKS): array
    {
        $start = today()->subWeeks($weeks - 1)->startOfWeek(Carbon::SUNDAY);
        $grid = [];

        for ($week = 0; $week < $weeks; $week++) {
            $column = [];

            for ($day = 0; $day < 7; $day++) {
                $date = $start->copy()->addWeeks($week)->addDays($day);

                if ($date->gt(today())) {
                    $column[] = [
                        'date' => $date->toDateString(),
                        'scheduled' => false,
                        'completed' => false,
                        'future' => true,
                    ];

                    continue;
                }

                $scheduled = $this->isScheduledOn($date);

                $column[] = [
                    'date' => $date->toDateString(),
                    'scheduled' => $scheduled,
                    'completed' => $this->isCompletedOn($date),
                    'future' => false,
                ];
            }

            $grid[] = $column;
        }

        return $grid;
    }

    /**
     * @param  list<int>  $weekdayNumbers  Carbon dayOfWeek values (0=Sun … 6=Sat)
     */
    public static function maskFromWeekdays(array $weekdayNumbers): int
    {
        $mask = 0;

        foreach ($weekdayNumbers as $day) {
            $mask |= 1 << $day;
        }

        return $mask;
    }

    /**
     * @return list<int>
     */
    public function weekdayNumbers(): array
    {
        if ($this->cadence === HabitCadence::Daily) {
            return range(0, 6);
        }

        $days = [];

        for ($day = 0; $day <= 6; $day++) {
            if (($this->weekdays_mask & (1 << $day)) !== 0) {
                $days[] = $day;
            }
        }

        return $days;
    }
}
