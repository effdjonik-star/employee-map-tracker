import { Suspense } from "react";
import HistoryContent from "./HistoryContent";

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
        </div>
      }
    >
      <HistoryContent />
    </Suspense>
  );
}
