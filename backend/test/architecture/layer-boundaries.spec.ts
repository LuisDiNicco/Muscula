import { readdirSync, statSync } from 'fs';
import { join } from 'path';

describe('Architecture Tests - Layer Boundaries', () => {
  const srcPath = join(__dirname, '../../src');

  function getFilesRecursively(dir: string): string[] {
    const files: string[] = [];
    const items = readdirSync(dir);

    items.forEach((item) => {
      const fullPath = join(dir, item);
      if (statSync(fullPath).isDirectory()) {
        files.push(...getFilesRecursively(fullPath));
      } else if (item.endsWith('.ts')) {
        files.push(fullPath);
      }
    });

    return files;
  }

  function getImports(filePath: string): string[] {
    const fs = require('fs');
    const content = fs.readFileSync(filePath, 'utf-8');
    const importRegex = /import\s+.*?from\s+['"](.+?)['"]/g;
    const imports: string[] = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  it('domain layer should NOT import from application layer', () => {
    const domainPath = join(srcPath, 'domain');
    if (!require('fs').existsSync(domainPath)) {
      return; // Skip if domain folder doesn't exist yet
    }

    const domainFiles = getFilesRecursively(domainPath);

    domainFiles.forEach((file) => {
      const imports = getImports(file);
      const invalidImports = imports.filter((imp) =>
        imp.includes('application'),
      );

      expect(invalidImports).toEqual([]);
    });
  });

  it('domain layer should NOT import from infrastructure layer', () => {
    const domainPath = join(srcPath, 'domain');
    if (!require('fs').existsSync(domainPath)) {
      return;
    }

    const domainFiles = getFilesRecursively(domainPath);

    domainFiles.forEach((file) => {
      const imports = getImports(file);
      const invalidImports = imports.filter((imp) =>
        imp.includes('infrastructure'),
      );

      expect(invalidImports).toEqual([]);
    });
  });

  it('application layer should NOT import from infrastructure layer', () => {
    const applicationPath = join(srcPath, 'application');
    if (!require('fs').existsSync(applicationPath)) {
      return;
    }

    const applicationFiles = getFilesRecursively(applicationPath);

    applicationFiles.forEach((file) => {
      const imports = getImports(file);
      const invalidImports = imports.filter((imp) =>
        imp.includes('infrastructure'),
      );

      expect(invalidImports).toEqual([]);
    });
  });

  it('primary-adapters should NOT import from secondary-adapters', () => {
    const primaryPath = join(srcPath, 'infrastructure/primary-adapters');
    if (!require('fs').existsSync(primaryPath)) {
      return;
    }

    const primaryFiles = getFilesRecursively(primaryPath);

    primaryFiles.forEach((file) => {
      const imports = getImports(file);
      const invalidImports = imports.filter((imp) =>
        imp.includes('secondary-adapters'),
      );

      expect(invalidImports).toEqual([]);
    });
  });
});
