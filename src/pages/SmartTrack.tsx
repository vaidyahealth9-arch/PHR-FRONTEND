import { useState } from 'react';
import { Activity, Beaker, Loader2, ArrowLeftRight, FileDown } from 'lucide-react';
import { useAnalyteHistory, useProfiles } from '../hooks/useApi';
import { useActiveProfile } from '../context/ProfileContext';
import AnalyteHistoryCard, { AnalyteHistoryData } from '../components/AnalyteHistoryCard';
import { motion } from 'framer-motion';
import { exportTrendsToPdf } from '../utils/pdfExport';
import TrendReportPdf from '../components/TrendReportPdf';

interface TestGroup {
  test_name: string;
  analytes: AnalyteHistoryData[];
}

export default function SmartTrack() {
  const { profiles } = useActiveProfile();

  // analyte history is tied to the logged-in user's mobile number on the backend,
  // not to a specific profile — so always fetch it without waiting for profile selection.
  const { data: historyData, isLoading } = useAnalyteHistory(undefined, true);
  const { data: profilesList } = useProfiles();
  const [exporting, setExporting] = useState(false);

  const tests: TestGroup[] = historyData?.tests || [];
  const activeProfile = profilesList?.find((p: any) => p.is_primary) || profilesList?.[0];
  const patientName = activeProfile?.full_name || 'Patient';

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      // Small delay to ensure the off-screen component is ready
      await new Promise(r => setTimeout(r, 100));
      await exportTrendsToPdf('trend-report-pdf-content', patientName);
    } catch (err) {
      console.error('PDF Export failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const totalAnalytes = tests.reduce((sum, g) => sum + g.analytes.length, 0);
  const outOfRange = tests.reduce(
    (sum, g) => sum + g.analytes.filter((a) => a.status_color !== 'GREEN').length,
    0
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-primary-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-5 pb-24 space-y-5 max-w-lg mx-auto print:pb-4 print:space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-success-600 rounded-[2rem] p-5 text-white shadow-premium relative overflow-hidden print:rounded-xl print:shadow-none print:bg-primary-700">
        <div className="absolute right-0 top-0 w-36 h-36 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 print:hidden" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary-100 print:hidden">Smart Track</p>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">Health Trends</h1>
          <p className="text-xs text-primary-50 mt-1.5 leading-relaxed font-medium">
            Biomarker history sourced continuously from your connected lab.
          </p>
        </div>
      </div>

      {/* Stats + Export Bar */}
      {tests.length > 0 && (
        <div className="flex items-center gap-3 print:hidden">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-soft px-4 py-3 text-center">
              <p className="text-xl font-bold text-slate-900">{totalAnalytes}</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Biomarkers</p>
            </div>
            <div className={`rounded-2xl border shadow-soft px-4 py-3 text-center ${outOfRange > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <p className={`text-xl font-bold ${outOfRange > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{outOfRange}</p>
              <p className={`text-[11px] font-medium mt-0.5 ${outOfRange > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {outOfRange > 0 ? 'Alerts' : 'All Normal'}
              </p>
            </div>
          </div>
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex flex-col items-center justify-center gap-1 bg-primary-700 hover:bg-primary-800 text-white rounded-2xl px-4 py-3 shadow-soft border border-primary-600 active:scale-95 transition-all disabled:opacity-60 min-w-[68px]"
            title="Export all trends as PDF"
          >
            {exporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileDown className="w-5 h-5" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider">PDF</span>
          </button>
        </div>
      )}

      {/* Test Groups */}
      <div className="space-y-6 print:space-y-4">
        {tests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">No LIMS linked tracking data found.</p>
            <p className="text-xs text-slate-400 mt-1">Connect your lab account to start tracking.</p>
          </div>
        ) : (
          tests.map((testGroup, groupIdx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIdx * 0.08 }}
              key={groupIdx}
              className="space-y-2.5 print:break-inside-avoid"
            >
              <h2 className="text-[11px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 px-1">
                <Beaker className="w-3.5 h-3.5 text-primary-600" />
                {testGroup.test_name}
              </h2>
              <div className="space-y-2.5">
                {testGroup.analytes.map((analyte, idx) => (
                  <AnalyteHistoryCard key={idx} analyte={analyte} />
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Tip */}
      {tests.length > 0 && (
        <div className="bg-primary-50/60 border border-primary-100 rounded-2xl p-3.5 print:hidden">
          <p className="text-[11px] font-medium text-primary-800 flex items-center gap-2 leading-relaxed">
            <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
            Tap any row to see the clinical summary and historical trend graph. Use the PDF button to export all trends.
          </p>
        </div>
      )}
      {/* Off-screen PDF content */}
      <TrendReportPdf tests={tests} patientName={patientName} />
    </div>
  );
}
