export function extractSchemaErrors(details: unknown): string[] | undefined {
  if (
    !details ||
    typeof details !== 'object' ||
    !('schemaRulesNotSatisfied' in details)
  ) {
    return undefined;
  }

  const schemaRules = (details as { schemaRulesNotSatisfied?: unknown[] })
    .schemaRulesNotSatisfied;

  if (!Array.isArray(schemaRules)) {
    return undefined;
  }

  const messages: string[] = [];

  for (const rule of schemaRules) {
    if (
      !rule ||
      typeof rule !== 'object' ||
      !('propertiesNotSatisfied' in rule)
    ) {
      continue;
    }

    const properties = (rule as { propertiesNotSatisfied?: unknown[] })
      .propertiesNotSatisfied;

    if (!Array.isArray(properties)) {
      continue;
    }

    for (const property of properties) {
      if (
        !property ||
        typeof property !== 'object' ||
        !('propertyName' in property)
      ) {
        continue;
      }

      const name = (property as { propertyName: string }).propertyName;
      const propertyDetails = (property as { details?: unknown[] }).details;

      if (Array.isArray(propertyDetails) && propertyDetails.length > 0) {
        for (const detail of propertyDetails) {
          if (detail && typeof detail === 'object') {
            const reason = (detail as { reason?: string }).reason;
            const operator = (detail as { operatorName?: string })
              .operatorName;

            if (reason) {
              messages.push(`${name}: ${reason}`);
            } else if (operator) {
              messages.push(`${name}: failed ${operator}`);
            }
          }
        }
      } else {
        messages.push(`${name}: validation failed`);
      }
    }
  }

  return messages.length ? messages : undefined;
}
