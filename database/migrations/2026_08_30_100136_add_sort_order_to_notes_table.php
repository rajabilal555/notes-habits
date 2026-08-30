<?php

use App\Models\Note;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->unsignedInteger('sort_order')->default(0)->after('is_pinned');
        });

        Note::query()
            ->orderBy('user_id')
            ->orderByDesc('is_pinned')
            ->orderByDesc('updated_at')
            ->get()
            ->groupBy('user_id')
            ->each(function ($notes) {
                foreach ($notes->values() as $index => $note) {
                    $note->update(['sort_order' => $index]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }
};
