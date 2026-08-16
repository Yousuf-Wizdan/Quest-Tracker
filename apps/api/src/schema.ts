import { sql } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const tierEnum = pgEnum("tier", ["MUST", "SHOULD", "OPTIONAL"]);
export const cognitiveLoadEnum = pgEnum("cognitive_load", ["light", "standard", "heavy"]);
export const energyLevelEnum = pgEnum("energy_level", ["LOW", "NORMAL", "HIGH"]);
export const inboxKindEnum = pgEnum("inbox_kind", ["task", "idea", "note"]);
export const focusStatusEnum = pgEnum("focus_status", ["active", "paused", "completed", "ended"]);

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  dailyBudgetMinutes: integer("daily_budget_minutes").notNull().default(300),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const profiles = pgTable("profiles", {
  userId: varchar("user_id", { length: 36 })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  totalXp: integer("total_xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  lastStreakDate: varchar("last_streak_date", { length: 10 }),
  attributes: text("attributes").notNull().default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const goals = pgTable("goals", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  priority: integer("priority").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const areas = pgTable("areas", {
  id: varchar("id", { length: 36 }).primaryKey(),
  goalId: varchar("goal_id", { length: 36 })
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey(),
  areaId: varchar("area_id", { length: 36 })
    .notNull()
    .references(() => areas.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quests = pgTable("quests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  narrative: text("narrative"),
  estimateMinutes: integer("estimate_minutes").notNull(),
  xpReward: integer("xp_reward").notNull(),
  importance: integer("importance").notNull().default(5),
  cognitiveLoad: cognitiveLoadEnum("cognitive_load").notNull().default("standard"),
  tier: tierEnum("tier"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const steps = pgTable("steps", {
  id: varchar("id", { length: 36 }).primaryKey(),
  questId: varchar("quest_id", { length: 36 })
    .notNull()
    .references(() => quests.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  order: integer("order").notNull(),
  xpReward: integer("xp_reward").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const focusSessions = pgTable(
  "focus_sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    questId: varchar("quest_id", { length: 36 })
      .notNull()
      .references(() => quests.id, { onDelete: "cascade" }),
    status: focusStatusEnum("status").notNull().default("active"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    focusedMinutes: integer("focused_minutes").notNull().default(0),
    xpEarned: integer("xp_earned").notNull().default(0),
  },
  (table) => ({
    userActiveUnique: uniqueIndex("focus_sessions_user_active_unique")
      .on(table.userId)
      .where(sql`${table.status} = 'active'`),
  }),
);

export const inboxItems = pgTable("inbox_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: inboxKindEnum("kind").notNull(),
  content: text("content").notNull(),
  triageSuggestion: text("triage_suggestion"),
  triagedAt: timestamp("triaged_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dailyPlanEntries = pgTable(
  "daily_plan_entries",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: varchar("date", { length: 10 }).notNull(),
    questId: varchar("quest_id", { length: 36 })
      .notNull()
      .references(() => quests.id, { onDelete: "cascade" }),
    tier: tierEnum("tier").notNull(),
    planOrder: integer("plan_order").notNull(),
    impactScore: integer("impact_score").notNull(),
    outcome: varchar("outcome", { length: 16 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userDateQuest: uniqueIndex("daily_plan_user_date_quest_unique").on(
      table.userId,
      table.date,
      table.questId,
    ),
  }),
);

export const attributeHistory = pgTable("attribute_history", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  attribute: varchar("attribute", { length: 3 }).notNull(),
  value: integer("value").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
