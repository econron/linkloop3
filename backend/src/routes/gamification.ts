import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const gamificationRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // XP履歴取得
  fastify.get('/xp-history', async (request, reply) => {
    const userId = (request.query as any).userId;
    if (!userId) {
      return reply.status(400).send({ error: 'userId is required' });
    }
    const data = await prisma.experienceHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { data };
  });

  // XP履歴追加
  fastify.post('/xp-history', async (request, reply) => {
    const { userId, amount, reason } = request.body as any;
    if (!userId || typeof amount !== 'number' || !reason) {
      return reply.status(400).send({ error: 'userId, amount, reason are required' });
    }
    const data = await prisma.experienceHistory.create({
      data: { userId, amount, reason },
    });
    return { success: true, data };
  });

  // クエスト進捗取得
  fastify.get('/quests', async (request, reply) => {
    const userId = (request.query as any).userId;
    if (!userId) {
      return reply.status(400).send({ error: 'userId is required' });
    }
    const data = await prisma.questProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return { data };
  });

  // クエスト進捗更新
  fastify.post('/quests/progress', async (request, reply) => {
    const { userId, questId, progress } = request.body as any;
    if (!userId || !questId || typeof progress !== 'number') {
      return reply.status(400).send({ error: 'userId, questId, progress are required' });
    }
    // UPSERT: 既存があれば更新、なければ作成
    const data = await prisma.questProgress.upsert({
      where: { userId_questId: { userId, questId } },
      update: { progress, updatedAt: new Date() },
      create: { userId, questId, progress, type: 'daily', target: 1, completed: false, rewardXp: 0 }, // type/target/rewardXpは適宜フロントから渡すか、事前登録
    });
    return { success: true, data };
  });

  // クエスト達成
  fastify.post('/quests/complete', async (request, reply) => {
    const { userId, questId } = request.body as any;
    if (!userId || !questId) {
      return reply.status(400).send({ error: 'userId, questId are required' });
    }
    const data = await prisma.questProgress.update({
      where: { userId_questId: { userId, questId } },
      data: { completed: true, updatedAt: new Date() },
    });
    return { success: true, data };
  });

  // グローバルランキング取得
  fastify.get('/ranking/global', async (request, reply) => {
    const data = await prisma.rankingCache.findMany({
      orderBy: { totalXp: 'desc' },
      take: 100,
    });
    return { data };
  });

  // 週間ランキング取得
  fastify.get('/ranking/weekly', async (request, reply) => {
    const data = await prisma.rankingCache.findMany({
      orderBy: { weeklyXp: 'desc' },
      take: 100,
    });
    return { data };
  });

  // 日間ランキング取得
  fastify.get('/ranking/daily', async (request, reply) => {
    const data = await prisma.rankingCache.findMany({
      orderBy: { dailyXp: 'desc' },
      take: 100,
    });
    return { data };
  });

  // ユーザーのランキング取得
  fastify.get('/ranking/user', async (request, reply) => {
    const userId = (request.query as any).userId;
    if (!userId) {
      return reply.status(400).send({ error: 'userId is required' });
    }
    const data = await prisma.rankingCache.findUnique({ where: { userId } });
    return { data };
  });
};

export default gamificationRoutes; 