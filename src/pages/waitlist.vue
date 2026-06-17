<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCrossTabSync } from "@/composables/useCrossTabSync";
import { useWaitlistTheme } from "@/composables/useWaitlistTheme";
import { useQueueStore } from "@/stores/queue";
import { millisecondsToHHMMSS } from "@/utils/time";

const store = useQueueStore();
const { queue, nextGroup } = storeToRefs(store);
const { themeClass } = useWaitlistTheme();

useCrossTabSync();

const waitingGroups = computed(() => queue.value.slice(1));

const nextGroupName = computed(() => nextGroup.value?.name ?? "");

const nextGroupNumber = computed(() => nextGroup.value?.number ?? null);

const heroMessage = computed(() => {
  if (queue.value.length === 0) return "No groups waiting";
  if (queue.value.length === 1) return "Get ready…";
  return nextGroupName.value;
});

const showGroupNumber = computed(() => queue.value.length > 0 && nextGroupNumber.value !== null);

const timeBetweenGroups = computed(() => store.avgTimeBetweenGroups);
</script>

<template>
  <div class="waitlist hh-page" :class="themeClass">
    <div class="waitlist__overlay" />

    <header class="waitlist__banner">
      <h1 class="hh-display-title waitlist__title">The Asylum</h1>
      <h2 class="waitlist__subtitle">A Foundation Open House</h2>
    </header>

    <main class="waitlist__body">
      <v-card class="hh-glass-card waitlist__hero rounded-b-0" elevation="4">
        <h2 class="waitlist__section-label">Next Group</h2>
        <Transition name="fade" mode="out-in">
          <div :key="heroMessage + String(nextGroupNumber)" class="waitlist__hero-content">
            <div class="waitlist__next-name">{{ heroMessage }}</div>
            <div v-if="showGroupNumber" class="waitlist__next-number">
              Group #{{ nextGroupNumber }}
            </div>
          </div>
        </Transition>
      </v-card>

      <v-card class="hh-glass-card waitlist__queue rounded-t-0" elevation="4">
        <table v-if="waitingGroups.length > 0" class="waitlist__table">
          <tbody>
            <tr
              v-for="(group, idx) in waitingGroups"
              :key="group.number"
              :class="{ 'waitlist__row--odd': idx % 2 === 1 }"
            >
              <td class="waitlist__cell waitlist__cell--number">{{ group.number }}</td>
              <td class="waitlist__cell waitlist__cell--name">{{ group.name }}</td>
              <td class="waitlist__cell waitlist__cell--wait">
                {{
                  millisecondsToHHMMSS(
                    timeBetweenGroups ? timeBetweenGroups * (idx + 1) : undefined
                  )
                }}
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="waitlist__empty">No additional groups in line</p>
      </v-card>
    </main>
  </div>
</template>

<style scoped>
.waitlist {
  position: relative;
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.waitlist--asylum {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.72)),
    radial-gradient(circle at 20% 20%, rgba(139, 0, 0, 0.25), transparent 45%),
    linear-gradient(160deg, #1a0a0a 0%, #0d0d0f 55%, #120808 100%);
}

.waitlist--catacombs {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.78)),
    radial-gradient(circle at 70% 30%, rgba(90, 80, 70, 0.2), transparent 40%),
    linear-gradient(180deg, #1c1a18 0%, #0f0e0d 50%, #181512 100%);
}

.waitlist__overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.55));
}

.waitlist__banner {
  position: relative;
  z-index: 1;
  background: rgba(0, 0, 0, 0.7);
  padding: 1.25rem 1rem 1rem;
  text-align: center;
}

.waitlist__title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: var(--hh-text);
}

.waitlist__subtitle {
  margin: 0.35rem 0 0;
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  font-weight: 400;
  color: var(--hh-text-dim);
}

.waitlist__body {
  position: relative;
  z-index: 1;
  padding: clamp(1.5rem, 4vw, 3.5rem) clamp(1rem, 8vw, 6rem);
}

.waitlist__hero,
.waitlist__queue {
  background: rgba(255, 255, 255, 0.08) !important;
}

.waitlist__section-label {
  margin: 0.5rem 0 0 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
}

.waitlist__hero-content {
  padding: 1rem 1rem 2rem;
  text-align: center;
}

.waitlist__next-name {
  font-size: clamp(4rem, 12vw, 10rem);
  font-weight: 600;
  line-height: 1.05;
  color: #fff;
  word-break: break-word;
}

.waitlist__next-number {
  margin-top: 0.5rem;
  font-size: clamp(1.25rem, 3vw, 2rem);
  color: var(--hh-text-dim);
}

.waitlist__table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.waitlist__row--odd {
  background: rgba(200, 200, 200, 0.08);
}

.waitlist__cell {
  font-size: clamp(1.25rem, 2.5vw, 2rem);
  padding: 0.65rem 0.75rem;
  color: #fff;
}

.waitlist__cell--number {
  width: 90px;
  text-align: center;
}

.waitlist__cell--name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.waitlist__cell--wait {
  width: 140px;
  text-align: end;
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, monospace;
  color: var(--hh-text-dim);
}

.waitlist__empty {
  text-align: center;
  padding: 2rem;
  margin: 0;
  color: var(--hh-text-dim);
  font-size: 1.25rem;
}
</style>
