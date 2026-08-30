import { useId, type SVGAttributes } from 'react';

type AppLogoIconProps = SVGAttributes<SVGElement> & {
    title?: string;
};

export default function AppLogoIcon({ title, ...props }: AppLogoIconProps) {
    const clipId = `nh-bars-${useId().replaceAll(':', '')}`;

    return (
        <svg
            viewBox="0 0 56 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role={title ? 'img' : undefined}
            aria-hidden={title ? undefined : true}
            {...props}
        >
            {title ? <title>{title}</title> : null}
            <defs>
                <clipPath id={clipId}>
                    <rect x="0" y="0" width="56" height="7.2" rx="2" />
                    <rect x="0" y="10.93" width="56" height="7.2" rx="2" />
                    <rect x="0" y="21.87" width="56" height="7.2" rx="2" />
                    <rect x="0" y="32.8" width="56" height="7.2" rx="2" />
                </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`} fill="currentColor">
                <path d="M1 0h10v40H1z" />
                <path d="M1 0h13L32 40H19L1 0z" />
                <path d="M22 0h10v40H22z" />
                <path d="M28 15h16v10H28z" />
                <path d="M45 0h10v40H45z" />
            </g>
        </svg>
    );
}
