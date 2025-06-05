
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface ValuePropositionProps {
  onBack: () => void;
  onContinue: () => void;
}

const ValueProposition = ({ onBack, onContinue }: ValuePropositionProps) => {
  const chartData = [
    { month: "Month 1", calAi: 100, traditional: 100 },
    { month: "Month 2", calAi: 85, traditional: 80 },
    { month: "Month 3", calAi: 75, traditional: 75 },
    { month: "Month 4", calAi: 70, traditional: 85 },
    { month: "Month 5", calAi: 68, traditional: 95 },
    { month: "Month 6", calAi: 67, traditional: 98 },
  ];

  const chartConfig = {
    calAi: {
      label: "Cal AI",
      color: "#000000",
    },
    traditional: {
      label: "Traditional diet",
      color: "#ef4444",
    },
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 sm:px-6 py-6 sm:py-8 font-rubik">
      <div className="w-full max-w-xs sm:max-w-sm mx-auto flex flex-col flex-1">

        {/* Back Button */}
        <div className="mb-6 sm:mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-black text-center mb-8 sm:mb-12 font-manrope leading-tight px-2">
          Cal AI creates long-term results
        </h1>

        {/* Chart */}
        <div className="mb-6 sm:mb-8 flex-1 flex flex-col justify-center">
          <div className="h-48 sm:h-64 mb-4 sm:mb-6">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#666" }}
                    tickFormatter={(value) => value.replace("Month ", "")}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#666" }}
                    domain={[60, 105]}
                    label={{ value: 'Your weight', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '12px', fill: '#666' } }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="calAi"
                    stroke="#000000"
                    strokeWidth={2}
                    dot={{ fill: "#000000", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: "#000000" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="traditional"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: "#ef4444" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-black rounded-full"></div>
              <span className="text-xs sm:text-sm text-gray-700 font-rubik">Cal AI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs sm:text-sm text-gray-700 font-rubik">Traditional diet</span>
            </div>
          </div>

          {/* Caption */}
          <p className="text-center text-gray-600 font-rubik mb-8 sm:mb-12 leading-relaxed text-sm sm:text-base px-2">
            80% of Cal AI users maintain their weight loss even 6 months later
          </p>
        </div>

        {/* Continue Button */}
        <Button
          onClick={onContinue}
          className="w-full h-12 sm:h-14 bg-black hover:bg-gray-800 text-white rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold transition-all duration-200 transform active:scale-95 font-rubik shadow-lg hover:shadow-xl"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ValueProposition;
