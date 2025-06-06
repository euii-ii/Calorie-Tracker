import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded, user } = useUser();

  useEffect(() => {
    console.log('🔄 OAuth Callback Handler - Processing authentication...');
    console.log('Auth state:', { isSignedIn, isLoaded, userId: user?.id });

    if (isLoaded) {
      if (isSignedIn) {
        console.log('✅ User authenticated successfully, redirecting to home...');
        // Small delay to ensure Clerk state is fully updated
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        console.log('❌ Authentication failed, redirecting to sign-in...');
        navigate('/sign-in', { replace: true });
      }
    }
  }, [isLoaded, isSignedIn, navigate, user]);

  // Show loading state while processing
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing sign-in...
        </h2>
        <p className="text-gray-600">
          Please wait while we finish setting up your account.
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
