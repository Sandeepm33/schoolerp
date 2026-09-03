'use client';

import React, { createContext, useContext, useEffect, useCallback, useState, useRef } from 'react';

const DataSyncContext = createContext();

const CHANNEL_NAME = 'school_erp_realtime_sync';
const CUSTOM_EVENT_NAME = 'school_erp_data_changed';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
const STREAM_URL = `${BASE_URL}/sync/stream`;
const CHECK_URL = `${BASE_URL}/sync/check`;

// Helper to broadcast changes globally outside React component lifecycle if needed
export const notifyGlobalDataChange = (entity = 'ALL', action = 'UPDATE', payload = {}) => {
  const eventData = {
    entity,
    action,
    payload,
    timestamp: Date.now()
  };

  // 1. Dispatch in current window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_NAME, { detail: eventData }));

    // 2. Broadcast across tabs
    if ('BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(CHANNEL_NAME);
        bc.postMessage(eventData);
        bc.close();
      } catch (err) {
        console.warn('BroadcastChannel post error:', err);
      }
    }
  }
};

export function DataSyncProvider({ children }) {
  const [lastSyncEvent, setLastSyncEvent] = useState(null);
  const [isSyncActive, setIsSyncActive] = useState(false);
  const lastMutationRef = useRef(0);

  const triggerDataChange = useCallback((entity = 'ALL', action = 'UPDATE', payload = {}) => {
    notifyGlobalDataChange(entity, action, payload);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let eventSource = null;
    let bc = null;
    let fallbackInterval = null;

    // 1. Setup local BroadcastChannel for tab-to-tab speed
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data) {
          setLastSyncEvent(event.data);
          window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_NAME, { detail: event.data }));
        }
      };
    }

    // 2. Listen to window CustomEvents
    const handleLocalEvent = (e) => {
      if (e.detail) {
        setLastSyncEvent(e.detail);
      }
    };
    window.addEventListener(CUSTOM_EVENT_NAME, handleLocalEvent);

    // 3. Setup Server-Sent Events (SSE) to receive real-time updates from other users/devices
    const connectSSE = () => {
      try {
        eventSource = new EventSource(STREAM_URL);

        eventSource.onopen = () => {
          setIsSyncActive(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.type === 'DATA_CHANGE') {
              lastMutationRef.current = data.timestamp;
              setLastSyncEvent(data);
              window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_NAME, { detail: data }));
            } else if (data && data.type === 'CONNECTED') {
              setIsSyncActive(true);
              if (data.lastServerMutationTimestamp) {
                lastMutationRef.current = data.lastServerMutationTimestamp;
              }
            }
          } catch (e) {}
        };

        eventSource.onerror = () => {
          setIsSyncActive(false);
          if (eventSource) {
            eventSource.close();
          }
          // Reconnect after 3s delay
          setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        setIsSyncActive(false);
      }
    };

    connectSSE();

    // 4. Fallback Polling (Check server last mutation timestamp every 4s if SSE misses)
    fallbackInterval = setInterval(async () => {
      try {
        const res = await fetch(CHECK_URL);
        if (res.ok) {
          const info = await res.json();
          if (info && info.lastServerMutationTimestamp && info.lastServerMutationTimestamp > lastMutationRef.current) {
            lastMutationRef.current = info.lastServerMutationTimestamp;
            const syncEvent = {
              entity: 'ALL',
              action: 'SERVER_UPDATE',
              timestamp: info.lastServerMutationTimestamp
            };
            setLastSyncEvent(syncEvent);
            window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_NAME, { detail: syncEvent }));
          }
        }
      } catch (e) {}
    }, 4000);

    return () => {
      window.removeEventListener(CUSTOM_EVENT_NAME, handleLocalEvent);
      if (bc) bc.close();
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, []);

  return (
    <DataSyncContext.Provider value={{ triggerDataChange, lastSyncEvent, isSyncActive }}>
      {children}
    </DataSyncContext.Provider>
  );
}

export function useDataSync(callback, entities = []) {
  const context = useContext(DataSyncContext);

  useEffect(() => {
    if (typeof window === 'undefined' || !callback) return;

    const handleEvent = (e) => {
      const detail = e.detail;
      if (!detail) return;

      const { entity } = detail;
      if (
        !entities ||
        entities.length === 0 ||
        entities.includes('ALL') ||
        entities.includes(entity)
      ) {
        callback(detail);
      }
    };

    window.addEventListener(CUSTOM_EVENT_NAME, handleEvent);
    return () => {
      window.removeEventListener(CUSTOM_EVENT_NAME, handleEvent);
    };
  }, [callback, entities]);

  return context;
}
