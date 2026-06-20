import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/client';
import { Phone, ArrowRight, CheckCircle, AlertCircle, Lock, RefreshCw, ShieldCheck } from 'lucide-react';

const OTP_RESEND_COOLDOWN_SECONDS = 30;
const REMEMBER_ME_DAYS = 90;

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

  // Remember Me state
  const [rememberMe, setRememberMe] = useState(false);

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
      login(
        response.data.access_token,
        response.data.refresh_token,
        rememberMe ? REMEMBER_ME_DAYS : undefined
      );
      navigate('/');
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Invalid OTP. Please check and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-3.5 py-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, rgba(6, 54, 72, 0.78), rgba(20, 126, 163, 0.4)), url('/login-bg.png')",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-56 h-56 bg-primary-400/18 rounded-full blur-3xl -top-12 -left-16" />
        <div className="absolute w-48 h-48 bg-success-400/12 rounded-full blur-3xl -bottom-16 -right-16" />
      </div>

      <div className="auth-shell min-w-0">
        {/* Brand header */}
        <div className="auth-brand-sticky sticky top-3 z-20 glass-panel rounded-2xl p-3 flex flex-col items-center justify-center">
          <img src="/logo.png" alt="Vaidya" className="w-11 h-11 object-contain drop-shadow-[0_3px_8px_rgba(15,23,42,0.18)]" />
          <div className="flex flex-col items-center mt-1 text-center">
            <span className="text-sm font-lexend font-black text-slate-900 tracking-tight leading-none">VAIDYA</span>
            <span className="text-[9px] font-bold text-slate-500 leading-none mt-0.5">Personal Health Record</span>
          </div>
        </div>

        <div className="auth-card">
          {/* Card header */}
          <div className="bg-gradient-to-r from-primary-800 to-primary-700 text-white px-4 pt-3.5 pb-4">
            <div>
              <p className="text-[10px] font-semibold opacity-90">{isOtpRoute ? 'OTP Verification' : 'Secure Login'}</p>
              <h1 className="text-lg font-black leading-tight mt-0.5">
                {step === 'phone' ? 'Welcome back' : 'Enter your OTP'}
              </h1>
              <p className="text-[10px] text-primary-100 mt-0.5">
                {step === 'phone' ? 'Sign in with your registered phone number' : `Code sent to ${phoneNumber}`}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className={`h-1 flex-1 rounded-full ${step === 'phone' ? 'bg-white' : 'bg-white/35'}`} />
              <div className={`h-1 flex-1 rounded-full ${step === 'otp' ? 'bg-white' : 'bg-white/35'}`} />
            </div>
          </div>

          {/* Card body */}
          <div className="px-4 py-4 space-y-4 bg-white">
            {error && (
              <div className="flex gap-2.5 items-start p-3 bg-danger-50 border border-danger-200 rounded-xl">
                <AlertCircle className="text-danger-600 flex-shrink-0 mt-0.5" size={17} />
                <p className="text-xs text-danger-700 leading-5">{error}</p>
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800">Phone number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      className="input pl-10 rounded-xl border-slate-300"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-4">Enter your 10-digit mobile number</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary btn-md rounded-xl"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-semibold text-primary-700 hover:text-primary-800">
                    Sign up
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800">Enter OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="input text-center text-2xl tracking-[0.3em] font-mono rounded-xl border-slate-300"
                    maxLength={6}
                    required
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 leading-4">6-digit code sent to {phoneNumber}</p>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className="text-[10px] font-semibold text-primary-700 hover:text-primary-800 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>

                {/* ── Remember Me ── */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div className="relative flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        onClick={() => setRememberMe((v) => !v)}
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                          rememberMe
                            ? 'bg-primary-700 border-primary-700'
                            : 'bg-white border-slate-300 hover:border-primary-400'
                        }`}
                      >
                        {rememberMe && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
                      <span className="text-xs font-semibold text-slate-700">Remember me for 3 months</span>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full btn btn-primary btn-md rounded-xl"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> Sign in
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

                <p className="text-center text-xs text-slate-600">
                  Need a new account?{' '}
                  <Link to="/signup" className="font-semibold text-primary-700 hover:text-primary-800">
                    Create one
                  </Link>
                </p>
              </form>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-2 border-t border-slate-200">
              <Lock className="w-3 h-3" />
              <span>Your data is encrypted and private</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
