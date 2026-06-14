function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === "";
}

function notIsEmpty(value: string | null | undefined): boolean {
  return !isEmpty(value);
}

function isEmptyCell(value: string | null | undefined): boolean {
  if (value === null || value === undefined) return true;
  const trimmed = value.trim();
  return (
    trimmed === "" || trimmed === "-" || trimmed === "—" || trimmed === "–" || trimmed === "â€”"
  );
}

export { isEmpty, notIsEmpty, isEmptyCell };
