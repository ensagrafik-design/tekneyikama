import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProgressBadgeProps {
  percent: number;
  className?: string;
}

export function ProgressBadge({ percent, className }: ProgressBadgeProps) {
  const getVariant = (percent: number) => {
    if (percent === 0) return "secondary";
    if (percent <= 30) return "destructive";
    if (percent <= 70) return "default";
    if (percent < 100) return "secondary";
    return "default";
  };

  const getLabel = (percent: number) => {
    if (percent === 0) return "Başlanmadı";
    if (percent <= 30) return "Başlangıç";
    if (percent <= 70) return "Orta";
    if (percent < 100) return "Son Rötuş";
    return "Tamamlandı";
  };

  const variant = getVariant(percent);
  const colorClasses = {
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
    default: "bg-yellow-100 text-yellow-800",
  };

  if (percent === 100) {
    return (
      <Badge className={cn("bg-green-100 text-green-800", className)}>
        {getLabel(percent)} (%{percent})
      </Badge>
    );
  }

  return (
    <Badge variant={variant} className={cn(colorClasses[variant], className)}>
      {getLabel(percent)} (%{percent})
    </Badge>
  );
}