import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Check, 
  TrendingUp,
  ChevronRight,
  AlertCircle,
  User
} from 'lucide-react';
import { useConfirmOCR, useExtractOCR, useProfiles, useUploadRecord } from '../hooks/useApi';
import { useActiveProfile } from '../context/ProfileContext';
import BackButton from '../components/BackButton';


export default function UploadRecord() {
  const navigate = useNavigate();
  const { activeProfileId } = useActiveProfile();

  const formatTwoDecimals = (value: string | number): string => {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(parsed)) {
      return String(value);
    }
    return parsed.toFixed(2);
  };
  const { data: profilesList } = useProfiles();
  const uploadMutation = useUploadRecord();
  const extractMutation = useExtractOCR();
  const confirmMutation = useConfirmOCR();
  
  const [formData, setFormData] = useState({
    profile_id: '',
    record_type: 'lab_report',
    title: '',
    description: '',
    issued_date: '',
    source_facility: '',
    source_doctor: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadedRecordId, setUploadedRecordId] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedTags, setConfirmedTags] = useState<string[]>([]);
  const [analytes, setAnalytes] = useState<any[]>([]);

  useEffect(() => {
    if (!profilesList || profilesList.length === 0 || formData.profile_id) return;
    const storedActiveProfileId = localStorage.getItem('active_profile_id');
    // Prefer the globally active profile
    const nextProfileId = activeProfileId || storedActiveProfileId || String(profilesList[0].id);
    setFormData((prev) => ({ ...prev, profile_id: nextProfileId }));
  }, [profilesList, formData.profile_id, activeProfileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setErrorMessage(null);
    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    formDataToSend.append('profile_id', formData.profile_id);
    formDataToSend.append('record_type', formData.record_type);
    formDataToSend.append('title', formData.title);

    try {
      const uploadResponse = await uploadMutation.mutateAsync(formDataToSend);
      const recordId = String(uploadResponse.data.record_id);
      setUploadedRecordId(recordId);

      const extractResponse = await extractMutation.mutateAsync(recordId);
      setOcrResult(extractResponse.data);
      setConfirmedTags(extractResponse.data.extracted_tags || []);
      // Only show analytes if actually extracted — no hardcoded dummy data
      const extractedAnalytes = extractResponse.data.analytes || extractResponse.data.extracted_analytes || [];
      setAnalytes(extractedAnalytes);
    } catch {
      setErrorMessage('Upload failed. Please check the file and try again.');
    }
  };

  const handleConfirm = async () => {
    if (!uploadedRecordId || !ocrResult) return;
    try {
      await confirmMutation.mutateAsync({
        recordId: uploadedRecordId,
        payload: {
          title: ocrResult.extracted_title,
          record_type: ocrResult.extracted_record_type,
          issued_date: ocrResult.extracted_issued_date || undefined,
          source_facility: ocrResult.extracted_source_facility,
          source_doctor: ocrResult.extracted_source_doctor,
          confirmed_tags: confirmedTags,
        },
      });
      navigate('/records');
    } catch {
      setErrorMessage('Failed to save record. Please try again.');
    }
  };

  // Find the selected profile name for display
  const selectedProfile = profilesList?.find((p: any) => String(p.id) === String(formData.profile_id));

  return (
    <div className="w-full px-4 sm:px-6 py-6 pb-32 space-y-6">
      {/* Navigation Header */}
      <header className="flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Upload Record</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Add a medical document to your health records</p>
        </div>
      </header>

      {!uploadedRecordId ? (
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Active Profile Banner */}
          {selectedProfile && (
            <div className="flex items-center gap-3 px-4 py-3 bg-primary-50 border border-primary-100 rounded-2xl">
              <div className="w-8 h-8 bg-primary-700 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <User size={15} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Uploading for</p>
                <p className="text-xs font-black text-primary-800 truncate">{selectedProfile.full_name}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-6">
            {/* File Drop Zone */}
            <div className="relative">
              <input 
                type="file" 
                accept="image/*,application/pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required 
              />
              <div className={`border-2 border-dashed rounded-[1.5rem] p-8 text-center transition-all ${file ? 'border-success-200 bg-success-50/20' : 'border-primary-100 bg-primary-50/10'}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm ${file ? 'bg-success-700 text-white' : 'bg-white text-primary-700'}`}>
                  {file ? <Check size={26} strokeWidth={3} /> : <Upload size={26} strokeWidth={2.5} />}
                </div>
                <h3 className="text-sm font-black text-slate-900 leading-tight truncate">
                  {file ? file.name : 'Tap to select a file'}
                </h3>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF or Image (JPG, PNG)'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Profile Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Profile</label>
                <select 
                  value={formData.profile_id} 
                  onChange={(e) => setFormData({...formData, profile_id: e.target.value})}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary-600 appearance-none"
                >
                  {profilesList?.map((p: any) => <option key={p.id} value={p.id}>{p.full_name}{p.is_primary ? ' (Primary)' : ''}</option>)}
                </select>
              </div>

              {/* Record Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Record Title <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Blood Test - June 2024"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold placeholder:text-slate-300 placeholder:font-normal focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 text-xs font-bold">
                <AlertCircle size={16} className="flex-shrink-0" />
                {errorMessage}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploadMutation.isPending || !file}
            className="w-full p-4 bg-primary-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-primary-100 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploadMutation.isPending ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
            ) : (
              <><Upload size={16} /> Upload Record</>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          {/* OCR Preview */}
          <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-premium">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg text-white border border-white/20">
                  <TrendingUp size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">Extracted Data Preview</h3>
                  <p className="text-[10px] font-semibold text-primary-200 mt-0.5">Review the extracted information below</p>
                </div>
              </div>

              {analytes.length > 0 ? (
                <div className="space-y-2.5">
                  {analytes.map((item: any, id: number) => (
                    <div key={id} className="bg-white/10 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-primary-200 uppercase tracking-[0.2em] mb-1">{item.name}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black">{formatTwoDecimals(item.value)}</span>
                          <span className="text-[9px] font-bold opacity-50 uppercase">{item.unit}</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-primary-200">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center">
                  <p className="text-xs font-semibold text-primary-100 opacity-80">
                    File uploaded. Confirm below to save to your records.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Facility</h4>
                <div className="px-2 py-0.5 bg-success-50 rounded-full text-[8px] font-black text-success-700 uppercase tracking-widest">Extracted</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-black text-slate-900">{ocrResult?.extracted_source_facility || 'Not detected'}</p>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 text-xs font-bold">
                <AlertCircle size={16} className="flex-shrink-0" />
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={confirmMutation.isPending}
              className="w-full p-4 bg-primary-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-primary-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {confirmMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (
                <><Check size={16} strokeWidth={3} /> Confirm & Save</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
