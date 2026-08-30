<?php

namespace App\Enums;

enum NoteColor: string
{
    case Default = 'default';
    case Coral = 'coral';
    case Peach = 'peach';
    case Sand = 'sand';
    case Mint = 'mint';
    case Sage = 'sage';
    case Fog = 'fog';
    case Storm = 'storm';
    case Dusk = 'dusk';
    case Blossom = 'blossom';
    case Clay = 'clay';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
