export function render(
  template: string,
  variables: Record<string, string | number>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    String(variables[key] ?? ""),
  );
}
