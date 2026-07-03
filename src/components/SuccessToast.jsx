"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function SuccessToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return;
    }

    const storageKey = `seller-plan-toast-${sessionId}`;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    toast.success("Payment successful. Your seller plan is now active.");
    sessionStorage.setItem(storageKey, "shown");
  }, [searchParams]);

  return null;
}
