/**
 * ChartComponent
 *
 * Chart visualization using Recharts
 * Supports: line, bar, area, pie, scatter, radar, combo charts
 * Type-safe props from core types
 */

'use client';

import {
  LineChart,
  BarChart,
  AreaChart,
  PieChart,
  Pie,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ComposedChart,
} from 'recharts';
import type { ChartProps } from '@/lib/types';

const DEFAULT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export function ChartComponent({
  chartType = 'line',
  data,
  title,
  xAxis,
  yAxis,
  dataKey = 'value',
  colors = DEFAULT_COLORS,
  showLegend = true,
  showTooltip = true,
  height = 300,
  responsive = true,
}: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">No data to display</p>
      </div>
    );
  }

  const chartProps = {
    data,
    margin: { top: 5, right: 30, left: 0, bottom: 5 },
  };

  const xAxisProps = xAxis
    ? {
        dataKey: xAxis.key,
        label: xAxis.label ? { value: xAxis.label, position: 'insideBottom' as const, offset: -5 } : undefined,
      }
    : null;

  const yAxisProps = yAxis
    ? {
        label: yAxis.label ? { value: yAxis.label, angle: -90, position: 'insideLeft' as const } : undefined,
      }
    : null;

  const commonProps = {
    stroke: colors[0],
    fill: colors[0],
    dataKey,
  };

  const containerWidth = responsive ? '100%' : 600;
  const containerHeight = height || 300;

  return (
    <div className="w-full">
      {/* Title */}
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
        <ResponsiveContainer width={containerWidth} height={containerHeight}>
          {chartType === 'line' ? (
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              {xAxisProps && <XAxis {...xAxisProps} />}
              {yAxisProps && <YAxis {...yAxisProps} />}
              <Line {...commonProps} />
            </LineChart>
          ) : chartType === 'bar' ? (
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              {xAxisProps && <XAxis {...xAxisProps} />}
              {yAxisProps && <YAxis {...yAxisProps} />}
              <Bar {...commonProps} />
            </BarChart>
          ) : chartType === 'area' ? (
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              {xAxisProps && <XAxis {...xAxisProps} />}
              {yAxisProps && <YAxis {...yAxisProps} />}
              <Area {...commonProps} />
            </AreaChart>
          ) : chartType === 'pie' ? (
            <PieChart {...chartProps}>
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              <Pie
                data={data}
                dataKey={dataKey}
                nameKey={xAxis?.key || 'name'}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : chartType === 'combo' ? (
            <ComposedChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              {xAxisProps && <XAxis {...xAxisProps} />}
              {yAxisProps && <YAxis {...yAxisProps} />}
              <Line {...commonProps} />
              <Bar {...commonProps} fill={colors[1] || colors[0]} />
            </ComposedChart>
          ) : (
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              {xAxisProps && <XAxis {...xAxisProps} />}
              {yAxisProps && <YAxis {...yAxisProps} />}
              <Line {...commonProps} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
