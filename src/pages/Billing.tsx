import { useEffect, useState } from 'react';
import { Receipt, RefreshCw, IndianRupee, CheckCircle2, Clock, XCircle, AlertCircle, ChevronRight, Filter } from 'lucide-react';
import { limsApi } from '../api/client';
import { useActiveProfile } from '../context/ProfileContext';
import { motion } from 'framer-motion';

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
  if (amount === null || amount === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

function getStatusConfig(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'PAID') return { label: 'Paid', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' };
  if (s === 'PARTIALLY_PAID') return { label: 'Partial', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' };
  if (s === 'CANCELLED') return { label: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' };
  if (s === 'DUE' || s === 'ISSUED') return { label: s === 'DUE' ? 'Due' : 'Issued', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' };
  return { label: status, icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50' };
}

export default function Billing() {
  const [bills, setBills] = useState<BillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { profiles, activeProfileId } = useActiveProfile();
  const validActiveProfileId = activeProfileId && profiles.some((p) => p.id === activeProfileId)
    ? activeProfileId
    : '';

  const fetchBills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await limsApi.getLinkedBills(validActiveProfileId || undefined);
      setBills(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError('Failed to load billing data. Please try again.');
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [validActiveProfileId]);

  const totalBilled = bills.reduce((sum, b) => sum + (b.netAmount || 0), 0);
  const totalPaid = bills.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const totalDue = bills.reduce((sum, b) => sum + (b.amountDue || 0), 0);

  const quickStats = [
    { label: 'Total Billed', value: formatCurrency(totalBilled), color: 'text-primary-700', bg: 'bg-primary-50', icon: IndianRupee },
    { label: 'Total Paid', value: formatCurrency(totalPaid), color: 'text-success-700', bg: 'bg-success-50', icon: CheckCircle2 },
    { label: 'Outstanding', value: formatCurrency(totalDue), color: 'text-danger-700', bg: 'bg-danger-50', icon: AlertCircle },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-5 pb-24 space-y-6"
    >
      {/* Universal Header Card */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-success-600 rounded-[2rem] shadow-premium p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
        <div className="relative space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-[1.25rem] flex items-center justify-center border border-white/30 shadow-soft flex-shrink-0">
              <IndianRupee className="w-8 h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black truncate tracking-tight">Billing Hub</h1>
              <p className="text-primary-100 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">LIMS Transactions</p>
            </div>
            <button 
              onClick={fetchBills}
              className="ml-auto w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-soft active:scale-95 transition-all"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            {quickStats.map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                <p className="text-xl font-black tracking-tighter leading-none">{stat.value.split('.')[0]}</p>
                <p className="text-[9px] font-black text-primary-100 uppercase tracking-widest mt-1.5 opacity-70 truncate">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bills Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-black text-slate-900 tracking-tight">Invoices</h3>
        <button className="text-xs font-semibold text-slate-500 flex items-center gap-2 hover:text-primary-600 transition-colors">
          <Filter size={12} /> Filter
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 border-3 border-primary-100 border-t-primary-700 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-400">Loading statements...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-6 rounded-[2rem] border-rose-100 bg-rose-50/50 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-rose-600">{error}</p>
          <button onClick={fetchBills} className="btn btn-secondary h-10 px-6 text-xs uppercase font-black">Retry</button>
        </div>
      ) : bills.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-soft">
            <Receipt className="text-slate-200" size={32} />
          </div>
          <p className="text-sm font-extrabold text-slate-500">No invoices yet</p>
          <p className="text-xs text-slate-400 mt-1">Visit a lab to see statements here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bills.map((bill, idx) => {
            const statusConfig = getStatusConfig(bill.status);
            const StatusIcon = statusConfig.icon;
            return (
              <motion.div
                key={bill.billId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card border-slate-100 shadow-soft group hover:border-primary-200 overflow-hidden"
              >
                {/* Status Bar */}
                <div className={`h-1.5 w-full ${statusConfig.bg.replace('50', '500')} opacity-50`} />
                
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Invoice</p>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <p className="text-xs font-extrabold text-slate-600">#{bill.invoiceNumber}</p>
                      </div>
                        <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-primary-700 transition-colors">
                        {formatCurrency(bill.netAmount)}
                      </h4>
                    </div>

                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${statusConfig.bg} ${statusConfig.color} border border-white shadow-soft transition-transform group-hover:scale-105`}>
                      <StatusIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{statusConfig.label}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-dashed border-slate-100">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Patient</p>
                      <p className="text-xs font-extrabold text-slate-700 truncate">{bill.patientName || 'Main Member'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dated</p>
                      <p className="text-xs font-extrabold text-slate-700">
                        {bill.invoiceDate ? new Date(bill.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'NA'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Paid: {formatCurrency(bill.amountPaid)}</p>
                      {(bill.amountDue ?? 0) > 0 && (
                        <>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <p className="text-[10px] font-black text-rose-500 uppercase">Due: {formatCurrency(bill.amountDue)}</p>
                        </>
                      )}
                    </div>
                    <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary-100 group-hover:text-primary-700 transition-all">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FAQ Footer */}
      <section className="pt-6 pb-12">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={14} className="text-slate-400" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Billing Support</p>
          </div>
          <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
            Payment processing can take up to 24 hours. For disputes, contact the lab directly using the Invoice ID.
          </p>
        </div>
      </section>
    </motion.div>
  );
}

