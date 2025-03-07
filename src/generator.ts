import type { Metadata } from './metadata.js';

import { sortEntries } from './metadata.js';

export function* generateMarkdown(configuration: Metadata): Generator<string, undefined, unknown> {
  let firstSection = true;
  const defaultOptional = configuration.defaults?.optional ?? false;
  for (const [entityName, entity] of Object.entries(configuration.entities).sort(sortEntries)) {
    if (firstSection) {
      firstSection = false;
    }
    else {
      yield '\n';
    }

    yield `### ${entityName}\n\n`;
    yield entity.description;
    yield '\n\n';
    yield '| Name | Description | Required |\n';
    yield '|------|-------------|:--------:|\n';
    for (const [attributeName, attribute] of Object.entries(entity.attributes).sort(sortEntries)) {
      yield `| ${mdAnchor(entityName, attributeName)} | ${mdString(attribute.description)} | ${mdBoolean(attribute.optional ?? defaultOptional)} |\n`;
    }
  }
}

export function* generateTypescript(configuration: Metadata): Generator<string, undefined, unknown> {
  let firstSection = true;
  const defaultType = configuration.defaults?.typescriptType ?? 'unknown';
  const defaultOptional = configuration.defaults?.optional ?? false;
  for (const [entityName, entity] of Object.entries(configuration.entities).sort(sortEntries)) {
    if (firstSection) {
      firstSection = false;
    }
    else {
      yield '\n';
    }

    yield `// DynamoDB Entity ${entityName}\n`;
    yield `type ${entity.typescriptName} = {\n`;
    for (const [attributeName, attribute] of Object.entries(entity.attributes).sort(sortEntries)) {
      yield `  ${attributeName}${(attribute.optional ?? defaultOptional) ? '?' : ''}: ${attribute.typescriptType ?? defaultType};\n`;
    }
    yield `}\n`;
  }
}

/**
 * Create a string with an anchor pointing to itself
 *
 * When creating documentation it can be helpful to include anchors to
 * be able to share links to specific inputs and outputs
 *
 * This function can be used to turn a text into a link pointing to itself
 *
 * @param prefix - A prefix to prepend to the anchor name, e.g. `input`
 * @param item - The text which should become a link. It is expected to be save markdown.
 *
 * @returns Markdown with an HTML <a> tag to point to itself.
 */
export function mdAnchor(entity: string, attribute: string): string {
  const anchor = `${entity}_${attribute}`.toLowerCase().replace(/-/g, '_');
  return `<a name="${anchor}"></a> [${attribute.replace(/_/g, '\\_')}](#${anchor.replace(/_/g, '\\_')})`;
}

export function mdBoolean(b: boolean | undefined): 'no' | 'yes' {
  return b ? 'yes' : 'no';
}

export function mdCode(s: string | undefined): string {
  if (s) {
    return `\`${s}\``;
  }
  return '';
}

/**
 * Sanitize a single string to be used in markdown tables
 *
 * Multiline strings in a normal markdown table are not possible. Linebreaks
 * can be performed with a void html `<br>` tag.
 *
 * We assume a single linebreak inside an action description is just meant to
 * visually break the line in editors and we can just rely on the browser to
 * perform a line wrap. Two linebreaks are interpreted as a new paragraph that
 * we can preserve with two <br><br> tags.
 *
 * @param s - The string to sanitize
 * @returns The sanitized version of the string
 */
export function mdString(s: string) {
  return s
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, ' ');
}
