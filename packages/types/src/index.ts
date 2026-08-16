export type SystemStatus = "online" | "offline";

export interface HealthResponse {
  status: SystemStatus;
  database: "connected" | "unavailable";
  timestamp: string;
}
