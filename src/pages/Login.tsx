import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/client';
import { Phone, ArrowRight, KeyRound } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.sendOtp(phoneNumber);
      setStep('otp');
      setError('OTP sent! Check your console for the OTP code.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP. User may not exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.verifyOtp(phoneNumber, otp);
      
      // Save token and login
      login(response.data.access_token, '');
      
      // Navigate to dashboard
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-cyan-900 via-teal-800 to-cyan-900">
      {/* Subtle Background Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl top-0 left-0"></div>
        <div className="absolute w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl bottom-0 right-0"></div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header with Logo */}
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 px-8 py-8 text-center">
              <div className="flex justify-center mb-3">
                <img 
                  src="/logo.png" 
                  alt="Vaidya Health Logo" 
                  className="h-32 w-auto filter drop-shadow-lg"
                />
              </div>
              <h1 className="text-4xl font-semibold text-white mb-0.5 tracking-tight">
                Vaidya Health
              </h1>
              <p className="text-cyan-50 text-sm font-light tracking-wide opacity-90">
                {step === 'phone' ? 'Sign In with Phone' : 'Enter OTP'}
              </p>
            </div>

            {/* Form Container */}
            <div className="p-6">
              {/* Error Message */}
              {error && (
                <div className={`mb-6 p-3.5 rounded-lg border ${
                  error.includes('sent') 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`text-sm ${
                    error.includes('sent') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {error}
                  </p>
                </div>
              )}

              {/* Phone Step */}
              {step === 'phone' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-11 w-full rounded-lg border border-gray-300 py-2.5 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      We'll send you a one-time password to verify your identity
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3 px-6 rounded-lg font-medium shadow-md hover:shadow-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Send OTP</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* OTP Step */}
              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Enter OTP
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="pl-11 w-full rounded-lg border border-gray-300 py-2.5 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-center text-2xl tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Sent to {phoneNumber} • <button 
                        type="button"
                        onClick={() => setStep('phone')}
                        className="text-cyan-600 hover:text-cyan-700 font-medium"
                      >
                        Change number
                      </button>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3 px-6 rounded-lg font-medium shadow-md hover:shadow-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Sign In</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full text-sm text-cyan-600 hover:text-cyan-700 font-medium py-2 disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </form>
              )}

              {/* Footer */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-center text-xs text-gray-500">
                  🔒 Secure • ABDM/ABHA Compliant • End-to-End Encrypted
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <p className="text-cyan-50 text-xs opacity-75">
              © 2025 Vaidya Health. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
