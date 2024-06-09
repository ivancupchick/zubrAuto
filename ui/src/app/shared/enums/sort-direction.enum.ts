export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC',
}

export const SortEventDirection: {
  [key: number]: SortDirection
} = {
  [1]: SortDirection.Asc,
  [-1]: SortDirection.Desc,
}
