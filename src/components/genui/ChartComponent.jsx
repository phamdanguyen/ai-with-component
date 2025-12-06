/**
 * ChartComponent v8.0.0 - Chart.js Integration
 *
 * Renders various chart types using Chart.js:
 * - bar: Bar chart for comparisons
 * - line: Line chart for trends
 * - pie: Pie chart for proportions
 * - doughnut: Doughnut chart for proportions
 */

import { useEffect, useRef } from 'react'

// Default color palette
const DEFAULT_COLORS = [
  '#0ea5e9', // sky-500
  '#22c55e', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
]

// Chart.js CDN URL
const CHARTJS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'

function ChartComponent({
  chartType = 'bar',
  data = [],
  title = 'Chart',
  colors = null,
  options = {}
}) {
  const canvasRef = useRef(null)
  const chartInstance = useRef(null)

  // Load Chart.js dynamically
  useEffect(() => {
    const loadChartJs = async () => {
      // Check if Chart.js is already loaded
      if (window.Chart) {
        renderChart()
        return
      }

      // Dynamically load Chart.js
      const script = document.createElement('script')
      script.src = CHARTJS_CDN
      script.async = true
      script.onload = () => {
        renderChart()
      }
      document.head.appendChild(script)
    }

    loadChartJs()

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  // Re-render when data changes
  useEffect(() => {
    if (window.Chart && canvasRef.current) {
      renderChart()
    }
  }, [chartType, data, title, colors])

  const renderChart = () => {
    if (!canvasRef.current || !window.Chart) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = canvasRef.current.getContext('2d')

    // Prepare data
    const labels = data.map(d => d.label || d.name || 'Unknown')
    const values = data.map(d => d.value || d.count || 0)
    const chartColors = colors || DEFAULT_COLORS.slice(0, data.length)

    // Determine background colors based on chart type
    const isPieType = ['pie', 'doughnut'].includes(chartType)

    const chartData = {
      labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: isPieType ? chartColors : chartColors[0],
        borderColor: isPieType ? '#ffffff' : chartColors[0],
        borderWidth: isPieType ? 2 : 1,
        borderRadius: chartType === 'bar' ? 4 : 0,
        hoverOffset: isPieType ? 10 : 0,
      }]
    }

    // Chart options
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: isPieType,
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: title,
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            size: 14
          },
          bodyFont: {
            size: 13
          }
        }
      },
      scales: isPieType ? {} : {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      ...options
    }

    // Create chart
    chartInstance.current = new window.Chart(ctx, {
      type: chartType,
      data: chartData,
      options: chartOptions
    })
  }

  // Empty data state
  if (!data || data.length === 0) {
    return (
      <div className="genui-chart bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="bg-gray-50 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
          <p className="text-gray-500 text-center">No chart data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="genui-chart bg-white rounded-lg shadow-sm p-6">
      <div className="relative" style={{ height: '300px' }}>
        <canvas ref={canvasRef} />
      </div>

      {/* Data summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-4 justify-center">
          {data.slice(0, 6).map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: (colors || DEFAULT_COLORS)[index % DEFAULT_COLORS.length] }}
              />
              <span className="text-sm text-gray-600">
                {item.label || item.name}: <strong>{item.value || item.count}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChartComponent
