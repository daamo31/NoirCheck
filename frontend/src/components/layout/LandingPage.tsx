/**
 * Landing Page Component
 * 
 * Main entry point for new and returning users. Provides clear options
 * to create a new account or login to an existing account.
 * 
 * Features:
 * - Clean, modern landing page design
 * - Clear call-to-action buttons for registration and login
 * - Project information and benefits
 * - XION integration explanation
 * - Responsive design for all devices
 */

'use client';

import { useState, useEffect } from 'react';
import { Shield, FileCheck, Lock, Zap, Users, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onCreateAccount: () => void;
  onLogin: () => void;
}

export function LandingPage({ onCreateAccount, onLogin }: LandingPageProps) {
  const [isAnimated, setIsAnimated] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Logo and Title */}
            <div className={`transition-all duration-1000 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center justify-center mb-8">
                <div className="bg-blue-600 p-4 rounded-2xl shadow-2xl">
                  <Shield className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  NoirCheck
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Traditional sign-up with automatic blockchain wallet creation
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto mb-8">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
                  <span className="text-green-300 font-medium">Simple Registration Process</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Create your account with email and password. We&apos;ll automatically generate 
                  your XION blockchain wallet behind the scenes - no technical knowledge required!
                </p>
              </div>
              
              <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                Combat misinformation and verify digital content authenticity using 
                blockchain technology with seamless user experience.
              </p>
            </div>

            {/* Action Buttons */}
            <div className={`transition-all duration-1000 delay-300 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button
                  onClick={onCreateAccount}
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6" />
                    <span>Create Account</span>
                  </div>
                </button>
                
                <button
                  onClick={onLogin}
                  className="group bg-transparent border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-3">
                    <Lock className="w-6 h-6" />
                    <span>Login</span>
                  </div>
                </button>
              </div>
              
              <p className="text-gray-400 text-sm mt-6">
                Secure authentication powered by XION blockchain technology
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-20 transition-all duration-1000 delay-500 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose NoirCheck?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Advanced content verification technology designed for the modern digital landscape
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300 group hover:-translate-y-2">
              <div className="bg-blue-600/20 p-3 rounded-lg w-fit mb-4 group-hover:bg-blue-600/30 transition-colors">
                <FileCheck className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Content Registration</h3>
              <p className="text-gray-400">
                Register your original content on the blockchain to establish authentic ownership and timestamp.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300 group hover:-translate-y-2">
              <div className="bg-green-600/20 p-3 rounded-lg w-fit mb-4 group-hover:bg-green-600/30 transition-colors">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Instant Verification</h3>
              <p className="text-gray-400">
                Verify the authenticity of any digital content in seconds using our advanced blockchain technology.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 group hover:-translate-y-2">
              <div className="bg-purple-600/20 p-3 rounded-lg w-fit mb-4 group-hover:bg-purple-600/30 transition-colors">
                <Lock className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">XION Security</h3>
              <p className="text-gray-400">
                Powered by XION&apos;s Meta Account technology for secure, private, and seamless user authentication.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-yellow-400/50 transition-all duration-300 group hover:-translate-y-2">
              <div className="bg-yellow-600/20 p-3 rounded-lg w-fit mb-4 group-hover:bg-yellow-600/30 transition-colors">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-400">
                Get verification results instantly with our optimized blockchain infrastructure and smart contracts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className={`py-20 bg-black/20 transition-all duration-1000 delay-700 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Simple steps to verify and protect your digital content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Create Your Account</h3>
              <p className="text-gray-400">
                Sign up with XION&apos;s secure Meta Account technology. No complex wallet setup required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Register Content</h3>
              <p className="text-gray-400">
                Upload your original content to create an immutable record on the blockchain.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Verify & Share</h3>
              <p className="text-gray-400">
                Verify any content&apos;s authenticity and share your verified content with confidence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`py-20 transition-all duration-1000 delay-900 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Protect Your Digital Content?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of creators and verifiers using NoirCheck to combat misinformation
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onCreateAccount}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Get Started Now
            </button>
            <button
              onClick={onLogin}
              className="bg-transparent border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300"
            >
              I Have an Account
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 NoirCheck. Powered by XION blockchain technology.
          </p>
        </div>
      </div>
    </div>
  );
}
