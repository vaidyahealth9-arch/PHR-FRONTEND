import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';

interface ReportSummaryProps {
  recordId: number;
  onClose?: () => void;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({ recordId, onClose }) => {
  const { request } = useApi();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatTwoDecimals = (value: string | number): string => {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(parsed)) {
      return String(value);
    }
    return parsed.toFixed(2);
  };

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await request(`/api/v1/records/${recordId}/summary`, {
        method: 'POST',
      });
      setSummary(response);
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [recordId]);

  if (loading) {
    return <div className="text-center py-8">Generating summary...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 font-semibold">Error</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={fetchSummary}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-gray-900">{summary.title}</h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        )}
      </div>

      {/* Summary Text */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
        <p className="text-gray-700 bg-blue-50 p-4 rounded border-l-4 border-blue-500">
          {summary.summary_text}
        </p>
      </div>

      {/* Key Findings */}
      {summary.key_findings && summary.key_findings.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Key Findings</h4>
          <div className="space-y-2">
            {summary.key_findings.map((finding: any, idx: number) => (
              <div key={idx} className="bg-gray-50 p-3 rounded border-l-4 border-yellow-500">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{finding.analyte}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    finding.status === 'high' ? 'bg-red-100 text-red-800' :
                    finding.status === 'low' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {finding.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-1">{finding.clinical_note}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {formatTwoDecimals(finding.value)} {finding.unit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Significance */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-2">Clinical Significance</h4>
        <p className="text-gray-700 bg-orange-50 p-4 rounded border-l-4 border-orange-500 text-sm">
          {summary.clinical_significance}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-purple-50 border border-purple-200 rounded p-4">
        <p className="text-purple-900 text-xs font-semibold mb-1">⚠ DISCLAIMER</p>
        <p className="text-purple-800 text-xs">{summary.disclaimer}</p>
      </div>

      {/* Confidence */}
      <div className="mt-4 text-right">
        <p className="text-gray-500 text-xs">
          Confidence: {Math.round((summary.confidence || 0) * 100)}%
        </p>
      </div>
    </div>
  );
};

export default ReportSummary;
