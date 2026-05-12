import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  className?: string;
  iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, description, className, iconColor = "text-gray-900" }: StatCardProps) {
  return (
    <div className={cn("overflow-hidden bg-white border border-gray-200 rounded-3xl transition-all duration-300 hover:border-gray-300 flex flex-col p-6", className)}>
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-gray-700">{title}</h3>
        {Icon && (
          <div className="text-gray-400">
            <Icon className="w-5 h-5 opacity-50" />
          </div>
        )}
      </div>
      <div>
        <div className="text-[2.5rem] leading-none font-bold tracking-tighter text-black">{value}</div>
        {description && (
          <p className="text-sm font-medium text-gray-400 mt-3">{description}</p>
        )}
      </div>
    </div>
  );
}
