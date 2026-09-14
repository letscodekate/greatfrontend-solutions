export type HasId = {
  id: number;
};

export interface DataTableProps<T extends HasId> {
  title: string;
  columns: DataTableColumn<T>[];
  data: T[];
}

export interface DataTableColumn<T> {
  label: string;
  key: keyof T & string;
}
