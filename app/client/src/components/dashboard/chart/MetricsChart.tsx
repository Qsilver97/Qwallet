import React, { useEffect, useState } from "react";
import { LineChart } from "@mui/x-charts";
import { Text } from "../../commons";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "axios";
import { SERVER_URL } from "../../../utils/constants";

const showLength = 10;

const MetricsChart: React.FC = () => {
    const { currentToken } = useAuth();
    // const yAxisData = [0.0, 200.0, 400.0, 600.0, 800.0, 1000.0];
    // const xAxisData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    const [yAxisData, setYAxisData] = useState<number[]>([]);
    const [xAxisData, setXAxisData] = useState<string[]>([]);
    const [data, setData] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    function getYAxisValues(arr: number[], count: number): number[] {
        // Find the minimum and maximum values in the array
        const min = Math.min(...arr);
        const max = Math.max(...arr);

        // Calculate the interval between each Y-axis value
        const interval = (max - min) / (count - 1); // 9 intervals create 10 Y-axis values

        // Generate the 10 Y-axis values
        const yAxisValues: number[] = [];
        for (let i = 0; i < count; i++) {
            yAxisValues.push(min + i * interval);
        }

        return yAxisValues;
    }

    useEffect(() => {
        async function init() {
            setLoading(true);
            try {
                const resp = await axios.post(`${SERVER_URL}/api/prices`, { token: currentToken.value });
                const prices = (resp.data.prices as [number, string][]).slice(-showLength);
                const xAxisValues: string[] = prices.map(price => `${price[0]}`)
                setXAxisData(xAxisValues);
                setData(prices.map(price => parseFloat(price[1])));
                const yAxisValues: number[] = getYAxisValues(prices.map(price => parseFloat(price[1]) * 1000000), showLength);
                setYAxisData(yAxisValues);
                console.log(xAxisValues, yAxisValues,)
            } catch (error) {

            } finally {
                setLoading(false)
            }
        }
        init()
    }, [currentToken])

    return (
        <div className="relative">
            <Text size="xs" className="absolute top-3 left-4">
                Price
            </Text>
            {loading ?
                <div className={`flex items-center justify-center min-h-screen`}>
                    <div className="flex flex-col justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        <p className="mt-3 text-lg">Loading...</p>
                    </div>
                </div> :
                <LineChart
                    xAxis={[{ data: xAxisData, hideTooltip: false }]}
                    yAxis={[{ data: yAxisData }]}
                    series={[
                        {
                            data,
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
            }
        </div>
    );
};

export default MetricsChart;
