import React from 'react'

/**
 * Table Component - Renders data in tabular format
 *
 * Props:
 * - columns: Array of column names
 * - rows: Array of row objects (key = column name)
 * - caption: Optional table caption
 */
function TableComponent({ columns, rows, caption }) {
  if (!columns || !rows || rows.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic">
        No data available for table
      </div>
    )
  }

  return (
    <div className="mt-4 overflow-x-auto">
      {caption && (
        <div className="text-sm font-semibold text-gray-700 mb-2">{caption}</div>
      )}
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                >
                  {row[column] !== undefined ? String(row[column]) : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableComponent
