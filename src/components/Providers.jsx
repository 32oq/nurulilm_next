'use client';

import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { OtherProvider } from '../context/OtherContext';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OtherProvider>
          {children}
        </OtherProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
