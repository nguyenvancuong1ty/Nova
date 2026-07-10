export function buildStructuredArrayContract(options: {
  itemName: string;
  fields: string[];
  cardinality: string;
  constraints?: string[];
}): string {
  const constraints = options.constraints?.length
    ? ` Constraints: ${options.constraints.join(" ")}`
    : "";

  return [
    `Return only a valid top-level JSON array of ${options.itemName} objects.`,
    "Never wrap the array in an object such as {\"items\": [...] }.",
    "Do not use markdown fences, explanatory prose, or comments.",
    `Return ${options.cardinality}.`,
    `Every item must include: ${options.fields.join(", ")}.`,
    constraints,
  ].join(" ");
}

export function buildMarkdownContract(options: {
  title: string;
  requiredSections: string[];
  sceneBased?: boolean;
}): string {
  const sceneRule = options.sceneBased
    ? "Use a level-2 heading for every input scene in numeric scene order."
    : "Use level-2 headings for the required sections in the stated order.";

  return [
    "Return Vietnamese Markdown only. Do not return JSON, markdown fences, or explanatory preambles.",
    `Start with one level-1 heading: ${options.title}.`,
    sceneRule,
    `Required level-2 headings: ${options.requiredSections.join(", ")}.`,
  ].join(" ");
}
