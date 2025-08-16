import React, { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import companyLogo from './assets/logo.png';
import API from '../api'; // Assuming you have a shared API instance
import axios from 'axios';

// ... (Your SignUpPayload and SignUpSuccessResponse interfaces)

const SignUpPage: FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // ... your existing handleSubmit logic ...
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={companyLogo} alt="Company Logo" className="h-12 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold text-brandBlue">Create an Account</h1>
          <p className="text-gray-500 mt-2">Get started with your new account.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
              {error}
            </div>
          )}

          {/* Full Name Input */}
          <div className="relative">
            <input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brandBlue transition-colors" placeholder=" " autoComplete="name" />
            <label htmlFor="name" className="absolute left-4 top-3 text-gray-500 transition-all duration-300 bg-white px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-brandBlue peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-sm">Full Name</label>
          </div>

          {/* Email Input */}
          <div className="relative">
            <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brandBlue transition-colors" placeholder=" " autoComplete="email" />
            <label htmlFor="email" className="absolute left-4 top-3 text-gray-500 transition-all duration-300 bg-white px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-brandBlue peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-sm">Email Address</label>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brandBlue transition-colors" placeholder=" " autoComplete="new-password" />
            <label htmlFor="password" className="absolute left-4 top-3 text-gray-500 transition-all duration-300 bg-white px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-brandBlue peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-sm">Password</label>
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <input id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="peer w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brandBlue transition-colors" placeholder=" " autoComplete="new-password" />
            <label htmlFor="confirmPassword" className="absolute left-4 top-3 text-gray-500 transition-all duration-300 bg-white px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-brandBlue peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-sm">Confirm Password</label>
          </div>
          
          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm px-3 py-3 rounded-lg font-bold font-inter shadow-lg shadow-blue-500/50 transition-all duration-200 ease-in-out hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/login" className="font-medium text-brandBlue hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;