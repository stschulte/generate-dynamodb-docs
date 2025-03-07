export type Entries<T> = T extends { [s: string]: infer U } ? [string, U] : never;

// https://docs.github.com/en/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions
export type Metadata = {
  defaults?: {
    optional?: boolean;
    typescriptType?: string;
  };
  description?: string;
  entities: {
    [name: string]: {
      attributes: {
        [attributeName: string]: {
          description: string;
          optional?: boolean;
          typescriptType?: string;
        };
      };
      description: string;
      typescriptName: string;
    };
  };
};

/**
 * Sort key, value attributes from a yml file
 *
 * When generating documentation, a deterministic order of items
 * is preferred. This sorts the result of Object.entries by property name.
 *
 * @param a - A single item of Object.entries(some_object)
 * @param b - A single item of Object.entries(some_object)
 *
 * @returns 1, -1, 0 depending of which should come first
 */
export function sortEntries<T extends [string, unknown]>(a: T, b: T): number {
  return a[0].localeCompare(b[0]);
}
