import { createServer } from 'vite';

async function test() {
  const server = await createServer({
    configFile: './vite.config.ts',
    server: { port: 5199 }
  });
  try {
    const res = await server.transformRequest('/src/features/discovery/ListingDetail.tsx');
    console.log('Transformed successfully! Result length:', res?.code?.length);
  } catch (err) {
    console.error('Error during transform:', err);
  } finally {
    await server.close();
    process.exit(0);
  }
}
test();
