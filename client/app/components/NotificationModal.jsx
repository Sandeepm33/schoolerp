'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, X, CheckCheck, Trash2, ExternalLink, 
  Sparkles, FileText, CreditCard, AlertCircle, RefreshCw, Zap
} from 'lucide-react';

export default function NotificationModal({ isOpen, onClose, onUnreadCountChange }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, INQUIRY, SYSTEM

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
          if (onUnreadCountChange) {
            onUnreadCountChange(data.unreadCount || 0);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAsRead = async (id, link, e) => {
    if (e) e.stopPropagation();
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      const data = await res.json();
      if (onUnreadCountChange && data.unreadCount !== undefined) {
        onUnreadCountChange(data.unreadCount);
      }
      if (link) {
        onClose();
        router.push(link);
      }
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      const res = await fetch('/api/notifications/read-all', { method: 'PUT' });
      const data = await res.json();
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      setNotifications([]);
      await fetch('/api/notifications/clear', { method: 'DELETE' });
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'INQUIRY') return n.type === 'INQUIRY';
    if (filter === 'SYSTEM') return n.type === 'SYSTEM' || n.type === 'ANNOUNCEMENT';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'INQUIRY':
        return { bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', label: 'Lead Inquiry', icon: Sparkles };
      case 'ADMISSION':
        return { bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30', label: 'Admission', icon: FileText };
      case 'FEE':
        return { bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', label: 'Fee Payment', icon: CreditCard };
      default:
        return { bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', label: 'System Alert', icon: Zap };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-2 sm:p-4 pt-16 sm:pt-20 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
        className="w-full max-w-sm sm:max-w-md border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-top-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div 
          style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
          className="px-4 py-3.5 border-b flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Bell className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 style={{ color: '#0f172a' }} className="font-extrabold text-sm text-slate-900 tracking-tight">
                  System Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500 text-slate-950 rounded-full animate-pulse">
                    {unreadCount} UNREAD
                  </span>
                )}
              </div>
              <p style={{ color: '#475569' }} className="text-[11px] font-bold text-slate-600">
                Real-time alerts, leads & activity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Refresh Notifications"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : 'text-slate-700'}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>

        {/* CONTROLS & FILTER TABS */}
        <div 
          style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
          className="px-4 py-2.5 border-b flex items-center justify-between gap-2 overflow-x-auto shrink-0"
        >
          <div className="flex items-center gap-1">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'UNREAD', label: `Unread (${unreadCount})` },
              { id: 'INQUIRY', label: 'Inquiries' },
              { id: 'SYSTEM', label: 'System' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0 hover:underline px-1 py-0.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* NOTIFICATION LIST */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1 bg-white">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <div className="p-3 rounded-full bg-slate-100 text-slate-500">
                <Bell className="w-6 h-6" />
              </div>
              <p style={{ color: '#0f172a' }} className="text-xs font-bold text-slate-900">No notifications found</p>
              <span style={{ color: '#64748b' }} className="text-[10px] text-slate-500 font-medium">
                New leads and system events will appear here live
              </span>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const badge = getTypeBadge(item.type);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={item._id}
                  onClick={(e) => handleMarkAsRead(item._id, item.link, e)}
                  style={{
                    backgroundColor: !item.read ? '#f0fdf4' : '#ffffff',
                    borderColor: !item.read ? '#bbf7d0' : '#f1f5f9'
                  }}
                  className="group relative p-3 rounded-xl transition-all cursor-pointer border hover:shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    {/* TYPE ICON BADGE */}
                    <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${badge.bg}`}>
                      <BadgeIcon className="w-4 h-4" />
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span style={{ color: '#64748b' }} className="text-[10px] font-bold text-slate-500">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      <h4 
                        style={{ color: '#0f172a' }} 
                        className={`text-xs font-black leading-snug text-slate-900`}
                      >
                        {item.title}
                      </h4>
                      <p 
                        style={{ color: '#334155' }} 
                        className="text-[11px] text-slate-700 font-medium leading-relaxed mt-0.5 line-clamp-2"
                      >
                        {item.message}
                      </p>

                      {item.link && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 mt-1.5 group-hover:underline">
                          View details <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    {/* UNREAD GLOWING DOT & MARK READ */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      {!item.read && (
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse"></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div 
          style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }}
          className="px-4 py-2.5 border-t flex items-center justify-between text-xs shrink-0"
        >
          <span style={{ color: '#64748b' }} className="text-[10px] font-bold text-slate-500">
            Live atlas server sync active
          </span>
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
