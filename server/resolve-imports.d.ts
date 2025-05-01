declare module './resolve-imports.js' {
  export function patchImports(): void;
  export function importShared(modulePath: string): Promise<any>;
} 