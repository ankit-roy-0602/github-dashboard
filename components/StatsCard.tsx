import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  change?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  change,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-github-600">{title}</p>
          <p className="text-2xl font-bold text-github-900">{value}</p>
          {change && (
            <p
              className={`text-sm ${change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
            >
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
