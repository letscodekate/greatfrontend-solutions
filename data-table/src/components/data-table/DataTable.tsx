import { useState } from "react";

import type { DataTableProps, HasId } from "./DataTable.types";
import styles from "./DataTable.module.css";
import TablePagination from "./table-pagination/TablePagination";

function getPaginatedData<T>(data: T[], currentPage: number, pageSize: number) {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return data.slice(start, end);
}

const DataTable = <T extends HasId>({
  title,
  columns,
  data,
}: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const paginatedData = getPaginatedData(data, currentPage, pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newPageSize: number) => {
    setCurrentPage(1);
    setPageSize(newPageSize);
  };

  return (
    <div>
      <h1>{title}</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(({ label, key }) => (
              <th key={key}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>No data found</td>
            </tr>
          ) : (
            paginatedData.map((item) => (
              <tr key={item.id}>
                {columns.map(({ key }) => (
                  <td key={key}>{String(item[key])}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {data.length > 0 && (
        <TablePagination
          count={data.length}
          page={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handleRowsPerPageChange}
        />
      )}
    </div>
  );
};

export default DataTable;
