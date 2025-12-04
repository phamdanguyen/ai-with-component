/**
 * ReportComponent
 *
 * Multi-section report with export, TOC, and expandable sections
 * Type-safe props from core types
 */

'use client';

import React, { useState } from 'react';
import type { ReportProps } from '@/lib/types';

export function ReportComponent({
  title,
  summary,
  sections,
  footer,
  generatedDate,
  author,
  printable = true,
}: ReportProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections?.map((s) => s.id) || [])
  );

  if (!sections || sections.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">No sections to display</p>
      </div>
    );
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const exportAsJSON = () => {
    const reportData = {
      title,
      summary,
      author,
      generatedDate: generatedDate || new Date().toISOString(),
      sections,
      exportedAt: new Date().toISOString(),
    };

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`);
    element.setAttribute('download', `${title.replace(/\s+/g, '-')}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportAsCSV = () => {
    const headers = ['Section', 'Content', 'Status'];
    const rows: string[][] = [];

    sections.forEach((section) => {
      rows.push([section.title, section.content || '', 'Primary']);

      section.subsections?.forEach((subsection) => {
        rows.push([subsection.title, subsection.content, 'Subsection']);
      });

      section.metrics?.forEach((metric) => {
        rows.push([metric.label, String(metric.value), metric.status || 'neutral']);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute('download', `${title.replace(/\s+/g, '-')}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          {author && <span>👤 {author}</span>}
          <span>📅 {generatedDate || new Date().toLocaleDateString()}</span>
          <span>🕐 {new Date().toLocaleTimeString()}</span>
        </div>

        {summary && (
          <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg">
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}
      </div>

      {/* Table of Contents */}
      {sections.length > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Table of Contents</h2>
          <ul className="space-y-2">
            {sections.map((section, idx) => (
              <li key={section.id} className="text-sm">
                <button
                  onClick={() => {
                    const element = document.getElementById(`section-${section.id}`);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {idx + 1}. {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            id={`section-${section.id}`}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* Section Header */}
            <div
              onClick={() => toggleSection(section.id)}
              className="p-6 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-sm text-gray-600 font-medium">Section {idx + 1}</div>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <span className="text-2xl text-gray-400 transition-transform">
                {expandedSections.has(section.id) ? '−' : '+'}
              </span>
            </div>

            {/* Section Content */}
            {expandedSections.has(section.id) && (
              <div className="p-6 space-y-6">
                {/* Main Content */}
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{section.content}</p>

                {/* Metrics */}
                {section.metrics && section.metrics.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {section.metrics.map((metric, midx) => (
                        <div
                          key={midx}
                          className={`p-4 rounded-lg text-center border ${getStatusColor(metric.status)}`}
                        >
                          <div className="text-xs font-medium opacity-75">{metric.label}</div>
                          <div className="text-2xl font-bold mt-2">
                            {metric.value}
                            {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subsections */}
                {section.subsections && section.subsections.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    {section.subsections.map((subsection, sidx) => (
                      <div key={sidx} className={sidx > 0 ? 'pt-4 border-t border-gray-200' : ''}>
                        <h4 className="font-semibold text-gray-900 mb-2">{subsection.title}</h4>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {subsection.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          {footer}
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-wrap gap-3 justify-center print:hidden">
        <button
          onClick={exportAsJSON}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          ⬇️ JSON
        </button>
        <button
          onClick={exportAsCSV}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
        >
          ⬇️ CSV
        </button>
        {printable && (
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            🖨️ Print
          </button>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white;
          }
          * {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
