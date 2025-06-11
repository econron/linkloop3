import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Userデータの作成
  const user = await prisma.user.create({
    data: {
      id: 'test-user',
      createdAt: new Date(),
      lastLoginAt: new Date(),
    },
  });

  console.log('Created user:', user);

  // Unitデータの作成
  const unit = await prisma.unit.create({
    data: {
      id: 1,
      title: 'RとLの発音',
      description: '英語のRとLの発音の違いを学びましょう。',
      metadata: JSON.stringify({
        videoUrl: '/videos/r_l_pronunciation.mp4',
        pausePoints: [31, 33, 35, 62, 64, 67],
        practiceWords: ['light', 'love', 'hello', 'right', 'read', 'friend'],
        interactivePrompts: [
          'Rの発音を練習しましょう。舌を巻いて「ル」と発音します。',
          'Lの発音を練習しましょう。舌先を上の歯茎につけて「ル」と発音します。',
        ],
      }),
      updatedAt: new Date(),
    },
  });

  console.log('Created unit:', unit);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 