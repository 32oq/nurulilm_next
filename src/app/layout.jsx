import '../styles/globals.css';
import Providers from '../components/Providers';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nurulilmlibrary.com'),
  title: 'Nurul Ilm Public Library | Handwara, Kashmir',
  description: 'Public library and study sanctuary in Handwara, North Kashmir. Individual quiet carrels, winter heating, high-speed fiber connectivity, and curated reference stacks.',
  keywords: ['Nurul Ilm', 'Library Handwara', 'Study Space Kashmir', 'JKAS', 'UPSC', 'Reading Room', 'Kashmir Library', 'Kupwara Library'],
  authors: [{ name: 'Nurul Ilm Public Library' }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/assets/logo.jpeg', sizes: '192x192', type: 'image/jpeg' },
    ],
    shortcut: '/assets/logo.jpeg',
    apple: '/assets/logo.jpeg',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#0C1410' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#FCFCFB] dark:bg-[#0E1411] text-[#0B0E0A] dark:text-[#E5EBE7] font-sans antialiased selection:bg-[#33462C]/20 selection:text-[#1C3A2B]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
