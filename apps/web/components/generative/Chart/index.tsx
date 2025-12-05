'use client';

import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    ScatterChart,
    Scatter,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { ChartProps } from '../../../types/generative';

const DEFAULT_COLORS = [
    '#2563eb', // blue-600
    '#16a34a', // green-600
    '#dc2626', // red-600
    '#d97706', // amber-600
    '#9333ea', // purple-600
    '#0891b2', // cyan-600
    '#ea580c', // orange-600
    '#4f46e5', // indigo-600
];

export const Chart: React.FC<ChartProps> = ({
    chartType,
    data,
    xAxis,
    yAxis,
    dataKey,
    title,
    colors = DEFAULT_COLORS,
    showLegend = true,
    showTooltip = true,
    height = 400,
    responsive = true,
}) => {
    // Infer data keys if not provided, assuming non-string/number keys are metrics
    const inferDataKeys = useMemo(() => {
        if (data.length === 0) return [];
        if (dataKey) return [dataKey];

        // Find keys that are number types in the first data item
        const firstItem = data[0];
        const keys = Object.keys(firstItem).filter(key => {
            const val = firstItem[key];
            // Exclude x-axis key if we know it
            if (xAxis?.key && key === xAxis.key) return false;
            return typeof val === 'number';
        });

        return keys.length > 0 ? keys : ['value']; // Fallback
    }, [data, dataKey, xAxis]);

    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 10, right: 30, left: 0, bottom: 0 },
        };

        switch (chartType) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xAxis?.key || 'name'} />
                        <YAxis />
                        {showTooltip && <Tooltip />}
                        {showLegend && <Legend />}
                        {inferDataKeys.map((key, index) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={colors[index % colors.length]}
                                activeDot={{ r: 8 }}
                            />
                        ))}
                    </LineChart>
                );

            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xAxis?.key || 'name'} />
                        <YAxis />
                        {showTooltip && <Tooltip />}
                        {showLegend && <Legend />}
                        {inferDataKeys.map((key, index) => (
                            <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
                        ))}
                    </BarChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xAxis?.key || 'name'} />
                        <YAxis />
                        {showTooltip && <Tooltip />}
                        {showLegend && <Legend />}
                        {inferDataKeys.map((key, index) => (
                            <Area
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stackId="1"
                                stroke={colors[index % colors.length]}
                                fill={colors[index % colors.length]}
                            />
                        ))}
                    </AreaChart>
                );

            case 'pie':
                // For pie chart, we typically use the first dataKey for value and xAxis key for name
                const pieValueKey = inferDataKeys[0];
                const pieNameKey = xAxis?.key || 'name';

                return (
                    <PieChart>
                        {showTooltip && <Tooltip />}
                        {showLegend && <Legend />}
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }: any) => `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={height / 2 - 40}
                            fill="#8884d8"
                            dataKey={pieValueKey}
                            nameKey={pieNameKey}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                );

            case 'radar':
                return (
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey={xAxis?.key || 'subject'} />
                        <PolarRadiusAxis />
                        {showTooltip && <Tooltip />}
                        {showLegend && <Legend />}
                        {inferDataKeys.map((key, index) => (
                            <Radar
                                key={key}
                                name={key}
                                dataKey={key}
                                stroke={colors[index % colors.length]}
                                fill={colors[index % colors.length]}
                                fillOpacity={0.6}
                            />
                        ))}
                    </RadarChart>
                );

            case 'scatter':
                // Scatter requires number X-axis usually, or we assume implicit indexing
                return (
                    <ScatterChart {...commonProps}>
                        <CartesianGrid />
                        <XAxis type="number" dataKey={xAxis?.key} name={xAxis?.label || xAxis?.key} />
                        <YAxis type="number" dataKey={yAxis?.key} name={yAxis?.label || yAxis?.key} />
                        {showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
                        {showLegend && <Legend />}
                        <Scatter name={title || 'Data'} data={data} fill={colors[0]} />
                    </ScatterChart>
                );

            case 'combo':
                return (
                    <ComposedChart {...commonProps}>
                        <CartesianGrid stroke="#f5f5f5" />
                        <XAxis dataKey={xAxis?.key || 'name'} />
                        <YAxis />
                        {showTooltip && <Tooltip />}
                        {showLegend && <Legend />}
                        {/* Simple logic: first key is bar, second is line, etc. */}
                        {inferDataKeys.map((key, index) => {
                            const type = index === 0 ? 'bar' : 'line';
                            if (type === 'bar') {
                                return <Bar key={key} dataKey={key} barSize={20} fill={colors[index % colors.length]} />;
                            } else {
                                return <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} />;
                            }
                        })}
                    </ComposedChart>
                );

            default:
                return <div>Unsupported chart type: {chartType}</div>;
        }
    };

    return (
        <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
            {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
            <div style={{ width: '100%', height }}>
                {responsive ? (
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                ) : (
                    renderChart()
                )}
            </div>
        </div>
    );
};
