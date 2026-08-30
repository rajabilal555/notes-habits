<?php

namespace App\Policies;

use App\Models\Label;
use App\Models\User;

class LabelPolicy
{
    public function delete(User $user, Label $label): bool
    {
        return $user->id === $label->user_id;
    }
}
