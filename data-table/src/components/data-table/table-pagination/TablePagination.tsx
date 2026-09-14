import styles from "./TablePagination.module.css";

interface TablePaginationProps {
  count: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS: { value: number; label: string }[] = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
];

const TablePagination = ({
  count,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) => {
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
    <div className={styles.paginationWrapper}>
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
};

export default TablePagination;
