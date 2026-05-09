function Skeleton({ className = '' }) {
  return (
    <div className={`bg-slate-200 animate-pulse rounded-xl ${className}`} />
  )
}

export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
      <Skeleton className="h-36 rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100">
      <Skeleton className="h-10 w-10 mb-3" />
      <Skeleton className="h-7 w-20 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 flex items-center gap-5">
        <Skeleton className="w-20 h-20 rounded-2xl flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      {[1, 2].map(i => (
        <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(j => (
              <div key={j} className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Skeleton
