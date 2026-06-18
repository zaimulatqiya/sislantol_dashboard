import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatCardSkeleton() {
  return (
    <Card className="border-gray-200 shadow-sm rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-5 w-1/2 bg-blue-50/80" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-1/3 mb-1 bg-gray-200" />
        <Skeleton className="h-3 w-2/3 bg-gray-100" />
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-gray-200" />
          <Skeleton className="h-4 w-64 bg-gray-100" />
        </div>
      </div>

      {/* Info Banner */}
      <Skeleton className="h-14 w-full rounded-2xl bg-blue-50/50" />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48 bg-gray-200" />
            <Skeleton className="h-8 w-48 rounded-full bg-gray-100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-48 bg-gray-200" />
              <Skeleton className="h-8 w-24 rounded-full bg-gray-100" />
            </div>
            
            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
               <div className="h-12 border-b bg-gray-50/80" />
               <div className="p-4 space-y-4">
                 {[1, 2, 3, 4, 5].map((i) => (
                   <Skeleton key={i} className="h-10 w-full bg-gray-100/80" />
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32 bg-gray-200" />
              <Skeleton className="h-4 w-16 bg-gray-100" />
            </div>
            <Skeleton className="h-40 w-full rounded-3xl bg-gray-100/50" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-36 bg-gray-200" />
            </div>
            <Skeleton className="h-64 w-full rounded-3xl bg-gray-100/50" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TablePageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-gray-200" />
        <Skeleton className="h-4 w-96 bg-gray-100" />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center p-4 rounded-xl border border-gray-100 bg-gray-50/50">
        <Skeleton className="h-10 w-full bg-white border border-gray-200" />
        <Skeleton className="h-10 w-full lg:w-[160px] bg-white border border-gray-200" />
        <Skeleton className="h-10 w-full lg:w-[160px] bg-white border border-gray-200" />
        <Skeleton className="h-10 w-full lg:w-32 bg-blue-100/50" />
      </div>

      <div className="flex justify-between items-center pb-1">
        <Skeleton className="h-4 w-32 bg-gray-100" />
      </div>

      <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="h-12 border-b bg-gray-50/80" />
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full bg-gray-100/80" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SheetDetailSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-white sticky top-0 z-10 flex flex-row items-start sm:items-center gap-4">
        <Skeleton className="w-9 h-9 rounded-full bg-gray-200 shrink-0 mt-1 sm:mt-0" />
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 bg-gray-200" />
            <Skeleton className="h-4 w-64 bg-gray-100" />
          </div>
          <div className="mt-0">
            <Skeleton className="h-6 w-24 rounded-full bg-blue-100/50" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 bg-gray-50/30">
        <div className="space-y-6">
          <Card className="shadow-sm border-gray-100 bg-white">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 bg-gray-200 mb-4" />
              <div className="w-full h-[1px] bg-gray-100 mb-4" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <Skeleton className="h-4 w-24 bg-gray-100 mb-2" />
                  <Skeleton className="h-5 w-40 bg-gray-200" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 bg-gray-100 mb-2" />
                  <Skeleton className="h-5 w-32 bg-gray-200" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32 bg-gray-100 mb-2" />
                  <Skeleton className="h-5 w-48 bg-gray-200" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 bg-gray-100 mb-2" />
                  <Skeleton className="h-5 w-full bg-gray-200" />
                </div>
                <div className="sm:col-span-2">
                  <Skeleton className="h-4 w-32 bg-gray-100 mb-2" />
                  <Skeleton className="h-8 w-32 rounded-md bg-gray-200" />
                </div>
                <div className="sm:col-span-2">
                  <Skeleton className="h-4 w-32 bg-gray-100 mb-2" />
                  <Skeleton className="h-20 w-full rounded-lg bg-gray-50 border border-gray-100" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-gray-100 bg-gray-50/50">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-48 bg-gray-200" />
              <Skeleton className="h-4 w-3/4 bg-gray-100" />
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Skeleton className="h-10 w-full sm:flex-1 rounded-md bg-gray-200" />
                <Skeleton className="h-10 w-full sm:flex-1 rounded-md bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
