import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import cors from '@fastify/cors';
import env from '@fastify/env';

const server = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

// 環境変数の設定
const envSchema = {
  type: 'object',
  required: ['PORT', 'DATABASE_URL'],
  properties: {
    PORT: {
      type: 'string',
      default: 3001,
    },
    DATABASE_URL: {
      type: 'string',
    },
  },
};

// プラグインの登録
async function registerPlugins() {
  await server.register(env, {
    schema: envSchema,
    dotenv: true,
  });

  await server.register(cors, {
    origin: true, // 開発環境では全てのオリジンを許可
    credentials: true,
  });
}

// ルートの登録
async function registerRoutes() {
  // TODO: ルートの実装
}

// サーバーの起動
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    await server.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' });
    console.log(`Server is running on port ${process.env.PORT || 3001}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start(); 