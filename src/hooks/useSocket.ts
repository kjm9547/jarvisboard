import { useEffect, useRef, useState } from "react";
import { useStockData } from "./useStockData";

export const useSocket = () => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const { symbols } = useStockData();
  const token = import.meta.env.VITE_FINNHUB_API_KEY;
  const socketRef = useRef<WebSocket | null>(null);

  const socketInitialize = () => {
    if (!symbols.length) return;
    if (socketRef.current) {
      socketRef.current.close();
    }

    const socket = new WebSocket(`wss://ws.finnhub.io?token=${token}`);
    socketRef.current = socket;

    socket.onopen = () => {
      symbols.forEach((symbol) => {
        socket.send(JSON.stringify({ type: "subscribe", symbol }));
      });
    };

    socket.onmessage = (event) => {
      const res = JSON.parse(event.data);
      if (res.type === "trade") {
        setPrices((prev) => {
          const updated = { ...prev };
          res.data.forEach((trade: { s: string; p: number }) => {
            updated[trade.s] = trade.p;
          });
          return updated;
        });
      }
    };

    socket.onerror = () => {
      // connection errors are expected when market is closed
    };
  };

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  return { socketInitialize, prices };
};
