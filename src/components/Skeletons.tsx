export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-7 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="skeleton h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="skeleton h-3.5 w-2/3 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
          </div>
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-4/5 rounded" />
          <div className="flex gap-2 pt-1">
            <div className="skeleton h-5 w-14 rounded-full" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 sm:px-8 py-16 sm:py-24 flex flex-col gap-10">
      <div className="skeleton h-8 w-2/3 rounded" />
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="flex flex-col gap-4 pb-10 border-b border-[var(--border)]">
        <div className="skeleton h-3.5 w-full rounded" />
        <div className="skeleton h-3.5 w-5/6 rounded" />
        <div className="skeleton h-3.5 w-2/3 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-24 rounded-full" />
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="mx-auto max-w-5xl px-6 sm:px-8 py-16 sm:py-24 w-full">
      <div className="skeleton h-9 w-1/2 rounded mb-12" />
      <CardGridSkeleton />
    </div>
  );
}
