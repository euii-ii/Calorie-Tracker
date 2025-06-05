
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen = ({ onGetStarted }: WelcomeScreenProps) => {
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();

  const handleGetStarted = () => {
    console.log('🚀 WelcomeScreen: User clicked Get Started');
    console.log('🔍 WelcomeScreen: isSignedIn:', isSignedIn, 'user:', !!user);

    if (isSignedIn && user) {
      console.log('✅ Signed-in user - proceeding to onboarding flow');
      onGetStarted();
    } else {
      console.log('❌ Non-signed-in user - redirecting to sign-in');
      navigate('/sign-in');
    }
  };
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8 font-rubik">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center">

        {/* Food Image */}
        <div className="mb-12">
          <img
            src="https://images.unsplash.com/photo-1592415486689-125cbbfcbee2?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Delicious sandwich"
            className="w-64 h-64 object-cover rounded-3xl shadow-lg"
          />
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl font-bold text-black text-center mb-4 font-manrope leading-tight">
          {isSignedIn && user ? 'Welcome to Cal AI!' : 'Calorie tracking made easy'}
        </h1>

        {/* Subtext */}
        <p className="text-lg text-gray-600 text-center mb-12 font-rubik leading-relaxed">
          {isSignedIn && user
            ? 'Let\'s set up your personalized nutrition plan.'
            : 'Scan your food. Get your custom plan.'
          }
        </p>

        {/* Get Started Button - Different behavior based on auth status */}
        {isSignedIn && user ? (
          /* For authenticated users - continue to onboarding */
          <div className="w-full">
            <Button
              onClick={handleGetStarted}
              className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl text-lg font-semibold transition-all duration-200 transform active:scale-95 font-rubik"
            >
              Continue to Profile Setup
            </Button>
            <p className="text-center mt-3 text-sm text-green-600">
              Welcome back, {user.firstName || 'User'}! 👋
            </p>
          </div>
        ) : (
          /* For unauthenticated users - go to sign-in */
          <div className="w-full">
            <Button
              onClick={() => navigate('/sign-in')}
              className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl text-lg font-semibold transition-all duration-200 transform active:scale-95 font-rubik"
            >
              Get Started
            </Button>

            {/* Sign Up Link */}
            <p className="text-center mt-4 text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/sign-up')}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
