import type { LucideIcon } from 'lucide-react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

export type CommandMenuAction = {
    id: string;
    label: string;
    icon?: LucideIcon;
    shortcut?: string;
    keywords?: string[];
    onSelect: () => void;
};

type CommandMenuContextValue = {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
    pageActions: CommandMenuAction[];
    registerPageActions: (actions: CommandMenuAction[]) => void;
};

const CommandMenuContext = createContext<CommandMenuContextValue | null>(null);

export function CommandMenuProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [pageActions, setPageActions] = useState<CommandMenuAction[]>([]);

    const toggle = useCallback(() => {
        setOpen((current) => !current);
    }, []);

    const registerPageActions = useCallback((actions: CommandMenuAction[]) => {
        setPageActions(actions);
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== 'k') {
                return;
            }

            if (!event.metaKey && !event.ctrlKey) {
                return;
            }

            event.preventDefault();
            toggle();
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [toggle]);

    const value = useMemo(
        () => ({
            open,
            setOpen,
            toggle,
            pageActions,
            registerPageActions,
        }),
        [open, toggle, pageActions, registerPageActions],
    );

    return (
        <CommandMenuContext.Provider value={value}>
            {children}
        </CommandMenuContext.Provider>
    );
}

export function useCommandMenu() {
    const context = useContext(CommandMenuContext);

    if (context === null) {
        throw new Error(
            'useCommandMenu must be used within CommandMenuProvider',
        );
    }

    return context;
}

export function useRegisterCommandActions(actions: CommandMenuAction[]) {
    const { registerPageActions } = useCommandMenu();

    useEffect(() => {
        registerPageActions(actions);

        return () => registerPageActions([]);
    }, [actions, registerPageActions]);
}
