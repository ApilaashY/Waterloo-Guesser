"use client";

import { useState } from 'react';

interface SaveScoreModalProps {
  isOpen: boolean;
  score: number;
  rounds: number;
  onSave: () => Promise<void>; // Auto-generate username and save
  onSignUp: () => void; // Navigate to sign up
  onSkip: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function SaveScoreModal({
  isOpen,
  score,
  rounds,
  onSave,
  onSignUp,
  onSkip,
  onClose,
  isLoading = false
}: SaveScoreModalProps) {
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setError('');
    
    try {
      await onSave();
    } catch (err) {
      setError('Failed to save score. Please try again.');
    }
  };

  const handleSignUp = () => {
    setError('');
    onSignUp();
  };

  const handleSkip = () => {
    setError('');
    onSkip();
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100000]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
        {/* Header */}
        <div className="text-center mb-6">
          {/* Greg character image */}
          <div className="mb-4">
            <img 
              src="/greg for conc.png" 
              alt="Greg mascot congratulating you"
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Great job!
          </h2>
          <p className="text-gray-600 mb-2">
            You scored <span className="font-semibold text-yellow-600">{score} points</span> in {rounds} round{rounds !== 1 ? 's' : ''}!
          </p>
          <p className="text-xs text-gray-500">
            🏆 Records tracked: Most accurate guess & fastest correct guess (monthly + all-time)
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Options */}
        <div className="space-y-4 mb-6">
          {/* Option 1: Auto-generate username */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Quick Save with Random Name</h3>
                {/* <p className="text-sm text-gray-600 mb-3">
                  Save your score instantly with a randomly generated username like "SwiftExplorer42"
                </p> */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-semibold py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save with Random Name'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Option 2: Sign up */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Sign Up & Save</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Create an account to save your own unique username, and access the dashboard all for free
                </p>
                <button
                  type="button"
                  onClick={handleSignUp}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSkip}
            disabled={isLoading}
            className="px-6 py-2 text-gray-500 font-medium hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip for now
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded-full p-2 transition-colors duration-200 disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}
