import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/client';
import { Phone, ArrowRight, CheckCircle, AlertCircle, Lock, RefreshCw } from 'lucide-react';

const OTP_RESEND_COOLDOWN_SECONDS = 30;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const isOtpRoute = location.pathname === '/otp';
  const [step, setStep] = useState<'phone' | 'otp'>(isOtpRoute ? 'otp' : 'phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const autoOtpSentRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const signupState = location.state as
    | {
        phoneNumber?: string;
        autoSendOtp?: boolean;
        fromSignup?: boolean;
      }
    | null;

  const extractErrorMessage = (err: any, fallback: string) => {
    return err?.response?.data?.error?.message || err?.response?.data?.detail || fallback;
  };

  const startResendCooldown = () => {
    setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current!);
          cooldownTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!signupState?.phoneNumber) {
      return;
    }

    setPhoneNumber(signupState.phoneNumber);
    setStep('otp');
    setError('');

    if (!signupState.autoSendOtp || autoOtpSentRef.current) {
      return;
    }

    autoOtpSentRef.current = true;

    const sendOtpAfterSignup = async () => {
      setLoading(true);
      try {
        await authApi.sendOtp(signupState.phoneNumber as string);
        startResendCooldown();
      } catch (err: any) {
        setError(extractErrorMessage(err, 'Failed to send OTP. Please request a new one.'));
      } finally {
        setLoading(false);
      }
    };

    void sendOtpAfterSignup();
  }, [signupState?.autoSendOtp, signupState?.phoneNumber]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.sendOtp(phoneNumber);
      setStep('otp');
      startResendCooldown();
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Phone number not found. Please sign up first.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError('');
    setOtp('');
    setLoading(true);
    try {
      await authApi.sendOtp(phoneNumber);
      startResendCooldown();
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to resend OTP. Please try again.'));
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
      login(response.data.access_token, response.data.refresh_token);
      navigate('/');
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Invalid OTP. Please check and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-4 py-5 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, rgba(6, 54, 72, 0.78), rgba(20, 126, 163, 0.4)), url('/login-bg.png')",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-72 h-72 bg-primary-400/18 rounded-full blur-3xl -top-16 -left-20" />
        <div className="absolute w-64 h-64 bg-success-400/12 rounded-full blur-3xl -bottom-20 -right-20" />
      </div>

      <div className="auth-shell min-w-0">
        <div className="auth-brand-sticky sticky top-3 z-20 glass-panel rounded-3xl p-4 flex flex-col items-center justify-center">
          <img src="/logo.png" alt="Vaidya" className="w-14 h-14 object-contain drop-shadow-[0_3px_8px_rgba(15,23,42,0.18)]" />
          <div className="flex flex-col items-center mt-1.5 text-center">
            <span className="text-base font-lexend font-black text-slate-900 tracking-tight leading-none">VAIDYA</span>
            <span className="text-[10px] font-bold text-slate-500 leading-none mt-1">Personal Health Record</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="bg-gradient-to-r from-primary-800 to-primary-700 text-white px-4 sm:px-5 pt-4 sm:pt-5 pb-5 sm:pb-6">
            <div>
              <p className="text-xs font-semibold opacity-90">{isOtpRoute ? 'OTP Verification' : 'Secure Login'}</p>
              <h1 className="text-xl sm:text-2xl font-black leading-tight mt-1">
                {step === 'phone' ? 'Welcome back' : 'Enter your OTP'}
              </h1>
              <p className="text-xs text-primary-100 mt-1">
                {step === 'phone' ? 'Sign in with your registered phone number' : `Code sent to ${phoneNumber}`}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className={`h-1.5 flex-1 rounded-full ${step === 'phone' ? 'bg-white' : 'bg-white/35'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step === 'otp' ? 'bg-white' : 'bg-white/35'}`} />
            </div>
          </div>

          <div className="px-4 sm:px-5 py-4 sm:py-5 space-y-4 sm:space-y-5 bg-white">
            {error && (
              <div className="flex gap-3 items-start p-4 bg-danger-50 border border-danger-200 rounded-xl">
                <AlertCircle className="text-danger-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-danger-700 leading-6">{error}</p>
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-800">Phone number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      className="input pl-11 sm:pl-12 text-base rounded-xl border-slate-300"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 leading-5">Enter your 10-digit mobile number</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary btn-md rounded-xl"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-slate-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-semibold text-primary-700 hover:text-primary-800">
                    Sign up
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-800">Enter OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="input text-center text-[1.5rem] sm:text-2xl tracking-[0.28em] sm:tracking-[0.38em] font-mono rounded-xl border-slate-300"
                    maxLength={6}
                    required
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 leading-5">6-digit code sent to {phoneNumber}</p>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className="text-xs font-semibold text-primary-700 hover:text-primary-800 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full btn btn-primary btn-md rounded-xl"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Sign in
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                  className="w-full btn btn-secondary btn-md rounded-xl"
                >
                  Use a different number
                </button>

                <p className="text-center text-sm text-slate-600">
                  Need a new account?{' '}
                  <Link to="/signup" className="font-semibold text-primary-700 hover:text-primary-800">
                    Create one
                  </Link>
                </p>
              </form>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Your data is encrypted and private</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
