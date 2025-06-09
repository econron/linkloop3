const API_BASE = 'http://localhost:4000/api';

// XP履歴
export async function getXpHistory(userId: string) {
  const res = await fetch(`${API_BASE}/xp-history?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Failed to fetch XP history');
  return res.json();
}

export async function postXpHistory(userId: string, amount: number, reason: string) {
  const res = await fetch(`${API_BASE}/xp-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount, reason }),
  });
  if (!res.ok) throw new Error('Failed to post XP history');
  return res.json();
}

// クエスト
export async function getQuests(userId: string) {
  const res = await fetch(`${API_BASE}/quests?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Failed to fetch quests');
  return res.json();
}

export async function postQuestProgress(userId: string, questId: string, progress: number) {
  const res = await fetch(`${API_BASE}/quests/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, questId, progress }),
  });
  if (!res.ok) throw new Error('Failed to post quest progress');
  return res.json();
}

export async function postQuestComplete(userId: string, questId: string) {
  const res = await fetch(`${API_BASE}/quests/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, questId }),
  });
  if (!res.ok) throw new Error('Failed to post quest complete');
  return res.json();
}

// ランキング
export async function getRanking(type: 'global' | 'weekly' | 'daily') {
  const res = await fetch(`${API_BASE}/ranking/${type}`);
  if (!res.ok) throw new Error('Failed to fetch ranking');
  return res.json();
}

export async function getUserRanking(userId: string) {
  const res = await fetch(`${API_BASE}/ranking/user?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Failed to fetch user ranking');
  return res.json();
} 