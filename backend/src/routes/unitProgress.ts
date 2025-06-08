import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const unitProgressRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // 進捗保存（UPSERT）
  fastify.post("/unit-progress", async (request, reply) => {
    const { userId, unitId, status, lastAttempted, completedAt } = request.body as {
      userId: string;
      unitId: string;
      status: string;
      lastAttempted?: string;
      completedAt?: string | null;
    };
    if (!userId || !unitId || !status) {
      return reply.status(400).send({ error: "userId, unitId, status are required" });
    }
    try {
      const upserted = await prisma.unitProgress.upsert({
        where: { userId_unitId: { userId, unitId } },
        update: {
          status,
          lastAttempted: lastAttempted ? new Date(lastAttempted) : new Date(),
          completedAt: completedAt ? new Date(completedAt) : null,
        },
        create: {
          userId,
          unitId,
          status,
          lastAttempted: lastAttempted ? new Date(lastAttempted) : new Date(),
          completedAt: completedAt ? new Date(completedAt) : null,
        },
      });
      return reply.send({ success: true, data: upserted });
    } catch (e) {
      console.error("UnitProgress upsert error:", e);
      return reply.status(500).send({ error: "Failed to save unit progress" });
    }
  });

  // 進捗取得
  fastify.get("/unit-progress", async (request, reply) => {
    const userId = (request.query as any).userId;
    if (!userId) {
      return reply.status(400).send({ error: "userId is required" });
    }
    try {
      const progresses = await prisma.unitProgress.findMany({
        where: { userId },
        orderBy: { unitId: "asc" },
      });
      return reply.send({ data: progresses });
    } catch (e) {
      console.error("UnitProgress find error:", e);
      return reply.status(500).send({ error: "Failed to get unit progress" });
    }
  });
};

export default unitProgressRoutes; 