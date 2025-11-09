export const parseFieldsFromMarkdown = (mdText) => {
  if (!mdText) return [];


  const regex = /^\|\s*([\w.]+)\s*\|/gm;
  const matches = [...mdText.matchAll(regex)];
  const fields = matches.map((m) => m[1]).filter(Boolean);

  return Array.from(new Set(fields));
};
