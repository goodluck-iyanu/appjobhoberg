export default function Loading() {
  return (
    <div className="flex-1 bg-[#f5f5f7] flex flex-col items-center justify-center min-h-[70vh]">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 border-4 border-white border-t-[#e02424] rounded-full animate-spin shadow-sm"></div>
        {/* Inner static dot */}
        <div className="w-3 h-3 bg-[#e02424] rounded-full animate-pulse"></div>
      </div>
      <p className="mt-4 text-[14px] font-semibold text-[#86868b] tracking-wide animate-pulse">
        Loading Hoberg Jobs...
      </p>
    </div>
  )
}
