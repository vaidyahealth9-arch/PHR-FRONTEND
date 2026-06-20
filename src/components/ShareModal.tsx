import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

interface ShareModalProps {
  recordId: number;
  onClose: () => void;
  onShareSuccess?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ recordId, onClose, onShareSuccess }) => {
  const { request } = useApi();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [duration, setDuration] = useState(24);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<any>(null);
  const [activeShares, setActiveShares] = useState<any[]>([]);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  useEffect(() => {
    loadActiveShares();
  }, [recordId]);

  const loadActiveShares = async () => {
    try {
      const response = await request(`/api/v1/records/${recordId}/share`, {
        method: 'GET',
      });
      setActiveShares(response);
    } catch (err) {
      // Silently fail for loading active shares
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShareLink(null);

    try {
      const response = await request(`/api/v1/records/${recordId}/share`, {
        method: 'POST',
        body: JSON.stringify({
          recipient_email: recipientEmail || null,
          access_duration_hours: duration,
        }),
      });

      setShareLink(response);
      setRecipientEmail('');
      if (onShareSuccess) {
        onShareSuccess();
      }
      loadActiveShares();
    } catch (err: any) {
      setError(err.message || 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  const revokeShare = async (token: string) => {
    try {
      await request(`/api/v1/records/${recordId}/share/${token}`, {
        method: 'DELETE',
      });
      loadActiveShares();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke share link');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-[1.75rem] shadow-xl max-w-md w-full mx-4 border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-gradient-to-r from-primary-50 to-success-50">
          <h2 className="text-xl font-black text-slate-900">Share Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-danger-50 border border-danger-200 rounded-2xl p-3">
              <p className="text-danger-700 text-sm">{error}</p>
            </div>
          )}

          {shareLink ? (
            // Share Link Created
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Share link created! Copy and send this link to share the report:
              </p>
              <div className="bg-primary-50 p-3 rounded-2xl border border-primary-100">
                <p className="font-mono text-xs text-primary-900 break-all">{shareLink.link}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(shareLink.link)}
                  className="flex-1 px-4 py-2 bg-primary-700 text-white rounded-2xl hover:bg-primary-800 font-medium text-sm"
                >
                  {showCopySuccess ? '✓ Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={() => setShareLink(null)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-2xl hover:bg-slate-300 font-medium text-sm"
                >
                  Create Another
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Expires: {new Date(shareLink.expires_at).toLocaleString()}
              </p>
            </div>
          ) : (
            // Create Share Form
            <>
              <form onSubmit={handleShare} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={1}>1 hour</option>
                    <option value={24}>24 hours</option>
                    <option value={168}>7 days</option>
                    <option value={720}>30 days</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-primary-700 text-white rounded-2xl hover:bg-primary-800 disabled:bg-slate-400 font-medium"
                >
                  {loading ? 'Creating...' : 'Create Share Link'}
                </button>
              </form>

              {/* Active Shares */}
              {activeShares.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">Active Share Links</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {activeShares.map((share) => (
                      <div
                        key={share.id}
                        className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                      >
                        <div className="flex-1">
                          <p className="text-gray-600">
                            {share.recipient_email || 'Public link'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {share.is_revoked ? (
                              <span className="text-red-600">Revoked</span>
                            ) : (
                              `Expires: ${new Date(share.expires_at).toLocaleDateString()}`
                            )}
                          </p>
                        </div>
                        {!share.is_revoked && (
                          <button
                            onClick={() => revokeShare(share.token)}
                            className="text-danger-700 hover:text-danger-800 text-xs font-medium ml-2"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-[1.75rem]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-200 text-slate-800 rounded-2xl hover:bg-slate-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
