export type HeatmapCell = {
    date: string;
    scheduled: boolean;
    completed: boolean;
    future: boolean;
};

export type Habit = {
    id: number;
    name: string;
    cadence: 'daily' | 'weekdays';
    weekdays: number[];
    streak: number;
    completed_today: boolean;
    scheduled_today: boolean;
    heatmap: HeatmapCell[][];
};
