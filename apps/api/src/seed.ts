import type { createRepositories } from "./repositories";
import { hashPassword } from "./auth";

type Repos = ReturnType<typeof createRepositories>;

export async function seedDemoAccount(repos: Repos): Promise<void> {
  const existing = await repos.getUserByEmail("demo@ascent.app");
  if (existing.length > 0) {
    return;
  }

  const [user] = await repos.createUser({
    id: crypto.randomUUID(),
    email: "demo@ascent.app",
    passwordHash: await hashPassword("demo1234"),
    dailyBudgetMinutes: 300,
  });

  await repos.createProfile({
    userId: user!.id,
    totalXp: 268_420,
    streak: 0,
    lastStreakDate: null,
    attributes: JSON.stringify({ STR: 72, INT: 84, VIT: 68, FOC: 76, DIS: 61, CON: 73 }),
  });
}
