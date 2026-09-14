import { useState } from "react";

export type HasId = {
  id: number;
};

export interface DataTableColumn<T> {
  label: string;
  key: keyof T & string;
}

export interface DataTableProps<T extends HasId> {
  title: string;
  columns: DataTableColumn<T>[];
  data: T[];
}

const PAGE_SIZE_OPTIONS: { value: number; label: string }[] = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
];

function getPaginatedData<T>(data: T[], currentPage: number, pageSize: number) {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return data.slice(start, end);
}

interface TablePaginationProps {
  count: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

function TablePagination({
  count,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const totalPageCount = Math.ceil(count / pageSize);

  const showPreviousPage = () => {
    const prevPage = page - 1;

    if (prevPage === 0) {
      return;
    }

    onPageChange(page - 1);
  };

  const showNextPage = () => {
    const nextPage = page + 1;

    if (nextPage > totalPageCount) {
      return;
    }

    onPageChange(page + 1);
  };

  return (
    <div className="paginationWrapper">
      <select
        aria-label="Page size"
        value={pageSize}
        onChange={(event) => onPageSizeChange(+event.target.value)}
      >
        {PAGE_SIZE_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            Show {label}
          </option>
        ))}
      </select>

      <button disabled={page === 1} onClick={showPreviousPage}>
        Prev
      </button>
      <p aria-label="Page number">
        Page {page} of {totalPageCount}
      </p>
      <button disabled={page === totalPageCount} onClick={showNextPage}>
        Next
      </button>
    </div>
  );
}

export default function DataTable<T extends HasId>({
  title,
  columns,
  data,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const paginatedData = getPaginatedData(data, currentPage, pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setCurrentPage(1);
    setPageSize(newPageSize);
  };

  return (
    <div>
      <h1>{title}</h1>
      <table className="table">
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
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
