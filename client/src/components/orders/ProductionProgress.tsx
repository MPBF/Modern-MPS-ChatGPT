import { Progress } from "../ui/progress";

interface ProductionProgressProps {
  filmPercentage: number;
  printingPercentage: number;
  cuttingPercentage: number;
}

export default function ProductionProgress({
  filmPercentage,
  printingPercentage,
  cuttingPercentage,
}: ProductionProgressProps) {
  return (
    <div className="flex flex-col space-y-2 w-full min-w-[120px]">
      {/* مؤشر الفيلم - أسود */}
      <div className="flex items-center space-x-2" data-testid="progress-film">
        <div className="w-3 h-3 bg-black rounded-full flex-shrink-0" />
        <Progress 
          value={filmPercentage} 
          className="h-2 flex-1"
          style={{
            "--progress-background": "#000000",
          } as React.CSSProperties}
        />
        <span className="text-xs text-gray-600 w-10 text-right">
          {Math.round(filmPercentage)}%
        </span>
      </div>
      
      {/* مؤشر الطباعة - أحمر */}
      <div className="flex items-center space-x-2" data-testid="progress-printing">
        <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0" />
        <Progress 
          value={printingPercentage} 
          className="h-2 flex-1"
          style={{
            "--progress-background": "#ef4444",
          } as React.CSSProperties}
        />
        <span className="text-xs text-gray-600 w-10 text-right">
          {Math.round(printingPercentage)}%
        </span>
      </div>
      
      {/* مؤشر التقطيع - أصفر */}
      <div className="flex items-center space-x-2" data-testid="progress-cutting">
        <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0" />
        <Progress 
          value={cuttingPercentage} 
          className="h-2 flex-1"
          style={{
            "--progress-background": "#eab308",
          } as React.CSSProperties}
        />
        <span className="text-xs text-gray-600 w-10 text-right">
          {Math.round(cuttingPercentage)}%
        </span>
      </div>
    </div>
  );
}