function ReportComponent({ title, subtitle, sections, footer }) {
  if (!sections || sections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <p className="text-gray-500 text-center">No report data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white p-8">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {subtitle && <p className="text-blue-100">{subtitle}</p>}
        <div className="mt-4 text-sm text-blue-100">
          Generated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Report Body */}
      <div className="p-8 space-y-8">
        {sections.map((section, index) => (
          <div key={index} className="border-b border-gray-200 pb-8 last:border-0">
            {section.title && (
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                {section.title}
              </h2>
            )}

            {section.description && (
              <p className="text-gray-600 mb-4">{section.description}</p>
            )}

            {section.type === 'text' && section.content && (
              <div className="prose prose-sm max-w-none">
                {section.content}
              </div>
            )}

            {section.type === 'metrics' && section.metrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {section.metrics.map((metric, mIndex) => (
                  <div key={mIndex} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">
                      {metric.label}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {metric.value}
                    </div>
                    {metric.change && (
                      <div
                        className={`text-sm mt-1 ${
                          metric.change.startsWith('+')
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {metric.change}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === 'table' && section.data && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {section.columns?.map((col, cIndex) => (
                        <th
                          key={cIndex}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {section.data.map((row, rIndex) => (
                      <tr key={rIndex}>
                        {section.columns?.map((col, cIndex) => (
                          <td
                            key={cIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {section.type === 'list' && section.items && (
              <ul className="space-y-2">
                {section.items.map((item, iIndex) => (
                  <li key={iIndex} className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Report Footer */}
      {footer && (
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">{footer}</p>
        </div>
      )}
    </div>
  )
}

export default ReportComponent
