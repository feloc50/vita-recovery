import { ReactNode } from 'react';

interface Column {
  key: string;
  header: string;
  render?: (value: any, item?: any) => ReactNode;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  keyField: string;
  mobileCardRenderer?: (item: any) => ReactNode;
}

export function ResponsiveTable({ columns, data, keyField, mobileCardRenderer }: ResponsiveTableProps) {
  return (
    <>
      {/* Desktop view */}
      <div className="hidden md:block shadow overflow-hidden border border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item[keyField]}>
                {columns.map((column) => (
                  <td key={`${item[keyField]}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(item[column.key], item) : (
                      <div className="text-sm text-gray-900">{item[column.key]}</div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <div
            key={item[keyField]}
            className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden"
          >
            {mobileCardRenderer ? (
              mobileCardRenderer(item)
            ) : (
              <div className="p-4 space-y-2">
                {columns.map((column) => (
                  <div key={`${item[keyField]}-${column.key}`} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">{column.header}</span>
                    <span className="text-sm text-gray-900">
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}