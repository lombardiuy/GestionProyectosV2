  export function compareRoles(r1:any, r2:any): boolean {
  return r1 && r2 ? r1.id === r2.id : r1 === r2;
}