import AnalyteHistoryCard, { AnalyteHistoryData } from './AnalyteHistoryCard';
import { Beaker, ShieldCheck, Activity } from 'lucide-react';

interface TestGroup {
  test_name: string;
  analytes: AnalyteHistoryData[];
}

interface TrendReportPdfProps {
  tests: TestGroup[];
  patientName: string;
}

export default function TrendReportPdf({ tests, patientName }: TrendReportPdfProps) {
  return (
    <div
      id="trend-report-pdf-content"
      className="bg-white font-inter text-slate-900"
      style={{
        width: '1000px', // Wider capture area for better resolution and two columns
        position: 'absolute',
        left: '-9999px',
        top: 0
      }}
    >
      <div className="p-12 space-y-10" id="pdf-container-inner">
        {/* Header */}
        <header id="pdf-header" className="pdf-section flex justify-between items-start border-b-4 border-primary-700 pb-8" data-pdf-type="header">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-primary-800">
              <Activity className="w-8 h-8" strokeWidth={3} />
              <h1 className="text-4xl font-bold tracking-tight">VAIDYA PHR</h1>
            </div>
            <p className="text-xl font-semibold text-slate-400">Clinical Health Trends Report</p>
          </div>

          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-2 text-slate-900">
              <ShieldCheck size={18} className="text-success-600" />
              <p className="text-lg font-bold uppercase tracking-wider">{patientName}</p>
            </div>
            <p className="text-sm font-medium text-slate-500 italic">Connected Laboratory Source</p>
            <p className="text-xs text-slate-400 font-bold mt-2">REPORT DATE: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}</p>
          </div>
        </header>

        {/* Content area */}
        <div className="space-y-12">
          {tests.map((group, gIdx) => (
            <div key={gIdx} id={`pdf-group-${gIdx}`} className="pdf-section space-y-6" data-pdf-type="test-group">
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border-l-[6px] border-primary-600 shadow-sm" id={`pdf-group-title-${gIdx}`}>
                <Beaker className="w-6 h-6 text-primary-700" />
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                  {group.test_name}
                </h2>
              </div>

              {/* Two Column Grid for Analytes */}
              <div className="grid grid-cols-2 gap-8">
                {group.analytes.map((analyte, aIdx) => (
                  <div key={aIdx} id={`pdf-analyte-${gIdx}-${aIdx}`} className="pdf-section break-inside-avoid" data-pdf-type="analyte">
                    <AnalyteHistoryCard analyte={analyte} forceExpand={true} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-10 border-t-2 border-slate-100 flex justify-between items-center opacity-70">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Digital Health Passport</p>
            <p className="text-[10px] text-slate-400 font-medium max-w-sm leading-relaxed">
              This report is a consolidated view of your clinical biomarker history. It is for tracking purposes only and should be interpreted by a qualified medical professional.
            </p>
          </div>
          <div className="text-right">
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 inline-block">
              <p className="text-[10px] font-bold text-primary-700 uppercase tracking-widest leading-none">Security Verified</p>
            </div>
            <p className="text-[9px] text-slate-300 mt-2">© {new Date().getFullYear()} HALELABS VAIDYA PLATFORM</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
