import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RefreshButton } from "@/components/shared/RefreshButton";

interface TableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void | Promise<void>;
  children?: React.ReactNode;
}

export function TableToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Cari...",
  onRefresh,
  children,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100 w-full">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder={searchPlaceholder} 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-white w-full"
        />
      </div>
      
      {children}

      <RefreshButton onRefresh={onRefresh} />
    </div>
  );
}
