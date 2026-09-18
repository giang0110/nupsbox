export function toggleComparedUnit(selected: string[], unitId: string, max = 3): string[] {
  if (selected.includes(unitId)) {
    return selected.filter((id) => id !== unitId);
  }

  if (selected.length >= max) return selected;
  return [...selected, unitId];
}
