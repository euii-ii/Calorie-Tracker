import React from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

// Get Clerk publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env.local file")
}

console.log('🔐 Initializing Clerk with publishable key:', PUBLISHABLE_KEY.substring(0, 20) + '...')

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
        },
      }}
      // Custom sign-in and sign-up URLs
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      // Allow external accounts
      allowedRedirectOrigins={[
        'https://easy-calorie-guide-main.vercel.app',
        'https://easy-calorie-guide-main-*.vercel.app',
        window.location.origin
      ]}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
