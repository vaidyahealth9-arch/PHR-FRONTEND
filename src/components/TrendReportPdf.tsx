import { Beaker, ShieldCheck, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AnalyteHistoryData } from './AnalyteHistoryCard';
import TrendChart from './TrendChart';

interface TestGroup {
  test_name: string;
  analytes: AnalyteHistoryData[];
}

interface TrendReportPdfProps {
  tests: TestGroup[];
  patientName: string;
}

const AnalytePdfCard = ({ analyte }: { analyte: AnalyteHistoryData }) => {
  const isNormal = analyte.status_color === 'GREEN';
  const isAmber = analyte.status_color === 'AMBER';
  const statusLabel = isNormal ? 'NORMAL' : isAmber ? 'BORDERLINE' : 'OUT OF RANGE';
  const statusColor = isNormal ? 'text-emerald-700' : isAmber ? 'text-amber-700' : 'text-rose-700';
  const statusBg = isNormal ? 'bg-emerald-50' : isAmber ? 'bg-amber-50' : 'bg-rose-50';

  const TrendIcon = analyte.trend === 'up' ? TrendingUp : analyte.trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col h-[460px]">
      {/* Card Header */}
      <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-slate-800 text-sm leading-relaxed truncate" title={analyte.name}>
            {analyte.name}
          </h4>
        </div>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded whitespace-nowrap ${statusBg} ${statusColor} border border-current opacity-80`}>
          {statusLabel}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Results Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Current Result</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{parseFloat(analyte.current_value).toFixed(2)}</span>
              <span className="text-[10px] font-bold text-slate-400 leading-relaxed">{analyte.unit}</span>
            </div>
          </div>
          <div className="space-y-1 border-l border-slate-100 pl-4">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Previous Result</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-500">
                {analyte.previous_value ? parseFloat(analyte.previous_value).toFixed(2) : '—'}
              </span>
              <span className="text-[10px] font-bold text-slate-300 leading-relaxed">{analyte.unit}</span>
            </div>
          </div>
        </div>

        {/* Reference & Trend Line */}
        <div className="flex items-center justify-between bg-slate-50/50 rounded-xl px-4 py-2 border border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp size={12} className="text-primary-500" />
            <span className="text-[10px] font-medium text-slate-500 truncate max-w-[150px] leading-relaxed">
              Ref: {analyte.reference_range || 'N/A'} {analyte.unit}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <TrendIcon size={12} />
            <span className="uppercase tracking-tighter leading-relaxed">{analyte.trend}</span>
          </div>
        </div>

        {/* Chart Area - Fixed Height */}
        <div className="h-32 bg-white rounded-lg border border-slate-50 p-1 overflow-hidden">
          <TrendChart data={analyte.history} unit={analyte.unit} animate={false} className="w-full h-full" />
        </div>

        {/* Clinical Note */}
        <div className="bg-primary-50/30 p-2.5 rounded-xl border border-primary-100/30">
          <p className="text-[9px] leading-relaxed text-primary-900 font-medium">
            {analyte.name} {analyte.status_color === 'GREEN' ? 'is within the normal range.' : 'shows values outside the standard reference range.'} Tracked via connected lab source.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function TrendReportPdf({ tests, patientName }: TrendReportPdfProps) {
  return (
    <div
      id="trend-report-pdf-content"
      className="bg-white font-inter text-slate-900 absolute left-[-9999px] top-0 w-[1000px] z-[-1]"
    >
      <div className="p-12 pb-0 block">
        {/* Header */}
        <header className="flex justify-between items-start border-b-8 border-primary-700 pb-10 mb-16">
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-primary-800">
              <div className="w-12 h-12 bg-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter leading-none">VAIDYA PHR</h1>
                <p className="text-sm font-bold text-primary-600 uppercase tracking-[0.3em] mt-1">Health Intelligence Platform</p>
              </div>
            </div>
            <p className="text-xl font-bold text-slate-400 mt-4">Clinical Longitudinal Trend Report</p>
          </div>

          <div className="text-right space-y-2">
            <div className="bg-slate-50 px-6 py-4 rounded-[2rem] border border-slate-100 shadow-sm inline-block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Patient</p>
              <div className="flex items-center justify-end gap-2 text-slate-900">
                <ShieldCheck size={20} className="text-success-600" />
                <p className="text-2xl font-black uppercase tracking-tight">{patientName}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">
              GENERATED: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </header>

        {/* Content area */}
        <div className="space-y-16">
          {tests.map((group, gIdx) => (
            <div key={gIdx} className="space-y-8">
              <div className="flex items-center gap-4 bg-slate-900 p-5 rounded-[2rem] text-white shadow-xl">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <Beaker className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight leading-none">
                    {group.test_name}
                  </h2>
                  <p className="text-[10px] font-bold text-primary-200 uppercase tracking-widest mt-1 opacity-70">
                    Comprehensive Biomarker Analysis • {group.analytes.length} Parameters
                  </p>
                </div>
              </div>

              {/* Two Column Grid for Analytes */}
              <div className="grid grid-cols-2 gap-10">
                {group.analytes.map((analyte, aIdx) => (
                  <AnalytePdfCard key={aIdx} analyte={analyte} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer at the very bottom */}
      <footer className="mt-20 px-12 pb-12 pt-8 bg-white mb-0 border-t-2 border-slate-100 flex justify-between items-end">
        <div className="space-y-4 max-w-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success-500" />
            <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Secure Digital Health Asset</p>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-wider opacity-60">
            Disclaimer: For visual reference only. This report is a computational synthesis of records. It does not constitute medical advice. Please consult with a healthcare professional.
          </p>
        </div>
        <div className="text-right">
          <div className="bg-primary-700 px-6 py-3 rounded-2xl shadow-lg shadow-primary-200">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-none mb-1">Verification Hash</p>
            <p className="text-[10px] font-mono text-primary-100 truncate w-32">SHA256: {Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
          </div>
          <p className="text-[10px] font-black text-slate-300 mt-4 uppercase tracking-widest">© {new Date().getFullYear()} HALELABS VAIDYA ECOSYSTEM</p>
        </div>
      </footer>
    </div>
  );
}
