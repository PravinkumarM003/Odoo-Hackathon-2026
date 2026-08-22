export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div>
          <div className="h-8 w-64 bg-neutral-50/5 rounded-xl" />
          <div className="h-4 w-40 bg-neutral-50/3 rounded-lg mt-2" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-neutral-50/5 rounded-xl" />
          <div className="h-10 w-32 bg-neutral-50/5 rounded-xl" />
        </div>
      </div>
      {/* Attendance card skeleton */}
      <div className="h-20 bg-neutral-50/3 rounded-2xl border border-neutral-50/5" />
      {/* Stats row skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 bg-neutral-50/3 rounded-2xl border border-neutral-50/5" />
        <div className="h-28 bg-neutral-50/3 rounded-2xl border border-neutral-50/5" />
        <div className="h-28 bg-neutral-50/3 rounded-2xl border border-neutral-50/5" />
      </div>
      {/* Content skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 bg-neutral-50/3 rounded-2xl border border-neutral-50/5" />
        <div className="h-48 bg-neutral-50/3 rounded-2xl border border-neutral-50/5" />
      </div>
    </div>
  );
}
