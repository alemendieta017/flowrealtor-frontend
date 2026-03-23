"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { listingsApi } from "@/lib/api";
import type { ListingStatus } from "@/lib/types";

export type StepStatus = "idle" | "processing" | "done" | "failed";

export interface ListingProgress {
  brief: StepStatus;
  social: StepStatus;
  video: StepStatus;
  videoProgress: number;
  complete: boolean;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function useListingStatus(propertyId: string | null) {
  const [progress, setProgress] = useState<ListingProgress>({
    brief: "idle",
    social: "idle",
    video: "idle",
    videoProgress: 0,
    complete: false,
  });
  const [status, setStatus] = useState<ListingStatus | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!propertyId) return;
    try {
      const data = await listingsApi.getStatus(propertyId);
      setStatus(data);
    } catch {
      // ignore
    }
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) return;

    const socket = io(`${BACKEND_URL}/events`, {
      query: { propertyId },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on(
      "listing:progress",
      (payload: {
        propertyId: string;
        step: "brief" | "social" | "video";
        status: "processing" | "done" | "failed";
        progress?: number;
      }) => {
        if (payload.propertyId !== propertyId) return;
        setProgress((prev) => ({
          ...prev,
          [payload.step]: payload.status,
          videoProgress:
            payload.step === "video" && payload.progress != null
              ? payload.progress
              : prev.videoProgress,
        }));

        if (payload.status === "done") {
          fetchStatus();
        }
      },
    );

    socket.on("listing:complete", () => {
      setProgress((prev) => ({ ...prev, complete: true }));
      fetchStatus();
    });

    return () => {
      socket.disconnect();
    };
  }, [propertyId, fetchStatus]);

  return { progress, status, refetch: fetchStatus };
}
