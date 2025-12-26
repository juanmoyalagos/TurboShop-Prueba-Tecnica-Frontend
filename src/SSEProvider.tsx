import { createContext, useContext, useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

type Listener = (data: unknown) => void;

type SSEContextValue = {
  subscribe: (fn: Listener) => () => void;
};

const SSEContext = createContext<SSEContextValue | null>(null);

function createEventSource(listenersRef: { current: Set<Listener> }) {
  if (!API_URL) return null;

  const es = new EventSource(`${API_URL}/sse/events`);

  es.onopen = () => {
    console.log("[SSE] conectado");
  };

  es.onmessage = (ev) => {
    let payload: unknown;
    try {
      payload = JSON.parse(ev.data);
    } catch {
      payload = ev.data;
    }
    listenersRef.current.forEach((fn) => fn(payload));
  };

  es.onerror = (err) => {
    console.error("[SSE] error", err);
    es.close();
  };

  return es;
}

export function SSEProvider({ children }: { children: React.ReactNode }) {
  const listenersRef = useRef<Set<Listener>>(new Set());

  useEffect(() => {
    let es = createEventSource(listenersRef);
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const tryReconnect = () => {
      if (retryTimeout) return;
      retryTimeout = setTimeout(() => {
        es = createEventSource(listenersRef);
        retryTimeout = null;
      }, 2000);
    };

    if (es) {
      es.onerror = (err) => {
        console.error("[SSE] error", err);
        es?.close();
        tryReconnect();
      };
    }

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      es?.close();
    };
  }, []);

  const subscribe = (fn: Listener) => {
    listenersRef.current.add(fn);
    return () => {
      listenersRef.current.delete(fn);
    };
  };

  return (
    <SSEContext.Provider value={{ subscribe }}>{children}</SSEContext.Provider>
  );
}

export function useSSE(onMessage: Listener) {
  const ctx = useContext(SSEContext);

  useEffect(() => {
    if (!ctx) return;
    return ctx.subscribe(onMessage);
  }, [ctx, onMessage]);
}

