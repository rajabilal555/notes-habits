import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login, register } from '@/routes';
import '../../css/landing.css';

const GITHUB_URL = 'https://github.com/rajabilal555/notes-habits';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <div className="landing" data-theme="hum">
            <Head title="N&H — Notes & Habits" />

            <header className="landing__nav">
                <Link href="/" className="landing__wordmark">
                    <AppLogoIcon className="landing__logo" title="N&H" />
                </Link>
                {auth.user ? (
                    <Link href={dashboard()} className="landing__nav-cta">
                        Dashboard
                    </Link>
                ) : (
                    <Link href={login()} className="landing__nav-cta">
                        Sign in
                    </Link>
                )}
            </header>

            <section className="landing__hero" aria-labelledby="hero-title">
                <div className="landing__hero-grid">
                    <div className="landing__hero-copy">
                        <h1 id="hero-title" className="landing__hero-title">
                            Notes for thought. Habits for rhythm.
                        </h1>
                        <div
                            className="landing__hero-rule"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="landing__hero-aside">
                        <div
                            className="landing__mark"
                            aria-hidden="true"
                            role="presentation"
                        />
                        <p className="landing__hero-lede">
                            A small open-source app for jotting reminders and
                            keeping daily habits honest. Self-host it, or run it
                            locally.
                        </p>
                        {!auth.user && (
                            <div className="landing__hero-actions">
                                <Link href={register()} className="btn">
                                    Create account
                                    <span
                                        className="btn__arrow"
                                        aria-hidden="true"
                                    >
                                        →
                                    </span>
                                </Link>
                                <a
                                    href={GITHUB_URL}
                                    className="btn btn--outline"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Source
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section
                className="landing__section landing__section--band"
                aria-labelledby="workflow-title"
            >
                <div className="landing__section-inner">
                    <h2 id="workflow-title" className="landing__section-title">
                        Three moves, one quiet day.
                    </h2>
                    <ol className="landing__steps">
                        <li className="landing__step">
                            <span className="landing__stage">1.0</span>
                            <div className="landing__step-body">
                                <h3 className="landing__step-title">Capture</h3>
                                <p className="landing__step-text">
                                    Write notes with labels, colours, and
                                    reminders. Pin what matters, archive what
                                    does not.
                                </p>
                            </div>
                        </li>
                        <li className="landing__step">
                            <span className="landing__stage">2.0</span>
                            <div className="landing__step-body">
                                <h3 className="landing__step-title">Track</h3>
                                <p className="landing__step-text">
                                    Mark habits daily and watch the heatmap fill
                                    in. Small repeats, kept for a long time.
                                </p>
                            </div>
                        </li>
                        <li className="landing__step">
                            <span className="landing__stage">3.0</span>
                            <div className="landing__step-body">
                                <h3 className="landing__step-title">Review</h3>
                                <p className="landing__step-text">
                                    The dashboard gathers what is due today:
                                    notes with reminders and habits waiting on
                                    you.
                                </p>
                            </div>
                        </li>
                    </ol>
                </div>
            </section>

            <section className="landing__section" aria-labelledby="oss-title">
                <h2 id="oss-title" className="landing__section-title">
                    Open source, no pitch deck.
                </h2>
                <p className="landing__oss">
                    N&H is a personal project, not a product launch. The code
                    lives on{' '}
                    <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                        GitHub
                    </a>
                    . Fork it, break it, make it yours.
                </p>
                {!auth.user && (
                    <div className="landing__cta-row">
                        <Link href={register()} className="btn btn--cyan">
                            Get started
                            <span className="btn__arrow" aria-hidden="true">
                                →
                            </span>
                        </Link>
                        <Link href={login()} className="btn btn--soft">
                            I have an account
                        </Link>
                    </div>
                )}
            </section>

            <footer className="landing__foot">
                <p>
                    <span>© {new Date().getFullYear()} N&H</span>
                    <span className="landing__foot-sep" aria-hidden="true">
                        ·
                    </span>
                    <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                        GitHub
                    </a>
                    <span className="landing__foot-sep" aria-hidden="true">
                        ·
                    </span>
                    <span>MIT licensed</span>
                </p>
            </footer>
        </div>
    );
}
