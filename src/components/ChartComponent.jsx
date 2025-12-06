import React from 'react'

/**
 * Chart Component - Renders data as a simple bar chart
 *
 * Props:
 * - type: Chart type (bar, line, pie, etc.)
 * - data: Array of {label, value} objects
 * - title: Optional chart title
 */
function ChartComponent({ type = 'bar', data, title }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic">
        No data available for chart
      </div>
    )
  }

  // Find max value for scaling
  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      {title && (
        <div className="text-sm font-semibold text-gray-700 mb-4">{title}</div>
      )}

      {/* Simple bar chart */}
      {type === 'bar' && (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-24 text-sm text-gray-600 truncate">{item.label}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                >
                  <span className="text-xs text-white font-medium">{item.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Other chart types placeholder */}
      {type !== 'bar' && (
        <div className="text-gray-500 text-sm italic">
          Chart type "{type}" rendering not implemented yet
        </div>
      )}
    </div>
  )
}

export default ChartComponent
