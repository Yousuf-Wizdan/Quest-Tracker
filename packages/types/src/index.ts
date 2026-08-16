export type SystemStatus = "online" | "offline";

export interface HealthResponse {
  status: SystemStatus;
  database: "connected" | "unavailable";
  timestamp: string;
}

export type Tier = "MUST" | "SHOULD" | "OPTIONAL";

export type AttributeKey = "STR" | "INT" | "VIT" | "FOC" | "DIS" | "CON";

export type AttributeMap = Record<AttributeKey, number>;

export type CognitiveLoad = "light" | "standard" | "heavy";

export type EnergyLevel = "LOW" | "NORMAL" | "HIGH";
