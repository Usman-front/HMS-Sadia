export default function Table({ columns = [], data = [], rowKey = 'id', actions }) {
  return (
    <div className="table">
      <table className="w-full">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.accessor} className="">
                {col.header}
              </th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row[rowKey]} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.accessor}>
                  {col.cell ? col.cell(row[col.accessor], row) : row[col.accessor]}
                </td>
              ))}
              {actions && (
                <td className="space-x-2">
                  {actions.map((action, idx) => (
                    <button
                      key={idx}
                      className={`btn ${action.className || 'btn-secondary'} px-2 py-1`}
                      onClick={() => action.onClick(row)}
                    >
                      {action.label}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}