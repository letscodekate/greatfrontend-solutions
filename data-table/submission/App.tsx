import DataTable, { type DataTableColumn } from "./DataTable";
import users, { type User } from "./data/users";

const USER_COLUMNS: DataTableColumn<User>[] = [
  { label: "ID", key: "id" },
  { label: "Name", key: "name" },
  { label: "Age", key: "age" },
  { label: "Occupation", key: "occupation" },
];

export default function App() {
  return (
    <div className="app">
      <DataTable title="Data Table" columns={USER_COLUMNS} data={users} />
    </div>
  );
}
