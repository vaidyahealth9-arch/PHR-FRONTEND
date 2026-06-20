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
  Activity,
  AlertCircle,
  Trash2,
  Pencil,
  Droplets,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCreateProfile, useProfiles, useRecords } from '../hooks/useApi';
import { authApi, profilesApi } from '../api/client';
import { useActiveProfile } from '../context/ProfileContext';
import PageHeader from '../components/PageHeader';

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
  blood_group?: string | null;
}

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const RELATIONSHIPS = ['parent', 'spouse', 'child', 'sibling', 'other'];

export default function Profile() {
  const { profiles, activeProfileId, setActiveProfileId } = useActiveProfile();
  const { isLoading: profilesLoading, refetch: refetchProfiles } = useProfiles();
  const createProfile = useCreateProfile();

  const { data: userProfileData, isLoading: loadingUser, refetch: refetchUserProfile } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await authApi.me();
      return response.data as UserProfile;
    },
  });

  const userProfile = userProfileData || null;
  const [savingUser, setSavingUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [editingFamilyMember, setEditingFamilyMember] = useState<any | null>(null);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    gender: '',
    date_of_birth: '',
    contact_email: '',
    blood_group: '',
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

  useEffect(() => {
    if (userProfileData) {
      setEditForm({
        first_name: userProfileData.first_name || '',
        last_name: userProfileData.last_name || '',
        middle_name: userProfileData.middle_name || '',
        gender: userProfileData.gender || '',
        date_of_birth: userProfileData.date_of_birth || '',
        contact_email: userProfileData.contact_email || '',
        blood_group: userProfileData.blood_group || '',
        address_line1: userProfileData.address_line1 || '',
        address_line2: userProfileData.address_line2 || '',
        city: userProfileData.city || '',
        state: userProfileData.state || '',
        postal_code: userProfileData.postal_code || '',
        country: userProfileData.country || '',
      });
    }
  }, [userProfileData]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    window.setTimeout(() => setSuccessMessage(null), 2500);
  };

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
        blood_group: editForm.blood_group || null,
      });
      await refetchUserProfile();
      await refetchProfiles();
      setShowEditUser(false);
      showSuccess('Profile updated successfully');
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleAddFamilyMember = async () => {
    if (!newFamilyMember.full_name.trim()) {
      setError('Please enter the family member\'s full name.');
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
      showSuccess('Family member added successfully');
    } catch {
      setError('Failed to add family member. Please try again.');
    }
  };

  const handleEditFamilyMember = async () => {
    if (!editingFamilyMember) return;
    setError(null);
    try {
      await profilesApi.update(editingFamilyMember.id, {
        full_name: editingFamilyMember.full_name,
        relationship: editingFamilyMember.relationship,
        date_of_birth: editingFamilyMember.date_of_birth || undefined,
        blood_group: editingFamilyMember.blood_group || undefined,
        gender: editingFamilyMember.gender || undefined,
      });
      await refetchProfiles();
      setEditingFamilyMember(null);
      showSuccess('Family member updated');
    } catch {
      setError('Failed to update family member. Please try again.');
    }
  };

  const handleDeleteFamilyMember = (profileId: string, name: string) => {
    setProfileToDelete({ id: profileId, name });
  };

  const executeDeleteFamilyMember = async (profileId: string) => {
    setDeletingProfileId(profileId);
    setError(null);
    try {
      await profilesApi.delete(profileId);
      if (activeProfileId === profileId) {
        const primary = profiles.find((p) => p.is_primary);
        if (primary) setActiveProfileId(primary.id);
      }
      await refetchProfiles();
      showSuccess('Family member removed');
    } catch {
      setError('Failed to remove family member. Please try again.');
    } finally {
      setDeletingProfileId(null);
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
      className="py-4 pb-24 space-y-4 sm:space-y-5"
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

      {/* Success Alert */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700 text-xs font-bold"
          >
            <Check size={16} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <PageHeader
        icon={<User size={22} strokeWidth={2} />}
        title={userProfile?.full_name || 'My Profile'}
        subtitle={userProfile?.contact_phone || 'Verified Account'}
        stats={[
          { label: 'Files', value: String(recordsTotal) },
          { label: 'Blood Group', value: userProfile?.blood_group || '—' },
          { label: 'Latest ID', value: latestRecord ? latestRecord.display_id : '—' },
        ]}
        action={
          <button
            onClick={() => setShowEditUser(true)}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-soft active:scale-95 transition-all text-white hover:bg-white/30"
            title="Edit profile"
          >
            <Edit2 size={16} strokeWidth={2.5} />
          </button>
        }
      />

      {/* Family Network */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-primary-700" size={20} />
            Family Members
          </h3>
          <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-lg">
            {familyProfiles.length + 1} Profiles
          </span>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
          {/* Active Profile Selector */}
          <div className="p-6 border-b border-slate-50 bg-slate-50/30">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">Viewing Records For</label>
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
              <div
                key={p.id}
                className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-all group"
              >
                <button
                  onClick={() => setActiveProfileId(p.id)}
                  className="flex items-center gap-4 flex-1 min-w-0 text-left"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                    activeProfileId === p.id 
                      ? 'bg-primary-700 text-white shadow-medium' 
                      : 'bg-slate-100 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-500'
                  }`}>
                    {activeProfileId === p.id ? <Check size={20} strokeWidth={3} /> : <User size={20} strokeWidth={2.5} />}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-black uppercase tracking-tight truncate ${activeProfileId === p.id ? 'text-primary-700' : 'text-slate-900'}`}>
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
                      {activeProfileId === p.id && (
                        <span className="px-2 py-0.5 bg-success-50 text-success-700 text-[9px] font-black uppercase tracking-widest rounded-md">Active</span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Edit / Delete actions */}
                <div className="flex items-center gap-1 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingFamilyMember({ ...p })}
                    className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-primary-50 hover:text-primary-700 flex items-center justify-center text-slate-400 transition-all active:scale-90"
                    title="Edit family member"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteFamilyMember(p.id, p.full_name)}
                    disabled={deletingProfileId === p.id}
                    className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 transition-all active:scale-90 disabled:opacity-50"
                    title="Remove family member"
                  >
                    {deletingProfileId === p.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowAddFamily(true)}
              className="w-full flex items-center justify-center gap-3 p-6 text-primary-700 hover:bg-primary-50/50 transition-all font-black text-[11px] uppercase tracking-[0.2em]"
            >
              <Plus size={18} strokeWidth={3} />
              Add Family Member
            </button>
          </div>
        </div>
      </section>

      {/* Account Information */}
      <section className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3 px-1">
          <Activity className="text-primary-700" size={20} />
          Account Details
        </h3>
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-soft p-6 space-y-4">
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
              <Mail size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
              <p className="text-xs font-bold text-slate-900 truncate">{userProfile?.contact_email || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
              <Phone size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</p>
              <p className="text-xs font-bold text-slate-900 truncate">{userProfile?.contact_phone || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
              <Droplets size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Blood Group</p>
              <p className="text-xs font-bold text-slate-900 truncate">{userProfile?.blood_group || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
              <MapPin size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Address</p>
              <p className="text-xs font-bold text-slate-900 truncate">
                {userProfile?.city ? `${userProfile.city}${userProfile.country ? ', ' + userProfile.country : ''}` : 'Not set'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-[2.5rem] bg-white shadow-premium relative"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/90 backdrop-blur-md border-b border-slate-50">
                <h4 className="text-base font-black text-slate-900">Edit Profile</h4>
                <button 
                  onClick={() => setShowEditUser(false)}
                  className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                    <input
                      value={editForm.first_name}
                      onChange={(e) => setEditForm((p) => ({ ...p, first_name: e.target.value }))}
                      placeholder="First name"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                    <input
                      value={editForm.last_name}
                      onChange={(e) => setEditForm((p) => ({ ...p, last_name: e.target.value }))}
                      placeholder="Last name"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    value={editForm.contact_email}
                    onChange={(e) => setEditForm((p) => ({ ...p, contact_email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editForm.date_of_birth}
                      onChange={(e) => setEditForm((p) => ({ ...p, date_of_birth: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm((p) => ({ ...p, gender: e.target.value }))}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all appearance-none"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                  <select
                    value={editForm.blood_group}
                    onChange={(e) => setEditForm((p) => ({ ...p, blood_group: e.target.value }))}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all appearance-none"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg || 'Select blood group'}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                  <input
                    value={editForm.city}
                    onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="City"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                    <input
                      value={editForm.state}
                      onChange={(e) => setEditForm((p) => ({ ...p, state: e.target.value }))}
                      placeholder="State"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                    <input
                      value={editForm.country}
                      onChange={(e) => setEditForm((p) => ({ ...p, country: e.target.value }))}
                      placeholder="Country"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveUser}
                  disabled={savingUser}
                  className="w-full btn btn-primary btn-md rounded-2xl shadow-premium py-4 text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all mt-2"
                >
                  {savingUser ? <Loader2 size={18} className="animate-spin" /> : 'Save Profile'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Family Member Modal */}
      <AnimatePresence>
        {showAddFamily && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-premium relative overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-br from-primary-800 to-primary-700 text-white relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-black uppercase tracking-tight">Add Family Member</h4>
                    <p className="text-primary-100 text-[10px] font-semibold mt-0.5">Track health records together</p>
                  </div>
                  <button 
                    onClick={() => setShowAddFamily(false)}
                    className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white/70 active:scale-90 transition-all"
                  >
                    <X size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    value={newFamilyMember.full_name}
                    onChange={(e) => setNewFamilyMember((p) => ({ ...p, full_name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Priya Sharma"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relationship</label>
                  <select
                    value={newFamilyMember.relationship}
                    onChange={(e) => setNewFamilyMember((p) => ({ ...p, relationship: e.target.value }))}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 appearance-none capitalize"
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                    <input
                      type="date"
                      value={newFamilyMember.date_of_birth}
                      onChange={(e) => setNewFamilyMember((p) => ({ ...p, date_of_birth: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                    <select
                      value={newFamilyMember.blood_group}
                      onChange={(e) => setNewFamilyMember((p) => ({ ...p, blood_group: e.target.value }))}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 appearance-none"
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>{bg || 'Select'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                  <select
                    value={newFamilyMember.gender}
                    onChange={(e) => setNewFamilyMember((p) => ({ ...p, gender: e.target.value }))}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <button
                  onClick={handleAddFamilyMember}
                  disabled={createProfile.isPending}
                  className="w-full btn btn-primary btn-md rounded-2xl shadow-premium py-4 text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all"
                >
                  {createProfile.isPending ? <Loader2 size={18} className="animate-spin" /> : (
                    <><Plus size={16} strokeWidth={3} /> Add Member</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Family Member Modal */}
      <AnimatePresence>
        {editingFamilyMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-premium relative overflow-hidden"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/90 backdrop-blur-md border-b border-slate-50">
                <h4 className="text-base font-black text-slate-900">Edit Family Member</h4>
                <button 
                  onClick={() => setEditingFamilyMember(null)}
                  className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    value={editingFamilyMember.full_name}
                    onChange={(e) => setEditingFamilyMember((p: any) => ({ ...p, full_name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relationship</label>
                  <select
                    value={editingFamilyMember.relationship}
                    onChange={(e) => setEditingFamilyMember((p: any) => ({ ...p, relationship: e.target.value }))}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                    <select
                      value={editingFamilyMember.blood_group || ''}
                      onChange={(e) => setEditingFamilyMember((p: any) => ({ ...p, blood_group: e.target.value }))}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 appearance-none"
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>{bg || 'Select'}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                    <select
                      value={editingFamilyMember.gender || ''}
                      onChange={(e) => setEditingFamilyMember((p: any) => ({ ...p, gender: e.target.value }))}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 appearance-none"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleEditFamilyMember}
                  className="w-full btn btn-primary btn-md rounded-2xl shadow-premium py-4 text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {profileToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm rounded-[2.5rem] bg-white shadow-premium relative overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-br from-rose-700 to-rose-600 text-white relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                      <AlertCircle size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase tracking-tight">Confirm Delete</h4>
                      <p className="text-rose-100 text-[10px] font-semibold mt-0.5">This action cannot be undone</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileToDelete(null)}
                    className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white/70 active:scale-90 transition-all"
                  >
                    <X size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-700 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-800">Warning:</p>
                  <p className="text-xs font-medium leading-relaxed">
                    You are deleting the profile for <span className="font-bold text-rose-950">{profileToDelete.name}</span>. 
                    This will remove all access to their health records, trends, and bills within your PHR account.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setProfileToDelete(null)}
                    className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl border border-slate-100 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const idToDelete = profileToDelete.id;
                      setProfileToDelete(null);
                      await executeDeleteFamilyMember(idToDelete);
                    }}
                    className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-soft transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}