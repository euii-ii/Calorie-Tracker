import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CustomSignIn = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 font-rubik">
      <div className="w-full max-w-md mx-auto">

        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
          </Button>
        </div>

        {/* Clerk SignIn Component */}
        <div className="w-full">
          <SignIn
            fallbackRedirectUrl="/"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-black hover:bg-gray-800 text-white',
                card: 'border-2 border-black shadow-lg',
                headerTitle: 'text-black font-manrope',
                headerSubtitle: 'text-gray-600 font-rubik',
                socialButtonsBlockButton: 'border-2 border-gray-300 hover:bg-gray-50',
                formFieldInput: 'border-gray-300 rounded-lg font-rubik',
                footerActionLink: 'text-blue-600 hover:text-blue-700'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomSignIn;
