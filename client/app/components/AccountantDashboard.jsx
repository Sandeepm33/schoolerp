'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Receipt, PlusCircle, CheckCircle, Search, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';

export default function AccountantDashboard() {
  const { token } = useAuth();
  const [studentFees, setStudentFees] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(false);

  // Manual payment modal state
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'CASH',
    transactionRef: ''
  });
  const [receiptResult, setReceiptResult] = useState(null);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/fees/student-fees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStudentFees(await res.json());
      }
      const structRes = await fetch(`${API_BASE}/fees/structures`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (structRes.ok) {
        setFeeStructures(await structRes.json());
      }
    } catch (e) {
      console.warn('Fee fetch error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedFee || !paymentForm.amount) return;

    try {
      const res = await fetch(`${API_BASE}/fees/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentFeeId: selectedFee._id,
          amount: Number(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          transactionRef: paymentForm.transactionRef
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReceiptResult(data);
        fetchFees();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
            Admin & Accountant Exclusive Module
          </span>
          <h2 className="text-xl font-black text-white mt-2">School Fee & Finance Management</h2>
          <p className="text-xs text-slate-400">Record manual payments, generate official receipts & manage fee structures</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">Total Collection 2026</p>
            <p className="text-2xl font-black text-emerald-400">$9,500.00</p>
          </div>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Fees Collected</p>
              <h3 className="text-2xl font-black text-white mt-1">$9,500</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Outstanding Balance</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">$2,000</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Fee Structures Active</p>
              <h3 className="text-2xl font-black text-indigo-400 mt-1">{feeStructures.length || 1}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Fee Ledger Table & Record Payment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ledger Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white">Student Fee Ledger</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Fee Structure</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Due</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {studentFees.map(fee => (
                  <tr key={fee._id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">{fee.studentName}</td>
                    <td className="p-3 text-slate-400">{fee.feeStructureTitle}</td>
                    <td className="p-3 font-mono">${fee.totalAmount}</td>
                    <td className="p-3 font-mono text-emerald-400">${fee.paidAmount}</td>
                    <td className="p-3 font-mono text-amber-400">${fee.dueAmount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        fee.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {fee.dueAmount > 0 ? (
                        <button 
                          onClick={() => { setSelectedFee(fee); setReceiptResult(null); }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold transition"
                        >
                          Record Payment
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">Fully Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Manual Payment Form Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" /> Manual Payment Entry
          </h3>
          
          {selectedFee ? (
            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
                <p className="text-slate-400">Student: <strong className="text-white">{selectedFee.studentName}</strong></p>
                <p className="text-slate-400">Remaining Due: <strong className="text-amber-400">${selectedFee.dueAmount}</strong></p>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Amount Paid ($)</label>
                <input 
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder={`Max $${selectedFee.dueAmount}`}
                  max={selectedFee.dueAmount}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Payment Method</label>
                <select 
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="CASH">Cash Payment</option>
                  <option value="UPI">UPI Digital</option>
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Transaction Ref / Cheque No</label>
                <input 
                  type="text"
                  value={paymentForm.transactionRef}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                  placeholder="e.g. UPI-9847291048 or Chq #00918"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 gradient-primary text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/30 hover:opacity-90 transition"
              >
                Submit Payment & Issue Receipt
              </button>
            </form>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
              Select a student from the ledger to record a payment.
            </div>
          )}

          {/* Generated Receipt Output */}
          {receiptResult && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs space-y-2">
              <div className="flex items-center text-emerald-400 font-bold gap-2">
                <CheckCircle className="w-4 h-4" /> Payment Verified
              </div>
              <p className="text-slate-300">Official Receipt #: <strong className="font-mono text-white">{receiptResult.receiptNo}</strong></p>
              <p className="text-slate-400 text-[11px]">Recorded by Accountant in persistent MongoDB ledger.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
