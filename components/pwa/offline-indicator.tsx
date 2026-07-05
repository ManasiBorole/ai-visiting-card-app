"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

import { useMounted } from "@/hooks/use-mounted";

export function OfflineIndicator() {
  const mounted = useMounted();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!mounted || isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950"
    >
      <WifiOff className="size-4" />
      You are offline. Cached pages remain available.
    </div>
  );
}
