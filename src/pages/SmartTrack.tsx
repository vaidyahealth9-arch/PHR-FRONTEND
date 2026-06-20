import { useState, useMemo } from 'react';
import { Activity, Beaker, Loader2, ArrowLeftRight, FileDown } from 'lucide-react';
import { useAnalyteHistory, useProfiles } from '../hooks/useApi';
import { useActiveProfile } from '../context/ProfileContext';
import AnalyteHistoryCard, { AnalyteHistoryData } from '../components/AnalyteHistoryCard';
import { motion } from 'framer-motion';
import { exportTrendsToPdf } from '../utils/pdfExport';
import TrendReportPdf from '../components/TrendReportPdf';
import PageHeader from '../components/PageHeader';
import ProfileSwitcher from '../components/ProfileSwitcher';
import EmptyState from '../components/EmptyState';

interface TestGroup {
  test_name: string;
  analytes: AnalyteHistoryData[];
}

export default function SmartTrack() {
  const { profiles, activeProfileId } = useActiveProfile();
  const validActiveProfileId =
    activeProfileId && profiles.some((p) => p.id === activeProfileId) ? activeProfileId : '';

  const { data: historyData, isLoading } = useAnalyteHistory(
    validActiveProfileId || undefined,
    !!validActiveProfileId
  );
  const { data: profilesList } = useProfiles();
  const [exporting, setExporting] = useState(false);

  const tests: TestGroup[] = useMemo(() => {
    if (!historyData?.tests) return [];
    return historyData.tests.map((group: any) => {
      const filteredAnalytes = group.analytes.map((analyte: any) => {
        const filteredHistory = analyte.history || [];
        const currentPoint = filteredHistory[0] || null;
        const previousPoint = filteredHistory[1] || null;

        return {
          ...analyte,
          current_value: currentPoint ? currentPoint.value : '0',
          previous_value: previousPoint ? previousPoint.value : null,
          history: filteredHistory,
        };
      }).filter((analyte: any) => analyte.history.length > 0);

      return {
        ...group,
        analytes: filteredAnalytes,
      };
    }).filter((group: any) => group.analytes.length > 0);
  }, [historyData]);
  const activeProfile = profilesList?.find((p: any) => p.is_primary) || profilesList?.[0];
  const patientName = activeProfile?.full_name || 'Patient';

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await new Promise((r) => setTimeout(r, 100));
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

  const headerStats = tests.length > 0
    ? [
        { label: 'Biomarkers', value: String(totalAnalytes) },
        { label: outOfRange > 0 ? 'Alerts' : 'All Normal', value: String(outOfRange) },
      ]
    : undefined;

  return (
    <div className="py-4 pb-24 space-y-4 sm:space-y-5 print:pb-4 print:space-y-4">
      {/* Unified Header */}
      <PageHeader
        icon={<Activity size={22} strokeWidth={2} />}
        title="Health Trends"
        subtitle="Biomarker history from your connected lab"
        stats={headerStats}
        action={
          tests.length > 0 ? (
            <button
              onClick={handleExportPdf}
              disabled={exporting}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-soft active:scale-95 transition-all disabled:opacity-60 print:hidden"
              title="Export all trends as PDF"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            </button>
          ) : undefined
        }
      />

      {/* Profile Switcher */}
      <div className="glass-panel rounded-2xl p-4 print:hidden">
        <ProfileSwitcher label="Tracking biomarkers for" />
      </div>

      {/* Test Groups */}
      <div className="space-y-5 print:space-y-4">
        {tests.length === 0 ? (
          <EmptyState
            icon={<Activity size={24} />}
            title="No tracking data available"
            subtitle="Connect your lab account or upload LIMS-linked records to start tracking biomarkers."
          />
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

      {/* Usage Tip */}
      {tests.length > 0 && (
        <div className="bg-primary-50/60 border border-primary-100 rounded-2xl p-3.5 print:hidden">
          <p className="text-[11px] font-medium text-primary-800 flex items-center gap-2 leading-relaxed">
            <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
            Tap any row to see clinical summary and historical trend graph. Use the export button to download a PDF.
          </p>
        </div>
      )}

      {/* Off-screen PDF content */}
      <TrendReportPdf tests={tests} patientName={patientName} />
    </div>
  );
}
