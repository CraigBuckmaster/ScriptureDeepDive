/**
 * App.tsx — Admin Moderation Dashboard shell.
 *
 * Basic layout with sidebar navigation and main content area.
 * Full implementation is pending.
 */

import React, { useState } from 'react';

type Page = 'queue' | 'users' | 'settings';

const NAV_ITEMS: { key: Page; label: string }[] = [
  { key: 'queue', label: 'Queue' },
  { key: 'users', label: 'Users' },
  { key: 'settings', label: 'Settings' },
];

export default function App() {
  const [activePage, setActivePage] = useState<Page>('queue');

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <nav style={styles.sidebar}>
        <h2 style={styles.logo}>SDD Moderation</h2>
        <ul style={styles.navList}>
          {NAV_ITEMS.map(({ key, label }) => (
            <li key={key}>
              <button
                onClick={() => setActivePage(key)}
                style={{
                  ...styles.navButton,
                  ...(activePage === key ? styles.navButtonActive : {}),
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main content */}
      <main style={styles.main}>
        <h1 style={styles.heading}>Moderation Dashboard</h1>
        <p style={styles.subheading}>
          {activePage === 'queue' && 'Submission review queue — Coming Soon'}
          {activePage === 'users' && 'User management — Coming Soon'}
          {activePage === 'settings' && 'Moderation settings — Coming Soon'}
        </p>
        <div style={styles.placeholder}>
          <p>This dashboard will provide tools for:</p>
          <ul>
            <li>Reviewing and moderating community submissions</li>
            <li>Managing user trust levels and flags</li>
            <li>Configuring AI pre-screening thresholds</li>
            <li>Viewing moderation analytics</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  sidebar: {
    width: 240,
    backgroundColor: '#1a1a2e',
    color: '#fff',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 32,
    color: '#d4a843',
    letterSpacing: 0.5,
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navButton: {
    width: '100%',
    padding: '10px 12px',
    border: 'none',
    borderRadius: 6,
    backgroundColor: 'transparent',
    color: '#ccc',
    fontSize: 14,
    textAlign: 'left',
    cursor: 'pointer',
  },
  navButtonActive: {
    backgroundColor: '#d4a84320',
    color: '#d4a843',
  },
  main: {
    flex: 1,
    padding: '32px 40px',
    backgroundColor: '#f5f5f7',
  },
  heading: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
    color: '#1a1a2e',
  },
  subheading: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  placeholder: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    border: '1px solid #e0e0e0',
    color: '#444',
    lineHeight: 1.6,
  },
};
