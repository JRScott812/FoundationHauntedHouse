import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { sendSms } from "@/api/sms";
import { Direction } from "@/enums";
import type { Group, NewGroupInput, QueueState } from "@/types/group";
import { nextInLineSmsBody, registrationSmsBody } from "@/utils/smsMessages";

const STORAGE_KEY = "vuex";

type SmsFeedback = (result: { ok: boolean; error?: string; groupNumber?: number }) => void;

export const useQueueStore = defineStore(
  "queue",
  () => {
    const queue = ref<Group[]>([]);
    const queueHistory = ref<Group[]>([]);
    const nextRegistrationNumber = ref(1);

    const nextGroup = computed(() => queue.value[0] ?? null);

    const queueHistoryGetter = computed(() => queueHistory.value);

    const totalPeopleWaiting = computed(() =>
      queue.value.reduce((sum, group) => sum + Number(group.size), 0)
    );

    const avgTimeBetweenGroups = computed(() => {
      const entryTimes = queueHistory.value
        .map((group) => group.entryTime)
        .filter((time): time is number => time !== undefined)
        .sort((a, b) => a - b);

      if (entryTimes.length < 2) return undefined;

      let cumulativeWait = 0;
      for (let i = 1; i < entryTimes.length; i++) {
        cumulativeWait += entryTimes[i] - entryTimes[i - 1];
      }
      return cumulativeWait / (entryTimes.length - 1);
    });

    function assignRegistrationNumber(input: NewGroupInput): Group {
      const group: Group = {
        ...input,
        number: nextRegistrationNumber.value,
        registrationTime: Date.now(),
        size: Number(input.size)
      };
      nextRegistrationNumber.value++;
      return group;
    }

    function pushGroup(group: Group) {
      queue.value.push(group);
      queueHistory.value.push(group);
    }

    async function notifyNextInLine(group: Group, onSmsResult?: SmsFeedback) {
      if (!group.notifyByText || !group.phone) return;
      const result = await sendSms(group.phone, nextInLineSmsBody(group));
      onSmsResult?.({ ...result, groupNumber: group.number });
    }

    async function enqueue(input: NewGroupInput, onSmsResult?: SmsFeedback) {
      const group = assignRegistrationNumber(input);
      pushGroup(group);

      if (group.notifyByText && group.phone) {
        const result = await sendSms(group.phone, registrationSmsBody(group));
        onSmsResult?.({ ...result, groupNumber: group.number });
      }

      if (queue.value.length === 2) {
        await notifyNextInLine(queue.value[1], onSmsResult);
      }

      return group;
    }

    async function dequeue(onSmsResult?: SmsFeedback) {
      if (queue.value.length > 0) {
        const current = queue.value[0];
        const updated: Group = { ...current, entryTime: Date.now() };
        const idx = queueHistory.value.findIndex((g) => g.number === updated.number);
        if (idx >= 0) {
          queueHistory.value[idx] = updated;
        }
        queue.value.shift();
      }

      if (queue.value.length > 1) {
        await notifyNextInLine(queue.value[1], onSmsResult);
      }
    }

    function edit(payload: Partial<Group> & Pick<Group, "number">) {
      const idx = queue.value.findIndex((group) => group.number === payload.number);
      if (idx < 0) throw new Error("Group not found in queue");
      Object.assign(queue.value[idx], payload);
    }

    function cancel(payload: { groupNumber: number; noShow: boolean }) {
      let idx = queue.value.findIndex((group) => group.number === payload.groupNumber);
      if (idx < 0) throw new Error("Group not found in queue");

      const group = queue.value[idx];
      group.cancelled = true;
      if (!payload.noShow) {
        group.cancellationTime = Date.now();
      }
      queue.value.splice(idx, 1);

      idx = queueHistory.value.findIndex((g) => g.number === group.number);
      if (idx >= 0) {
        queueHistory.value[idx] = group;
      }
    }

    function move(payload: { groupNumber: number; direction: Direction }) {
      const idx = queue.value.findIndex((group) => group.number === payload.groupNumber);
      if (idx < 0) throw new Error("Group not found in queue");
      if (idx === 0 && payload.direction === Direction.UP) return;
      if (idx === queue.value.length - 1 && payload.direction === Direction.DOWN) return;

      const neighborIdx = idx + payload.direction;
      [queue.value[idx], queue.value[neighborIdx]] = [queue.value[neighborIdx], queue.value[idx]];
    }

    function reset() {
      queue.value = [];
      queueHistory.value = [];
      nextRegistrationNumber.value = 1;
    }

    function exportState(): QueueState {
      return {
        queue: queue.value,
        queueHistory: queueHistory.value,
        nextRegistrationNumber: nextRegistrationNumber.value
      };
    }

    function importState(state: QueueState) {
      queue.value = state.queue ?? [];
      queueHistory.value = state.queueHistory ?? [];
      nextRegistrationNumber.value = state.nextRegistrationNumber ?? 1;
    }

    function hydrateFromStorage() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw) as {
          queue?: Group[];
          queueHistory?: Group[];
          nextRegistrationNumber?: number;
        };

        if (parsed.queue) queue.value = parsed.queue;
        if (parsed.queueHistory) queueHistory.value = parsed.queueHistory;
        if (parsed.nextRegistrationNumber) {
          nextRegistrationNumber.value = parsed.nextRegistrationNumber;
        }
      } catch {
        // Ignore malformed persisted state
      }
    }

    return {
      queue,
      queueHistory,
      nextRegistrationNumber,
      nextGroup,
      queueHistoryGetter,
      totalPeopleWaiting,
      avgTimeBetweenGroups,
      enqueue,
      dequeue,
      edit,
      cancel,
      move,
      reset,
      exportState,
      importState,
      hydrateFromStorage
    };
  },
  {
    persist: {
      key: "vuex"
    }
  }
);
