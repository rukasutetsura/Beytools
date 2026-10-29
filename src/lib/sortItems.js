export function applySort(items, sortKey, direction) {
  if (!sortKey) return items;
  const dir = direction === 'asc' ? 1 : -1;
  const get = (item) => {
    if (sortKey === 'recent') return item.created_date || '';
    if (sortKey === 'name') return (item.name || item.combo || '').toLowerCase();
    return item[sortKey] ?? 0;
  };
  return [...items].sort((a, b) => {
    const av = get(a);
    const bv = get(b);
    if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv) * dir;
    return ((Number(av) || 0) - (Number(bv) || 0)) * dir;
  });
}