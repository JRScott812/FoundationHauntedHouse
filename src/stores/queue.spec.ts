import { createPinia, setActivePinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Direction } from "@/enums";
import { useQueueStore } from "@/stores/queue";

vi.mock("@/api/sms", () => ({
  sendSms: vi.fn().mockResolvedValue({ ok: true })
}));

function createTestPinia() {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  setActivePinia(pinia);
  return pinia;
}

describe("useQueueStore", () => {
  beforeEach(() => {
    createTestPinia();
  });

  it("assigns incrementing registration numbers on enqueue", async () => {
    const store = useQueueStore();

    const first = await store.enqueue({
      name: "Alpha",
      size: 2,
      phone: "+15555550101",
      notifyByText: false
    });
    const second = await store.enqueue({
      name: "Beta",
      size: 3,
      phone: null,
      notifyByText: false
    });

    expect(first.number).toBe(1);
    expect(second.number).toBe(2);
    expect(store.queue).toHaveLength(2);
    expect(store.nextRegistrationNumber).toBe(3);
  });

  it("records entryTime when dequeuing", async () => {
    const store = useQueueStore();

    await store.enqueue({
      name: "Alpha",
      size: 2,
      phone: null,
      notifyByText: false
    });

    await store.dequeue();

    expect(store.queue).toHaveLength(0);
    expect(store.queueHistory[0].entryTime).toBeTypeOf("number");
  });

  it("cancels a queued group and marks history", () => {
    const store = useQueueStore();
    store.queue.push({
      number: 4,
      name: "Ghost",
      size: 2,
      phone: null,
      notifyByText: false,
      registrationTime: Date.now()
    });
    store.queueHistory.push(store.queue[0]);

    store.cancel({ groupNumber: 4, noShow: false });

    expect(store.queue).toHaveLength(0);
    expect(store.queueHistory[0].cancelled).toBe(true);
    expect(store.queueHistory[0].cancellationTime).toBeTypeOf("number");
  });

  it("does not move the last group down", () => {
    const store = useQueueStore();
    store.queue = [
      {
        number: 1,
        name: "A",
        size: 1,
        phone: null,
        notifyByText: false,
        registrationTime: 1
      },
      {
        number: 2,
        name: "B",
        size: 1,
        phone: null,
        notifyByText: false,
        registrationTime: 2
      }
    ];

    store.move({ groupNumber: 2, direction: Direction.DOWN });

    expect(store.queue[0].number).toBe(1);
    expect(store.queue[1].number).toBe(2);
  });

  it("swaps groups when moving down within bounds", () => {
    const store = useQueueStore();
    store.queue = [
      {
        number: 1,
        name: "A",
        size: 1,
        phone: null,
        notifyByText: false,
        registrationTime: 1
      },
      {
        number: 2,
        name: "B",
        size: 1,
        phone: null,
        notifyByText: false,
        registrationTime: 2
      },
      {
        number: 3,
        name: "C",
        size: 1,
        phone: null,
        notifyByText: false,
        registrationTime: 3
      }
    ];

    store.move({ groupNumber: 2, direction: Direction.DOWN });

    expect(store.queue.map((g) => g.number)).toEqual([1, 3, 2]);
  });

  it("computes average time between groups", () => {
    const store = useQueueStore();
    store.queueHistory = [
      {
        number: 1,
        name: "A",
        size: 1,
        phone: null,
        notifyByText: false,
        registrationTime: 0,
        entryTime: 1000
      },
      {
        number: 2,
        name: "B",
        size: 1,
        phone: null,
        notifyByText: false,
        registrationTime: 0,
        entryTime: 4000
      },
      {
        number: 3,
        name: "C",
        size: 1,
        phone: null,
        notifyByText: false,
        registrationTime: 0,
        entryTime: 7000
      }
    ];

    expect(store.avgTimeBetweenGroups).toBe(3000);
  });

  it("imports and exports full queue state", () => {
    const store = useQueueStore();
    store.importState({
      queue: [
        {
          number: 9,
          name: "Restored",
          size: 2,
          phone: null,
          notifyByText: false,
          registrationTime: 1
        }
      ],
      queueHistory: [],
      nextRegistrationNumber: 10
    });

    expect(store.queue).toHaveLength(1);
    expect(store.queue[0].name).toBe("Restored");
    expect(store.nextRegistrationNumber).toBe(10);
    expect(store.exportState().nextRegistrationNumber).toBe(10);
  });
});
