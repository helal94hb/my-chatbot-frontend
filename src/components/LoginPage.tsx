import React, { useState } from 'react';
import type { FC, FormEvent } from 'react'; // Import types for clarity
import { Link, useNavigate } from 'react-router-dom';
import companyLogo from './assets/logo.png';


// --- DUMMY USER CREDENTIALS ---
const DUMMY_EMAIL = "user@example.com";
const DUMMY_PASSWORD = "password123";

// Define the component's type as a React Functional Component
const LoginPage: FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- KEY CHANGE: Type the form event correctly ---
   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null); // Reset error on new submission

 // --- 3. SIMULATE AN API CALL & VALIDATE DUMMY DATA ---
    setTimeout(() => {
      if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
        // --- On SUCCESS ---
        console.log("Login successful!");
        
        // a. Set the token in localStorage to authenticate the user
        localStorage.setItem('userToken', 'dummy-auth-token-12345');
        
        // b. Use navigate to redirect to the main chat application
        navigate('/');

      } else {
        // --- On FAILURE ---
        console.error("Login failed: Invalid credentials.");
        setError("Invalid email or password. Please try again.");
        setIsLoading(false); // Stop loading so the user can try again
      }
    }, 1000); // Simulate a 1-second network delay
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter p-4">
      <div className="w-full max-w-md">
        {/* Logo and Welcome Message */}
        <div className="text-center mb-8">
          <img
            src={companyLogo}
            alt="Company Logo"
            className="h-12 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-brandBlue">
            Welcome Back
          </h1>
          <p className="text-gray-500 mt-2">
            Please sign in to continue.
          </p>
        </div>

        {/* Login Form */}
        <form 
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-lg space-y-6"
        >
          {/* Email Input */}
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brandBlue transition-colors"
              placeholder=" "
              autoComplete="email"
            />
            <label 
              htmlFor="email" 
              className="absolute left-4 top-3 text-gray-500 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-brandBlue peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-sm bg-white px-1"
            >
              Email Address
            </label>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brandBlue transition-colors"
              placeholder=" "
              autoComplete="current-password"
            />
            <label 
              htmlFor="password" 
              className="absolute left-4 top-3 text-gray-500 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-brandBlue peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-sm bg-white px-1"
            >
              Password
            </label>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm px-3 py-3 rounded-lg font-bold font-inter shadow-lg shadow-blue-500/50 transition-all duration-200 ease-in-out hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
            {/* --- 2. ADD THE LINK TO THE SIGNUP PAGE --- */}
          <div className="text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link to="/signup" className="font-medium text-brandBlue hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;