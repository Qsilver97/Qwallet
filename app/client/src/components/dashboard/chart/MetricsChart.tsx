import React from "react";
import { LineChart } from "@mui/x-charts";
import { Text } from "../../commons";

const MetricsChart: React.FC = () => {
    const yAxisData = [0.0, 200.0, 400.0, 600.0, 800.0, 1000.0];
    const xAxisData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    return (
        <div className="relative">
            <Text size="xs" className="absolute top-3 left-4">
                Price
            </Text>
            <LineChart
                xAxis={[{ data: xAxisData, hideTooltip: false }]}
                yAxis={[{ data: yAxisData }]}
                series={[
                    {
                        data: [100, 200, 150, 450, 420, 820, 230],
                        color: "#165DFF",
                    },
                ]}
                grid={{ horizontal: true }}
                height={300}
                sx={{
                    [`.css-1k2u9zb-MuiChartsAxis-root .MuiChartsAxis-tickLabel`]:
                        {
                            fill: "#86909C",
                        },
                    [`.MuiChartsAxis-directionY .MuiChartsAxis-line`]: {
                        stroke: "transparent",
                    },
                    [`.MuiChartsAxis-directionX .MuiChartsAxis-line`]: {
                        stroke: "#C9CDD4",
                    },
                    [`.MuiChartsAxis-tick`]: {
                        stroke: "transparent",
                    },
                    [`.css-j0a4z8-MuiChartsGrid-root .MuiChartsGrid-line`]: {
                        stroke: "#E5E6EB",
                        strokeDasharray: "3 3",
                    },
                    [`.css-19qk48p-MuiMarkElement-root`]: {
                        display: "none",
                    },
                }}
            />
        </div>
    );
};

export default MetricsChart;
