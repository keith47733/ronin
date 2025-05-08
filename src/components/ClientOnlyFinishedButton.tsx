// ClientOnlyFinishedButton is a wrapper to ensure the finished button only renders on the client.
// This is needed because some hooks (like useAnimation) require the DOM and can't run on the server.
// In Next.js, 'use client' marks this as a Client Component.
"use client";
import FinishedButtonInHeader from "./FloatingFinishedButton";
export default function ClientOnlyFinishedButton() {
  return <FinishedButtonInHeader />;
} 