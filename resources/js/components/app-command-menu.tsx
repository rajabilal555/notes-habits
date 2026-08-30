import { router } from '@inertiajs/react';
import { Archive, LogOut, Settings } from 'lucide-react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command';
import { mainNavItems } from '@/config/main-nav';
import { useCommandMenu } from '@/hooks/use-command-menu';
import { logout } from '@/routes';
import { archived as notesArchived } from '@/routes/notes';
import { edit as profileEdit } from '@/routes/profile';

export function AppCommandMenu() {
    const { open, setOpen, pageActions } = useCommandMenu();

    const run = (callback: () => void) => {
        setOpen(false);
        callback();
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Search or jump to…" />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                {pageActions.length > 0 ? (
                    <>
                        <CommandGroup heading="This page">
                            {pageActions.map((action) => (
                                <CommandItem
                                    key={action.id}
                                    value={[action.label, ...(action.keywords ?? [])].join(' ')}
                                    onSelect={() => run(action.onSelect)}
                                >
                                    {action.icon ? <action.icon /> : null}
                                    <span>{action.label}</span>
                                    {action.shortcut ? (
                                        <CommandShortcut>
                                            {action.shortcut}
                                        </CommandShortcut>
                                    ) : null}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                    </>
                ) : null}

                <CommandGroup heading="Navigation">
                    {mainNavItems.map((item) => (
                        <CommandItem
                            key={item.title}
                            value={item.title}
                            onSelect={() =>
                                run(() => router.visit(item.href))
                            }
                        >
                            {item.icon ? <item.icon /> : null}
                            <span>{item.title}</span>
                        </CommandItem>
                    ))}
                    <CommandItem
                        value="Archived notes"
                        onSelect={() =>
                            run(() => router.visit(notesArchived()))
                        }
                    >
                        <Archive />
                        <span>Archived notes</span>
                    </CommandItem>
                    <CommandItem
                        value="Settings profile"
                        onSelect={() =>
                            run(() => router.visit(profileEdit()))
                        }
                    >
                        <Settings />
                        <span>Settings</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Account">
                    <CommandItem
                        value="Log out"
                        onSelect={() =>
                            run(() => router.post(logout.url()))
                        }
                    >
                        <LogOut />
                        <span>Log out</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
