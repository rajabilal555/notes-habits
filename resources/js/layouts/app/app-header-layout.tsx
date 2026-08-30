import { AppContent } from '@/components/app-content';
import { AppCommandMenu } from '@/components/app-command-menu';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { CommandMenuProvider } from '@/hooks/use-command-menu';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <CommandMenuProvider>
            <AppShell variant="header">
                <AppHeader breadcrumbs={breadcrumbs} />
                <AppContent variant="header">{children}</AppContent>
            </AppShell>
            <AppCommandMenu />
        </CommandMenuProvider>
    );
}
