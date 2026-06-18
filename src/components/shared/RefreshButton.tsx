'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RefreshButton({ onRefresh }: { onRefresh?: () => void | Promise<void> }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleRefresh}
      className={cn(
        "bg-white shrink-0 transition-all duration-300 border-gray-200 cursor-pointer",
        isRefreshing ? "hover:bg-white" : "hover:bg-gray-50 hover:text-blue-600"
      )}
      title="Segarkan Data"
    >
      <RefreshCw className={cn("w-4 h-4 text-gray-600 transition-colors", isRefreshing && "animate-spin text-blue-600")} />
    </Button>
  );
}
