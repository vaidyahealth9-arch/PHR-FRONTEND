import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { ArrowLeft, AlertCircle, Shield, Users, MapPin } from "lucide-react";

const INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const extractErrorMessage = (err: any, fallback: string) => {
    return (
      err?.response?.data?.error?.message ||
      err?.response?.data?.detail ||
      fallback
    );
  };

  const handlePostalCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    setPostalCode(digitsOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup({
        first_name: firstName,
        last_name: lastName,
        contact_phone: contactPhone,
        contact_email: contactEmail || undefined,
        gender: gender || undefined,
        date_of_birth: dateOfBirth || undefined,
        address_line1: addressLine1 || undefined,
        city: city || undefined,
        state: state || undefined,
        postal_code: postalCode || undefined,
        country: "India",
      });
      navigate("/otp", {
        replace: true,
        state: {
          phoneNumber: contactPhone,
          autoSendOtp: true,
          fromSignup: true,
        },
      });
    } catch (err: any) {
      setError(extractErrorMessage(err, "Failed to create an account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-dvh flex items-start sm:items-center justify-center px-4 py-5 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, rgba(6, 54, 72, 0.78), rgba(20, 126, 163, 0.4)), url('/login-bg.png')",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-72 h-72 bg-primary-400/18 rounded-full blur-3xl -top-16 -right-20" />
        <div className="absolute w-64 h-64 bg-success-400/12 rounded-full blur-3xl -bottom-20 -left-20" />
      </div>

      <div className="auth-shell min-w-0">
        <div className="auth-brand-sticky sticky top-3 z-20 glass-panel rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-center">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/logo.png" alt="Vaidya" className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_3px_8px_rgba(15,23,42,0.18)]" />
            <div className="flex flex-col min-w-0">
              <span className="text-base font-lexend font-black text-slate-900 tracking-tight leading-none truncate">VAIDYA</span>
              <span className="text-[9px] font-medium text-slate-500 leading-none mt-1 truncate">Personal Health Record</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="bg-gradient-to-r from-primary-800 to-primary-700 text-white px-4 sm:px-5 pt-4 sm:pt-5 pb-5 sm:pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary-50">
                <Users size={11} /> Easy registration
              </div>
              <h1 className="text-xl sm:text-2xl font-black leading-tight mt-1">Create account</h1>
              <p className="text-xs text-primary-100 mt-1">Set up once, use everywhere</p>
            </div>
            <p className="mt-3 text-sm text-primary-50 leading-6 break-words">
              Add your details once and keep them saved for records, profiles, and future visits.
            </p>
          </div>

          <div className="px-4 sm:px-5 py-4 sm:py-5 space-y-4 sm:space-y-5 bg-white">
            <p className="text-sm text-slate-600 leading-6">
              Fill in details once. This helps labs and reports map correctly to your profile.
            </p>

            {error && (
              <div className="flex gap-3 items-start p-4 bg-danger-50 border border-danger-200 rounded-2xl">
                <AlertCircle className="text-danger-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-danger-700 leading-6">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <section className="space-y-3 sm:space-y-4 rounded-2xl border border-slate-200 p-3.5 sm:p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Shield size={14} />
                  Personal details
                </div>

                <div className="space-y-4">
                  <Input label="First Name *" id="first-name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" required />
                  <Input label="Last Name *" id="last-name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" required />
                  <Input label="Phone Number (India) *" id="phone-number" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+91 98765 43210" required />
                  <Input label="Email" id="email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="you@example.com" />

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="select-clinical rounded-xl border-slate-300">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  <Input label="Date of Birth" id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </div>
              </section>

              <section className="space-y-3 sm:space-y-4 rounded-2xl border border-slate-200 p-3.5 sm:p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <MapPin size={14} />
                  Address details
                </div>

                <div className="space-y-4">
                  <Input label="Address" id="address-line1" type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="House number, street, area" />
                  <Input label="City" id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bengaluru" />
                  <div>
                    <label htmlFor="state" className="block text-sm font-semibold text-slate-700 mb-1.5">State *</label>
                    <select id="state" value={state} onChange={(e) => setState(e.target.value)} className="select-clinical rounded-xl border-slate-300" required>
                      <option value="">Select state</option>
                      {INDIAN_STATES_AND_UTS.map((stateOption) => (
                        <option key={stateOption} value={stateOption}>
                          {stateOption}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input label="PIN Code" id="postal-code" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={postalCode} onChange={(e) => handlePostalCodeChange(e.target.value)} placeholder="560001" />
                </div>
              </section>

              <Button type="submit" className="w-full btn-primary-clinical rounded-xl py-3.5 text-sm normal-case tracking-normal" size="md" isLoading={loading}>
                Create Account
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-semibold text-slate-500">Already registered?</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link to="/login" className="w-full flex items-center justify-center gap-2 btn btn-secondary btn-md rounded-xl">
              <ArrowLeft className="w-4 h-4" />
              Sign in instead
            </Link>

            <p className="text-xs text-center text-neutral-500 leading-5 pb-1">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
