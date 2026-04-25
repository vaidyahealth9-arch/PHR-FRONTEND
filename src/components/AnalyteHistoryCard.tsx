import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ChevronDown, Activity, Info } from 'lucide-react';
import TrendChart from './TrendChart';

export interface AnalyteHistoryRecord {
  date: string;
  value: string;
  status: string;
}

export interface AnalyteHistoryData {
  name: string;
  unit: string;
  reference_range: string;
  current_value: string;
  previous_value: string | null;
  current_date: string;
  previous_date: string | null;
  status_color: string;
  trend: 'up' | 'down' | 'stable';
  history: AnalyteHistoryRecord[];
}

function buildSummary(analyte: AnalyteHistoryData): string {
  const name = analyte.name;
  const curr = parseFloat(analyte.current_value);
  const prev = analyte.previous_value ? parseFloat(analyte.previous_value) : null;
  const unit = analyte.unit;
  const isNormal = analyte.status_color === 'GREEN';
  const isHigh = analyte.trend === 'up' && !isNormal;
  const isLow = analyte.trend === 'down' && !isNormal;

  let summary = '';
  if (prev !== null && !isNaN(prev) && !isNaN(curr)) {
    const delta = curr - prev;
    const pct = ((Math.abs(delta) / prev) * 100).toFixed(1);
    const dir = delta > 0 ? 'increased' : delta < 0 ? 'decreased' : 'unchanged';
    summary = `${name} has ${dir} from ${prev.toFixed(2)} to ${curr.toFixed(2)} ${unit} (${pct}% change). `;
  } else {
    summary = `Current ${name} is ${curr.toFixed(2)} ${unit}. `;
  }

  if (isNormal) {
    summary += 'This is within the normal reference range.';
  } else if (isHigh) {
    summary += `Result is above normal range${analyte.reference_range ? ` (${analyte.reference_range})` : ''}. Consider consulting your physician.`;
  } else if (isLow) {
    summary += `Result is below normal range${analyte.reference_range ? ` (${analyte.reference_range})` : ''}. Consider consulting your physician.`;
  } else if (analyte.status_color !== 'GREEN') {
    summary += 'Result is outside normal range. Discuss with your healthcare provider.';
  }

  return summary;
}

export default function AnalyteHistoryCard({ analyte, forceExpand = false }: { analyte: AnalyteHistoryData, forceExpand?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const isExpanded = expanded || forceExpand;

  const isNormal = analyte.status_color === 'GREEN';
  const isAmber = analyte.status_color === 'AMBER';

  const statusBg = isNormal
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : isAmber
    ? 'bg-amber-50 border-amber-200 text-amber-800'
    : 'bg-rose-50 border-rose-200 text-rose-800';

  const statusDot = isNormal ? 'bg-emerald-500' : isAmber ? 'bg-amber-500' : 'bg-rose-500';

  const currNum = parseFloat(analyte.current_value);
  const prevNum = analyte.previous_value ? parseFloat(analyte.previous_value) : null;
  const delta = prevNum !== null && !isNaN(currNum) && !isNaN(prevNum) ? currNum - prevNum : null;
  const deltaPct = delta !== null && prevNum ? ((Math.abs(delta) / prevNum) * 100).toFixed(1) : null;

  const summary = buildSummary(analyte);

  const TrendIcon =
    analyte.trend === 'up' ? TrendingUp : analyte.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    analyte.trend === 'up'
      ? isNormal ? 'text-slate-500' : 'text-rose-500'
      : analyte.trend === 'down'
      ? isNormal ? 'text-slate-500' : 'text-emerald-600'
      : 'text-slate-400';

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-soft transition-all duration-200 hover:border-slate-200">
      {/* Card Header — tap to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-center justify-center gap-3 hover:bg-slate-50/60 transition-colors no-pdf"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Status Dot */}
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDot} shadow-sm`} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-slate-900 truncate">{analyte.name}</span>
              {!isNormal && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusBg}`}>
                  {isAmber ? 'Borderline' : 'Out of Range'}
                </span>
              )}
            </div>

            {/* prev → current value display */}
            <div className="flex items-center gap-2 mt-0.5 text-[11px] font-medium">
              {prevNum !== null && !isNaN(prevNum) && (
                <>
                  <span className="text-slate-400">{prevNum.toFixed(2)}</span>
                  <span className="text-slate-300">→</span>
                </>
              )}
              <span className="text-slate-700 font-semibold">
                {isNaN(currNum) ? analyte.current_value : currNum.toFixed(2)} {analyte.unit}
              </span>
              {delta !== null && deltaPct && (
                <span className={`flex items-center gap-0.5 ${trendColor}`}>
                  <TrendIcon className="w-3 h-3" />
                  {deltaPct}%
                </span>
              )}
            </div>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 no-pdf ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* PDF Header - Only visible in PDF */}
      <div className="hidden hidden-in-pdf px-4 py-3 border-b border-slate-50">
          <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-base">{analyte.name}</h4>
              <span className="text-xs font-semibold text-slate-500 uppercase">{analyte.reference_range ? `Ref: ${analyte.reference_range} ${analyte.unit}` : ''}</span>
          </div>
      </div>

      {/* Expandable Detail Panel */}
      <AnimatePresence initial={forceExpand}>
        {isExpanded && (
          <motion.div
            initial={forceExpand ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-slate-50">
              {/* Clinical Summary */}
              <div className={`flex items-start gap-2.5 mt-3 p-3 rounded-xl border ${statusBg}`}>
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-70" />
                <p className="text-[11px] leading-relaxed font-medium">{summary}</p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Current</p>
                  <p className="text-sm font-bold text-slate-900">
                    {isNaN(currNum) ? '—' : currNum.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-400">{analyte.unit}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Previous</p>
                  <p className="text-sm font-bold text-slate-900">
                    {prevNum !== null && !isNaN(prevNum) ? prevNum.toFixed(2) : '—'}
                  </p>
                  <p className="text-[10px] text-slate-400">{analyte.unit}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Change</p>
                  <p className={`text-sm font-bold ${delta === null ? 'text-slate-400' : delta > 0 ? 'text-rose-600' : delta < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta.toFixed(2)}`}
                  </p>
                  <p className="text-[10px] text-slate-400">{deltaPct ? `${deltaPct}%` : ''}</p>
                </div>
              </div>

              {/* Reference Range */}
              {analyte.reference_range && (
                <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                  <TrendingUp className="w-3 h-3 shrink-0 text-primary-500" />
                  <span><span className="font-semibold text-slate-600">Normal range:</span> {analyte.reference_range} {analyte.unit}</span>
                </div>
              )}

              {/* Trend Chart */}
              {analyte.history.length > 1 ? (
                <div className={`${forceExpand ? 'h-40' : 'h-48'} bg-white rounded-xl border border-slate-100 p-2`}>
                  <TrendChart data={analyte.history} unit={analyte.unit} />
                </div>
              ) : analyte.history.length === 1 ? (
                <div className="py-5 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Activity className="w-5 h-5 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-[11px] font-medium text-slate-400">Only one data point — trend available after next test.</p>
                </div>
              ) : (
                <div className="py-5 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Activity className="w-5 h-5 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-[11px] font-medium text-slate-400">No historical data available yet.</p>
                </div>
              )}

              {/* History date range */}
              {analyte.history.length > 0 && (
                <p className="text-center text-[10px] text-slate-400 font-medium">
                  Data from {new Date(analyte.history[analyte.history.length - 1].date).toLocaleDateString('en-IN')} to {new Date(analyte.history[0].date).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
