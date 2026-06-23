export function paginationMeta(total, { page, pageSize }) {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
