import { useQuery } from '@tanstack/react-query';
import { Receipt, RefreshCw, IndianRupee, CheckCircle2, Clock, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { limsApi } from '../api/client';
import { useActiveProfile } from '../context/ProfileContext';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import ProfileSwitcher from '../components/ProfileSwitcher';
import EmptyState from '../components/EmptyState';

interface BillData {
  billId: number;
  invoiceNumber: string;
  status: string;
  totalAmount: number | null;
  discountAmount: number | null;
  netAmount: number | null;
  amountPaid: number | null;
  amountDue: number | null;
  paymentMethod: string | null;
  invoiceDate: string;
  patientName: string | null;
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function getStatusConfig(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'PAID') return { label: 'Paid', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-400' };
  if (s === 'PARTIALLY_PAID') return { label: 'Partial', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-400' };
  if (s === 'CANCELLED') return { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-400' };
  if (s === 'DUE' || s === 'ISSUED')
    return { label: s === 'DUE' ? 'Due' : 'Issued', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', bar: 'bg-orange-400' };
  return { label: status, icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50', bar: 'bg-slate-300' };
}

export default function Billing() {
  const { profiles, activeProfileId } = useActiveProfile();
  const validActiveProfileId =
    activeProfileId && profiles.some((p) => p.id === activeProfileId) ? activeProfileId : '';

  const { data: bills = [], isLoading: loading, refetch } = useQuery<BillData[]>({
    queryKey: ['bills', validActiveProfileId],
    queryFn: async () => {
      const res = await limsApi.getLinkedBills(validActiveProfileId || undefined);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!validActiveProfileId,
  });

  const error = null;
  const fetchBills = () => { refetch(); };

  const totalBilled = bills.reduce((sum, b) => sum + (b.netAmount || 0), 0);
  const totalPaid = bills.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const totalDue = bills.reduce((sum, b) => sum + (b.amountDue || 0), 0);

  const headerStats = [
    { label: 'Billed', value: formatCurrency(totalBilled) },
    { label: 'Paid', value: formatCurrency(totalPaid) },
    { label: 'Due', value: formatCurrency(totalDue) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-3 pb-20 space-y-3"
    >
      {/* Unified Header */}
      <PageHeader
        icon={<IndianRupee size={22} strokeWidth={2} />}
        title="Billing"
        subtitle="Lab invoices & payment history"
        stats={headerStats}
        action={
          <button
            onClick={fetchBills}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-soft active:scale-95 transition-all"
            title="Refresh bills"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        }
      />

      {/* Profile Switcher */}
      <div className="glass-panel rounded-2xl p-3">
        <ProfileSwitcher label="Viewing bills for" />
      </div>

      {/* Invoices Section */}
      <div className="flex items-center justify-between px-0.5">
        <p className="section-label mb-0">Invoices</p>
        <span className="text-[10px] font-semibold text-slate-400">{bills.length} total</span>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-4">
          <div className="w-10 h-10 border-2 border-primary-100 border-t-primary-700 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-400">Loading invoices...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-6 rounded-[2rem] border-rose-100 bg-rose-50/50 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-rose-600">{error}</p>
          <button onClick={fetchBills} className="btn btn-secondary h-10 px-6 text-xs uppercase font-black">
            Retry
          </button>
        </div>
      ) : bills.length === 0 ? (
        <EmptyState
          icon={<Receipt size={24} />}
          title="No invoices yet"
          subtitle="Visit a connected lab to see billing statements here."
        />
      ) : (
        <div className="space-y-2">
          {bills.map((bill, idx) => {
            const statusConfig = getStatusConfig(bill.status);
            const StatusIcon = statusConfig.icon;
            return (
              <motion.div
                key={bill.billId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="card hover:border-primary-200 hover:shadow-[0_4px_16px_rgba(15,103,134,0.1)] transition-all group"
              >
                {/* Status bar */}
                <div className={`h-0.5 w-full ${statusConfig.bar} opacity-70`} />

                <div className="p-3.5 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Invoice #{bill.invoiceNumber}
                      </p>
                      <h4 className="text-lg font-black text-slate-900 group-hover:text-primary-700 transition-colors leading-tight">
                        {formatCurrency(bill.netAmount)}
                      </h4>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${statusConfig.bg} ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3" strokeWidth={2.5} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{statusConfig.label}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-2.5 border-y border-dashed border-slate-100">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Patient</p>
                      <p className="text-[11px] font-bold text-slate-700 truncate">{bill.patientName || 'Primary Member'}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                      <p className="text-[11px] font-bold text-slate-700">
                        {bill.invoiceDate
                          ? new Date(bill.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-[10px] font-bold text-slate-400">
                        Paid: <span className="text-slate-700">{formatCurrency(bill.amountPaid)}</span>
                      </p>
                      {(bill.amountDue ?? 0) > 0 && (
                        <>
                          <span className="w-0.5 h-0.5 bg-slate-200 rounded-full" />
                          <p className="text-[10px] font-black text-rose-500">
                            Due: {formatCurrency(bill.amountDue)}
                          </p>
                        </>
                      )}
                      {bill.paymentMethod && (
                        <>
                          <span className="w-0.5 h-0.5 bg-slate-200 rounded-full" />
                          <p className="text-[10px] font-semibold text-slate-400 capitalize">{bill.paymentMethod}</p>
                        </>
                      )}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary-100 group-hover:text-primary-700 transition-all">
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Support Footer */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle size={13} className="text-slate-400" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Billing Support</p>
        </div>
        <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
          Payment processing can take up to 24 hours. For disputes, contact your lab directly using the Invoice number.
        </p>
      </div>
    </motion.div>
  );
}
