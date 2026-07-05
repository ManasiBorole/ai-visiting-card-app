"use client";

import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

export function PwaProvider() {
  return (
    <>
      <ServiceWorkerRegister />
      <OfflineIndicator />
    </>
  );
}
