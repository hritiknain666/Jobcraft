export type MonitoringLevel = "info" | "warn" | "error";

type MonitoringDetails = Record<string, boolean | number | string | string[] | null>;

export function logMonitoringEvent(
  level: MonitoringLevel,
  event: string,
  details: MonitoringDetails = {},
) {
  const record = {
    timestamp: new Date().toISOString(),
    service: "jobcraft",
    event,
    ...details,
  };

  if (level === "error") console.error(record);
  else if (level === "warn") console.warn(record);
  else console.info(record);
}
