import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { 
  User, 
  Users, 
  Plus, 
  Edit2, 
  X, 
  Loader2, 
  Check,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useCreateProfile, useProfiles, useRecords } from '../hooks/useApi';
import { authApi } from '../api/client';
import { useActiveProfile } from '../context/ProfileContext';

interface UserProfile {
  id: number;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  full_name: string;
  age: number | null;
}

export default function Profile() {
  const { profiles, activeProfileId, setActiveProfileId } = useActiveProfile();
  const { isLoading: profilesLoading, refetch: refetchProfiles } = useProfiles();
  const createProfile = useCreateProfile();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    gender: '',
    date_of_birth: '',
    contact_email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });

  const [newFamilyMember, setNewFamilyMember] = useState({
    full_name: '',
    relationship: 'other',
    date_of_birth: '',
    blood_group: '',
    gender: '',
  });

  const realtimePollMs = Number(import.meta.env.VITE_REALTIME_POLL_MS || '20000');
  const recordsQuery = useRecords(
    activeProfileId || '',
    {
      page: 1,
      page_size: 1,
      sort_by: 'date',
      sort_order: 'desc',
    },
    {
      refetchIntervalMs: realtimePollMs,
    }
  );

  const familyProfiles = useMemo(
    () => profiles.filter((p) => !p.is_primary),
    [profiles]
  );

  const loadUserProfile = async () => {
    setLoadingUser(true);
    setError(null);
    try {
      const response = await authApi.me();
      const data = response.data as UserProfile;
      setUserProfile(data);
      setEditForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        middle_name: data.middle_name || '',
        gender: data.gender || '',
        date_of_birth: data.date_of_birth || '',
        contact_email: data.contact_email || '',
        address_line1: data.address_line1 || '',
        address_line2: data.address_line2 || '',
        city: data.city || '',
        state: data.state || '',
        postal_code: data.postal_code || '',
        country: data.country || '',
      });
    } catch {
      setError('Failed to load user profile. Please refresh.');
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleSaveUser = async () => {
    setSavingUser(true);
    setError(null);
    try {
      await authApi.updateMe({
        first_name: editForm.first_name || null,
        last_name: editForm.last_name || null,
        middle_name: editForm.middle_name || null,
        gender: editForm.gender || null,
        date_of_birth: editForm.date_of_birth || null,
        contact_email: editForm.contact_email || null,
        address_line1: editForm.address_line1 || null,
        address_line2: editForm.address_line2 || null,
        city: editForm.city || null,
        state: editForm.state || null,
        postal_code: editForm.postal_code || null,
        country: editForm.country || null,
      });
      await loadUserProfile();
      await refetchProfiles();
      setShowEditUser(false);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleAddFamilyMember = async () => {
    if (!newFamilyMember.full_name.trim()) {
      setError('Please enter family member full name.');
      return;
    }

    setError(null);
    try {
      const created: any = await createProfile.mutateAsync({
        full_name: newFamilyMember.full_name,
        relationship: newFamilyMember.relationship,
        date_of_birth: newFamilyMember.date_of_birth || undefined,
        blood_group: newFamilyMember.blood_group || undefined,
        gender: newFamilyMember.gender || undefined,
      });

      const createdId = created?.data?.id;
      if (createdId) {
        setActiveProfileId(String(createdId));
      }

      setShowAddFamily(false);
      setNewFamilyMember({
        full_name: '',
        relationship: 'other',
        date_of_birth: '',
        blood_group: '',
        gender: '',
      });
    } catch {
      setError('Failed to add family member.');
    }
  };

  if (loadingUser || profilesLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-primary-700 animate-spin" />
      </div>
    );
  }

  const recordsTotal = recordsQuery.data?.total ?? 0;
  const latestRecord = recordsQuery.data?.items?.[0];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto px-6 py-6 pb-24 space-y-8"
    >
      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 text-xs font-bold"
          >
            <AlertCircle size={16} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto opacity-50 hover:opacity-100">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Context */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center shadow-medium text-white">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">Health Identity</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Verified Account</p>
          </div>
        </div>
        <button
          onClick={() => setShowEditUser(true)}
          className="w-10 h-10 bg-white rounded-xl shadow-soft border border-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-all"
        >
          <Edit2 size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Universal Header Card */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-success-600 rounded-[2.5rem] shadow-premium p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="relative space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-[1.25rem] flex items-center justify-center shadow-lg border border-white/30 text-white flex-shrink-0">
              <User size={28} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h3 className="text-2xl font-black tracking-tight leading-none uppercase truncate mb-1">
                {userProfile?.full_name || 'Primary User'}
              </h3>
              <div className="flex items-center gap-2 text-primary-100">
                <Phone size={10} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-widest">{userProfile?.contact_phone || 'No Phone Sync'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] font-black text-primary-100 uppercase tracking-widest mb-1.5 opacity-70">Total Analysis</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black">{recordsTotal}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-100">Files</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] font-black text-primary-100 uppercase tracking-widest mb-1.5 opacity-70">Latest ID</p>
              <p className="text-[10px] font-black truncate">{latestRecord?.display_id || '---'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Member Management */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-primary-700" size={20} />
            Family Network
          </h3>
          <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-lg">
            {familyProfiles.length + 1} Profiles
          </span>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
          {/* Active Profile Dropdown (Simplified) */}
          <div className="p-6 border-b border-slate-50 bg-slate-50/30">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">Current Active Link</label>
            <div className="relative">
              <select
                value={activeProfileId || ''}
                onChange={(e) => setActiveProfileId(e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-black text-slate-900 shadow-sm focus:ring-2 focus:ring-primary-500 appearance-none uppercase tracking-wider"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} {p.is_primary ? '• PRIMARY' : `• ${p.relationship.toUpperCase()}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {familyProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProfileId(p.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-all active:scale-95 group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    activeProfileId === p.id 
                      ? 'bg-primary-700 text-white shadow-medium' 
                      : 'bg-slate-100 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-500'
                  }`}>
                    {activeProfileId === p.id ? <Check size={20} strokeWidth={3} /> : <User size={20} strokeWidth={2.5} />}
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-black uppercase tracking-tight ${activeProfileId === p.id ? 'text-primary-700' : 'text-slate-900'}`}>
                      {p.full_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.relationship}</span>
                      {p.blood_group && (
                        <>
                          <div className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{p.blood_group}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {activeProfileId === p.id && (
                  <motion.div layoutId="active-pill" className="px-3 py-1 bg-success-50 text-success-700 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    Active
                  </motion.div>
                )}
              </button>
            ))}

            <button
              onClick={() => setShowAddFamily(true)}
              className="w-full flex items-center justify-center gap-3 p-6 text-primary-700 hover:bg-primary-50/50 transition-all font-black text-[11px] uppercase tracking-[0.2em]"
            >
              <Plus size={18} strokeWidth={3} />
              Engage New Member
            </button>
          </div>
        </div>
      </section>

      {/* Account Information Listing */}
      <section className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3 px-1">
          <Activity className="text-primary-700" size={20} />
          Profile Credentials
        </h3>
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-soft p-6 space-y-4">
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
              <Mail size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sync Email</p>
              <p className="text-xs font-bold text-slate-900 truncate">{userProfile?.contact_email || 'Not Configured'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
              <MapPin size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Residence</p>
              <p className="text-xs font-bold text-slate-900 truncate">
                {userProfile?.city ? `${userProfile.city}, ${userProfile.country}` : 'Address Pending'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-[2.5rem] bg-white shadow-premium relative"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-8 bg-white/80 backdrop-blur-md border-b border-slate-50">
                <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">Identity Matrix</h4>
                <button 
                  onClick={() => setShowEditUser(false)}
                  className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Given Name</label>
                    <input
                      value={editForm.first_name}
                      onChange={(e) => setEditForm((p) => ({ ...p, first_name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Family Name</label>
                    <input
                      value={editForm.last_name}
                      onChange={(e) => setEditForm((p) => ({ ...p, last_name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Connection</label>
                  <input
                    type="email"
                    value={editForm.contact_email}
                    onChange={(e) => setEditForm((p) => ({ ...p, contact_email: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Birth Date</label>
                    <input
                      type="date"
                      value={editForm.date_of_birth}
                      onChange={(e) => setEditForm((p) => ({ ...p, date_of_birth: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm((p) => ({ ...p, gender: e.target.value }))}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all appearance-none"
                    >
                      <option value="">Status</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveUser}
                  disabled={savingUser}
                  className="w-full btn btn-primary btn-md rounded-2xl shadow-premium py-4 text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all mt-4"
                >
                  {savingUser ? <Loader2 size={18} className="animate-spin" /> : 'Synchronize Identity'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Family Member Modal */}
      <AnimatePresence>
        {showAddFamily && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-premium relative overflow-hidden"
            >
              <div className="p-8 bg-slate-950 text-white relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl -mr-12 -mt-12" />
                <div className="relative flex items-center justify-between">
                  <h4 className="text-base font-black uppercase tracking-tight">Expand Network</h4>
                  <button 
                    onClick={() => setShowAddFamily(false)}
                    className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/50 active:scale-90 transition-all"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                    <input
                      value={newFamilyMember.full_name}
                      onChange={(e) => setNewFamilyMember((p) => ({ ...p, full_name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g. Sarah J. Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relationship</label>
                    <select
                      value={newFamilyMember.relationship}
                      onChange={(e) => setNewFamilyMember((p) => ({ ...p, relationship: e.target.value }))}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 appearance-none"
                    >
                      <option value="parent">Parent</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="sibling">Sibling</option>
                      <option value="other">Other Link</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Archetype</label>
                      <select
                        value={newFamilyMember.blood_group}
                        onChange={(e) => setNewFamilyMember((p) => ({ ...p, blood_group: e.target.value }))}
                        className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 appearance-none"
                      >
                        <option value="">Group</option>
                        <option>A+</option><option>A-</option>
                        <option>B+</option><option>B-</option>
                        <option>O+</option><option>O-</option>
                        <option>AB+</option><option>AB-</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Engagement</label>
                      <button
                        onClick={handleAddFamilyMember}
                        disabled={createProfile.isPending}
                        className="w-full bg-primary-700 h-[46px] rounded-2xl flex items-center justify-center text-white shadow-medium active:scale-95 transition-all"
                      >
                        {createProfile.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={3} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}