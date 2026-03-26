import { useEffect, useRef, useState } from "react";
import { useStockData } from "./useStockData";

export const useSocket = () => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const { symbols } = useStockData();
  const token = import.meta.env.VITE_FINNHUB_API_KEY;
  const socketInitialize = () => {
    if (!symbols.length) return;

    const socket = new WebSocket(`wss://ws.finnhub.io?token=${token}`);

    socket.onopen = () => {
      console.log("✅ socket connected");

      symbols.forEach((symbol) => {
        socket.send(JSON.stringify({ type: "subscribe", symbol }));
      });
    };

    socket.onmessage = (event) => {
      const res = JSON.parse(event.data);

      if (res.type === "trade") {
        setPrices((prev) => {
          const updated = { ...prev };

          res.data.forEach((trade: any) => {
            updated[trade.s] = trade.p;
          });

          return updated;
        });
      }
    };

    socket.onerror = (err) => {
      console.error("❌ socket error", err);
    };

    socket.onclose = () => {
      console.log("🔌 socket closed");
    };
  };

  return { socketInitialize, prices };
};
