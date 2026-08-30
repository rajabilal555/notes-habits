import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <AppLogoIcon className="h-6 w-auto shrink-0 fill-current" />
            <div className="ml-2 grid min-w-0 flex-1 text-left text-sm">
                <span className="truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
