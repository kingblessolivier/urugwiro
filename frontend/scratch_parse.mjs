import fs from 'fs';

const code = fs.readFileSync('src/features/discovery/ListingDetail.tsx', 'utf8');

// Let's test parsing with oxc if available, or babel/esbuild/typescript
import { transformSync } from 'esbuild';

try {
  const result = transformSync(code, {
    loader: 'tsx',
    jsx: 'transform',
  });
  console.log('esbuild parsed successfully!');
} catch (e) {
  console.error('esbuild parse error:', e);
}
