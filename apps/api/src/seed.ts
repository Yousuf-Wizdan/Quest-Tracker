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

  await seedDemoHierarchy(repos, user!.id);
}

export async function seedDemoHierarchy(repos: Repos, userId: string): Promise<void> {
  const [goal] = await repos.createGoal({
    userId,
    title: "Software Engineering Internship",
    priority: 5,
  });

  const [dsaArea] = await repos.createArea({ goalId: goal!.id, title: "DSA" });
  const [projectsArea] = await repos.createArea({ goalId: goal!.id, title: "Projects" });

  const [dsaProject] = await repos.createProject({ areaId: dsaArea!.id, title: "Graph Problems" });
  const [authProject] = await repos.createProject({ areaId: projectsArea!.id, title: "Auth System" });

  const [graphQuest] = await repos.createQuest({
    projectId: dsaProject!.id,
    title: "Graph algorithms",
    narrative: "Three problems on graph traversal, topo sort and shortest path.",
    estimateMinutes: 60,
    xpReward: 90,
    importance: 9,
    cognitiveLoad: "heavy",
    tier: "SHOULD",
  });

  await repos.createStep({ questId: graphQuest!.id, title: "Adjacency list & BFS", order: 0, xpReward: 20 });
  await repos.createStep({ questId: graphQuest!.id, title: "Topological sort", order: 1, xpReward: 35 });
  await repos.createStep({ questId: graphQuest!.id, title: "Shortest path", order: 2, xpReward: 35 });

  await repos.createQuest({
    projectId: authProject!.id,
    title: "Build authentication system",
    narrative: "Email/password signup with JWT access and refresh tokens.",
    estimateMinutes: 90,
    xpReward: 180,
    importance: 10,
    cognitiveLoad: "heavy",
    tier: "MUST",
  });

  await repos.createQuest({
    projectId: authProject!.id,
    title: "Auth UI polish",
    narrative: "Polish the login and signup screens to match the design system.",
    estimateMinutes: 45,
    xpReward: 35,
    importance: 7,
    cognitiveLoad: "standard",
    tier: "SHOULD",
  });
}
