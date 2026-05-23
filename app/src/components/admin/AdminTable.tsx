/**
 * AdminTable — generic reusable table for admin pages.
 * Handles empty state and loading skeleton automatically.
 */

interface Column<T> {
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
}

export default function AdminTable<T>({
  columns,
  rows,
  keyExtractor,
  loading = false,
  emptyMessage = 'No hay elementos para mostrar.',
}: AdminTableProps<T>) {
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F5F5F5]">
            {columns.map(col => (
              <th
                key={col.header}
                style={col.width ? { width: col.width } : undefined}
                className="text-left text-xs font-semibold text-[#333333] uppercase tracking-wider px-6 py-3"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[#E0E0E0]">
                {columns.map(col => (
                  <td key={col.header} className="px-6 py-4">
                    <div className="h-4 bg-[#F5F5F5] rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-sm text-[#999999]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map(row => (
              <tr
                key={keyExtractor(row)}
                className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA] transition-colors"
              >
                {columns.map(col => (
                  <td key={col.header} className="px-6 py-4">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
