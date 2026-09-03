declare module "sql.js/dist/sql-asm.js" {
  import type { SqlJsStatic } from "sql.js";

  const initializeSqlJs: () => Promise<SqlJsStatic>;
  export default initializeSqlJs;
}
