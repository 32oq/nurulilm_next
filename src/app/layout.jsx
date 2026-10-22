import '../styles/globals.css';
import Providers from '../components/Providers';
import AppShell from '../components/AppShell';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nurulilmlibrary.com'),
  title: 'Nurul Ilm Library | Handwara, Kashmir',
  description: 'Nurul Ilm Library is a dedicated reading room and study sanctuary in Handwara, North Kashmir. Individual quiet carrels, winter heating, high-speed fiber connectivity, and curated reference stacks.',
  keywords: ['Nurul Ilm', 'Nurul Ilm Library', 'Study Space Kashmir', 'JKAS', 'UPSC', 'Reading Room', 'Kashmir Library', 'Kupwara Library'],
  authors: [{ name: 'Nurul Ilm Library' }],
  icons: {
    icon: [
      { url: '/assets/logo-crest.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/assets/logo-crest.svg',
    apple: '/assets/logo-crest.svg',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F8FB' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0F19' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-theme','light');document.documentElement.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#F6F8FB] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC] font-sans antialiased selection:bg-[#004B87]/20 selection:text-[#004B87] dark:selection:text-blue-300">
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
