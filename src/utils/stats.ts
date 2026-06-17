import type { Group } from "@/types/group";

export interface NightStats {
  groupsCompleted: number;
  totalPeople: number;
  avgWaitMinutes: number | null;
  longestWaitMinutes: number | null;
}

export function computeNightStats(history: Group[]): NightStats {
  const completed = history.filter(
    (group) => group.entryTime !== undefined && group.cancelled !== true
  );

  if (completed.length === 0) {
    return {
      groupsCompleted: 0,
      totalPeople: 0,
      avgWaitMinutes: null,
      longestWaitMinutes: null
    };
  }

  const waitTimesSeconds = completed.map(
    (group) => (group.entryTime! - group.registrationTime) / 1000
  );

  const totalWait = waitTimesSeconds.reduce((sum, seconds) => sum + seconds, 0);
  const longestWait = Math.max(...waitTimesSeconds);

  return {
    groupsCompleted: completed.length,
    totalPeople: completed.reduce((sum, group) => sum + Number(group.size), 0),
    avgWaitMinutes: Math.round((totalWait / completed.length / 60) * 100) / 100,
    longestWaitMinutes: Math.round((longestWait / 60) * 100) / 100
  };
}
