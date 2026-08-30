<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('note_items');

        Schema::table('notes', function (Blueprint $table) {
            $table->longText('content')->nullable()->after('title');
            $table->dropColumn('body');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->text('body')->nullable()->after('title');
            $table->dropColumn('content');
        });

        Schema::create('note_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('note_id')->constrained()->cascadeOnDelete();
            $table->string('text');
            $table->boolean('is_checked')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }
};
