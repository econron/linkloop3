import fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import pronunciationRoutes from './routes/pronunciation';
import unitProgressRoutes from './routes/unitProgress';

const server = fastify({
  logger: true,
});

// CORSの設定
server.register(cors, {
  origin: true, // 開発環境では全てのオリジンを許可
  credentials: true,
});

// マルチパートの設定
server.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// ルートの登録
server.register(pronunciationRoutes, { prefix: '/api' });
server.register(unitProgressRoutes, { prefix: '/api' });

// サーバーの起動
const start = async () => {
  try {
    await server.listen({ port: 4000, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 