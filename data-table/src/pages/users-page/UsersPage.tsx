import DataTable from "../../components/data-table/DataTable";
import type { DataTableColumn } from "../../components/data-table/DataTable.types";
import users, { type User } from "./data/users";

const USER_COLUMNS: DataTableColumn<User>[] = [
  { label: "ID", key: "id" },
  { label: "Name", key: "name" },
  { label: "Age", key: "age" },
  { label: "Occupation", key: "occupation" },
];

const UsersPage = () => {
  return (
    <div>
      <DataTable title="Data Table" columns={USER_COLUMNS} data={users} />
    </div>
  );
};

export default UsersPage;
