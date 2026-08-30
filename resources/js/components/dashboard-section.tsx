import type { ReactNode } from 'react';

export function DashboardSection({
    title,
    description,
    action,
    children,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-5">
            <header className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                        {title}
                    </h2>
                    {description ? (
                        <p className="text-muted-foreground mt-1 text-sm">
                            {description}
                        </p>
                    ) : null}
                </div>
                {action ? <div className="shrink-0">{action}</div> : null}
            </header>
            {children}
        </section>
    );
}
