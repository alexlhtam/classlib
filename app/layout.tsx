import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'classlib — Knowledge Canvas',
  description:
    'A collaborative class-notes library with pull-request review for edits.',
};

// Fonts come from Google Fonts (matches the legacy prototype's font stack:
// Source Serif 4 for body, JetBrains Mono for code).
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&family=JetBrains+Mono:wght@400;500&display=swap';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={FONT_HREF} />
      </head>
      <body>
        <div className="cl-root">{children}</div>
      </body>
    </html>
  );
}
