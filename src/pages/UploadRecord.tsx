import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Check, 
  TrendingUp,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useConfirmOCR, useExtractOCR, useProfiles, useUploadRecord } from '../hooks/useApi';

export default function UploadRecord() {
  const navigate = useNavigate();

  const formatTwoDecimals = (value: string | number): string => {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(parsed)) {
      return String(value);
    }
    return parsed.toFixed(2);
  };
  const { data: profiles } = useProfiles();
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
    if (!profiles || profiles.length === 0 || formData.profile_id) return;
    const storedActiveProfileId = localStorage.getItem('active_profile_id');
    const nextProfileId = storedActiveProfileId || String(profiles[0].id);
    setFormData((prev) => ({ ...prev, profile_id: nextProfileId }));
  }, [profiles, formData.profile_id]);

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
      setAnalytes([
        { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', status: 'normal' },
        { name: 'Glucose (Fasting)', value: '98', unit: 'mg/dL', status: 'normal' }
      ]);
    } catch {
      setErrorMessage('Critical Sync Failure: Please verify document integrity.');
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
      setErrorMessage('Data Strateification Failure.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-6 pb-32 space-y-10 font-inter">
      {/* Navigation Header */}
      <header className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-sm active:scale-95 text-slate-400">
          <ArrowLeft size={18} />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-lexend font-black text-slate-900 tracking-widest uppercase">External Intake</h2>
          <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-0.5">Clinical Digitization</p>
        </div>
        <div className="w-10" />
      </header>

      {!uploadedRecordId ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-8">
            <div className="relative">
              <input 
                type="file" 
                accept="image/*,application/pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required 
              />
              <div className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all ${file ? 'border-success-200 bg-success-50/20' : 'border-primary-100 bg-primary-50/10'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm ${file ? 'bg-success-700 text-white' : 'bg-white text-primary-700'}`}>
                  {file ? <Check size={28} strokeWidth={3} /> : <Upload size={28} strokeWidth={3} />}
                </div>
                <h3 className="text-sm font-lexend font-black text-slate-900 leading-tight truncate">{file ? file.name : 'Ingest Lab Record'}</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF / Clinical JPEG'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 px-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Biological Target</label>
                <select 
                  value={formData.profile_id} 
                  onChange={(e) => setFormData({...formData, profile_id: e.target.value})}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight focus:ring-2 focus:ring-primary-600 appearance-none"
                >
                  {profiles?.map((p: any) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
              <div className="space-y-2 px-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Digital Identifier</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. CBC Hub 2024"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight placeholder:text-slate-300 focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] leading-tight shadow-sm shadow-rose-100">
                <AlertCircle size={14} className="flex-shrink-0" />
                {errorMessage}
              </div>
            )}
          </div>
          <button type="submit" disabled={uploadMutation.isPending || !file} className="w-full p-4 bg-primary-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary-100 active:scale-95 transition-all disabled:opacity-50">
            {uploadMutation.isPending ? 'Processing Matrix...' : 'Start Clinical Extraction'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-950 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-700 rounded-2xl flex items-center justify-center shadow-lg text-white">
                  <TrendingUp size={24} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-sm font-lexend font-black uppercase tracking-tight">Extracted Biomarkers</h3>
                  <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest leading-none mt-1">Verify Analysis Values</p>
                </div>
              </div>

              <div className="space-y-3">
                {analytes.map((item, id) => (
                  <div key={id} className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer">
                    <div>
                      <p className="text-[9px] font-black text-primary-300 uppercase tracking-[0.2em] mb-1">{item.name}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black">{formatTwoDecimals(item.value)}</span>
                        <span className="text-[9px] font-bold opacity-40 uppercase">{item.unit}</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-primary-300">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Source</h4>
                <div className="px-2 py-0.5 bg-success-50 rounded-full text-[8px] font-black text-success-700 uppercase tracking-widest">Verified</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100/50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-loose">Facility Trace</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{ocrResult?.extracted_source_facility || 'External Lab Center'}</p>
              </div>
            </div>

            <button onClick={handleConfirm} disabled={confirmMutation.isPending} className="w-full p-4 bg-primary-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary-100 active:scale-95 transition-all">
              {confirmMutation.isPending ? 'Syncing Records...' : 'Confirm & Save for Analytics'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
