'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, CreditCard, Receipt, PlusCircle, CheckCircle, Search, AlertCircle, FileSpreadsheet, LayoutDashboard, List, LayoutGrid } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useDataSync, notifyGlobalDataChange } from '../context/DataSyncContext';
import AllServicesPanel from './AllServicesPanel';

export default function AccountantDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('fees');
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

  useDataSync(useCallback(() => {
    fetchFees();
  }, []));

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
        notifyGlobalDataChange('FEE', 'PAYMENT', data);
        fetchFees();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [feeViewMode, setFeeViewMode] = useState('list');

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

      {/* Tab Navigation */}
      <div className="flex items-center gap-2">
        {[
          { id: 'fees', label: 'Fee Management', icon: DollarSign },
          { id: 'services', label: 'All Services', icon: LayoutDashboard },
        ].map(tab => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                isSel ? 'gradient-primary text-white border-indigo-400/40 shadow-lg shadow-indigo-500/20' : 'glass-panel text-slate-400 hover:text-white border-slate-700'
              }`}>
              <Icon className="w-4 h-4" /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'services' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <AllServicesPanel role="ACCOUNTANT" />
        </div>
      )}

      {/* BACK BUTTON — shown on fee management tab */}
      {activeTab === 'fees' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <button
            onClick={() => setActiveTab('services')}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '6px 14px 6px 10px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#a5b4fc'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            Back to All Services
          </button>
        </div>
      )}

      {activeTab === 'fees' && (<>

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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg font-bold text-white">Student Fee Ledger</h3>

            {/* View Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-700">
              <button
                type="button"
                onClick={() => setFeeViewMode('list')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  feeViewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                type="button"
                onClick={() => setFeeViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  feeViewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>
            </div>
          </div>

          {feeViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {studentFees.map(fee => (
                <div key={fee._id} className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between shadow-lg">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="font-extrabold text-white text-sm">{fee.studentName}</h4>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        fee.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {fee.status}
                      </span>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                      <div className="text-slate-400 font-medium">Structure: <strong className="text-slate-200">{fee.feeStructureTitle}</strong></div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400">Total Amount:</span>
                        <span className="font-mono text-white font-bold">${fee.totalAmount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Paid Amount:</span>
                        <span className="font-mono text-emerald-400 font-bold">${fee.paidAmount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Remaining Due:</span>
                        <span className="font-mono text-amber-400 font-bold">${fee.dueAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    {fee.dueAmount > 0 ? (
                      <button 
                        onClick={() => { setSelectedFee(fee); setReceiptResult(null); }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-md cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Record Payment
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-bold text-center block py-1">Fully Paid ✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
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
      </>)}

    </div>
  );
}
