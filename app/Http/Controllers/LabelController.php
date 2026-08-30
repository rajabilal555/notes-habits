<?php

namespace App\Http\Controllers;

use App\Models\Label;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabelController extends Controller
{
    public function destroy(Request $request, Label $label): RedirectResponse
    {
        $this->authorize('delete', $label);

        $label->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Label deleted.')]);

        return back();
    }
}
