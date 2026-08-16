import { eq } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import type { PgQueryResultHKT } from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";
import * as schema from "./schema";
import type { AttributeMap } from "@ascent/types";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export interface GoalInput {
  userId: string;
  title: string;
  priority?: number;
}

export interface AreaInput {
  goalId: string;
  title: string;
}

export interface ProjectInput {
  areaId: string;
  title: string;
}

export interface QuestInput {
  projectId: string;
  title: string;
  narrative?: string;
  estimateMinutes: number;
  xpReward: number;
  importance?: number;
  cognitiveLoad?: "light" | "standard" | "heavy";
  tier?: "MUST" | "SHOULD" | "OPTIONAL";
  dueDate?: Date;
}

export interface StepInput {
  questId: string;
  title: string;
  order: number;
  xpReward: number;
}

export function createRepositories(db: Db) {
  return {
    createUser(user: { id: string; email: string; passwordHash: string; dailyBudgetMinutes: number }) {
      return db.insert(schema.users).values(user).returning();
    },

    getUserByEmail(email: string) {
      return db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    },

    getUserById(id: string) {
      return db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    },

    createRefreshToken(token: { id: string; userId: string; tokenHash: string; expiresAt: Date }) {
      return db.insert(schema.refreshTokens).values(token).returning();
    },

    createProfile(profile: {
      userId: string;
      totalXp: number;
      streak: number;
      lastStreakDate: string | null;
      attributes: string;
    }) {
      return db.insert(schema.profiles).values(profile).returning();
    },

    getProfile(userId: string) {
      return db.select().from(schema.profiles).where(eq(schema.profiles.userId, userId)).limit(1);
    },

    getRefreshTokenByHash(tokenHash: string) {
      return db
        .select()
        .from(schema.refreshTokens)
        .where(eq(schema.refreshTokens.tokenHash, tokenHash))
        .limit(1);
    },

    revokeRefreshToken(id: string) {
      return db
        .update(schema.refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(schema.refreshTokens.id, id))
        .returning();
    },

    createGoal(input: GoalInput) {
      return db
        .insert(schema.goals)
        .values({ id: randomUUID(), userId: input.userId, title: input.title, priority: input.priority ?? 1 })
        .returning();
    },

    listGoals(userId: string) {
      return db.select().from(schema.goals).where(eq(schema.goals.userId, userId));
    },

    createArea(input: AreaInput) {
      return db
        .insert(schema.areas)
        .values({ id: randomUUID(), goalId: input.goalId, title: input.title })
        .returning();
    },

    listAreas(goalId: string) {
      return db.select().from(schema.areas).where(eq(schema.areas.goalId, goalId));
    },

    createProject(input: ProjectInput) {
      return db
        .insert(schema.projects)
        .values({ id: randomUUID(), areaId: input.areaId, title: input.title })
        .returning();
    },

    listProjects(areaId: string) {
      return db.select().from(schema.projects).where(eq(schema.projects.areaId, areaId));
    },

    createQuest(input: QuestInput) {
      return db
        .insert(schema.quests)
        .values({
          id: randomUUID(),
          projectId: input.projectId,
          title: input.title,
          narrative: input.narrative,
          estimateMinutes: input.estimateMinutes,
          xpReward: input.xpReward,
          importance: input.importance ?? 5,
          cognitiveLoad: input.cognitiveLoad ?? "standard",
          tier: input.tier,
          dueDate: input.dueDate,
        })
        .returning();
    },

    getQuestById(id: string) {
      return db.select().from(schema.quests).where(eq(schema.quests.id, id)).limit(1);
    },

    listQuests(projectId: string) {
      return db.select().from(schema.quests).where(eq(schema.quests.projectId, projectId));
    },

    completeQuest(id: string) {
      return db
        .update(schema.quests)
        .set({ completedAt: new Date() })
        .where(eq(schema.quests.id, id))
        .returning();
    },

    createStep(input: StepInput) {
      return db
        .insert(schema.steps)
        .values({
          id: randomUUID(),
          questId: input.questId,
          title: input.title,
          order: input.order,
          xpReward: input.xpReward,
        })
        .returning();
    },

    listSteps(questId: string) {
      return db
        .select()
        .from(schema.steps)
        .where(eq(schema.steps.questId, questId))
        .orderBy(schema.steps.order);
    },

    completeStep(id: string) {
      return db
        .update(schema.steps)
        .set({ completedAt: new Date() })
        .where(eq(schema.steps.id, id))
        .returning();
    },

    createFocusSession(input: { id: string; userId: string; questId: string }) {
      return db.insert(schema.focusSessions).values(input).returning();
    },

    endFocusSession(id: string, focusedMinutes: number, xpEarned: number) {
      return db
        .update(schema.focusSessions)
        .set({ status: "ended", endedAt: new Date(), focusedMinutes, xpEarned })
        .where(eq(schema.focusSessions.id, id))
        .returning();
    },

    getActiveFocusSession(userId: string) {
      return db
        .select()
        .from(schema.focusSessions)
        .where(
          eq(schema.focusSessions.userId, userId),
        )
        .limit(1);
    },

    createInboxItem(input: { userId: string; kind: "task" | "idea" | "note"; content: string }) {
      return db.insert(schema.inboxItems).values({ id: randomUUID(), ...input }).returning();
    },

    listInboxItems(userId: string) {
      return db.select().from(schema.inboxItems).where(eq(schema.inboxItems.userId, userId));
    },

    createDailyPlanEntry(input: {
      userId: string;
      date: string;
      questId: string;
      tier: "MUST" | "SHOULD" | "OPTIONAL";
      planOrder: number;
      impactScore: number;
    }) {
      return db.insert(schema.dailyPlanEntries).values({ id: randomUUID(), ...input }).returning();
    },

    createAttributeHistory(input: { userId: string; attribute: string; value: number; reason: string }) {
      return db.insert(schema.attributeHistory).values({ id: randomUUID(), ...input }).returning();
    },
  };
}

export function emptyAttributes(): AttributeMap {
  return { STR: 0, INT: 0, VIT: 0, FOC: 0, DIS: 0, CON: 0 };
}
