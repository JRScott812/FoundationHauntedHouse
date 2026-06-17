import { describe, expect, it } from "vitest";
import { computeNightStats } from "@/utils/stats";
import type { Group } from "@/types/group";

function makeGroup(overrides: Partial<Group> & Pick<Group, "number">): Group {
  return {
    name: "Test",
    size: 2,
    phone: null,
    notifyByText: false,
    registrationTime: 1000,
    ...overrides
  };
}

describe("computeNightStats", () => {
  it("returns zeros when no completed groups exist", () => {
    const stats = computeNightStats([
      makeGroup({ number: 1, cancelled: true }),
      makeGroup({ number: 2 })
    ]);

    expect(stats).toEqual({
      groupsCompleted: 0,
      totalPeople: 0,
      avgWaitMinutes: null,
      longestWaitMinutes: null
    });
  });

  it("mirrors getStats.py wait time math for completed groups", () => {
    const stats = computeNightStats([
      makeGroup({ number: 1, entryTime: 61000, size: 3 }),
      makeGroup({ number: 2, entryTime: 91000, size: 4, registrationTime: 2000 })
    ]);

    expect(stats.groupsCompleted).toBe(2);
    expect(stats.totalPeople).toBe(7);
    expect(stats.avgWaitMinutes).toBe(1.24);
    expect(stats.longestWaitMinutes).toBe(1.48);
  });
});
