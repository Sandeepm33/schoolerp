import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataSyncProvider } from './context/DataSyncContext';
import AppLayoutWrapper from './components/AppLayoutWrapper';

export const metadata = {
  title: 'AI-Powered Multi-Tenant SaaS School ERP',
  description: 'Complete AI-powered, mobile-first School Operating System with persistent MongoDB engine.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
        <AuthProvider>
          <ThemeProvider>
            <DataSyncProvider>
              <AppLayoutWrapper>
                {children}
              </AppLayoutWrapper>
            </DataSyncProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
