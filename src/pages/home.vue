<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useWaitlistTheme } from "@/composables/useWaitlistTheme";

const { theme, setTheme } = useWaitlistTheme();
</script>

<template>
  <div class="home hh-page">
    <div class="home__vignette" />

    <v-container class="home__content">
      <header class="home__header">
        <h1 class="hh-display-title home__title">The Asylum</h1>
        <p class="home__subtitle">Foundation Open House — Waitlist</p>
      </header>

      <v-row class="home__actions" justify="center">
        <v-col cols="12" md="5">
          <RouterLink to="/waitlist" target="_blank" class="home__card-link">
            <v-card class="hh-glass-card home__card" elevation="8">
              <v-card-text class="text-center pa-8">
                <v-icon icon="mdi-monitor" size="72" color="primary" class="mb-4" />
                <h2 class="text-h5 mb-2">Open Waitlist Display</h2>
                <p class="text-medium-emphasis">
                  Full-screen TV view showing the next group and estimated wait times.
                </p>
              </v-card-text>
            </v-card>
          </RouterLink>
        </v-col>

        <v-col cols="12" md="5">
          <RouterLink to="/registration" target="_blank" class="home__card-link">
            <v-card class="hh-glass-card home__card" elevation="8">
              <v-card-text class="text-center pa-8">
                <v-icon icon="mdi-account-multiple-plus" size="72" color="primary" class="mb-4" />
                <h2 class="text-h5 mb-2">Open Registration Desk</h2>
                <p class="text-medium-emphasis">
                  Operator console to register groups, send them through, and manage the queue.
                </p>
              </v-card-text>
            </v-card>
          </RouterLink>
        </v-col>
      </v-row>

      <footer class="home__footer text-medium-emphasis">
        Open both windows in the same browser · Press F11 on the TV window for fullscreen
      </footer>

      <div class="home__theme-picker">
        <span class="text-medium-emphasis">TV background:</span>
        <v-btn-toggle
          :model-value="theme"
          mandatory
          density="comfortable"
          @update:model-value="setTheme"
        >
          <v-btn value="asylum" size="small">Asylum</v-btn>
          <v-btn value="catacombs" size="small">Catacombs</v-btn>
        </v-btn-toggle>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at center, rgba(139, 0, 0, 0.15), transparent 55%),
    linear-gradient(180deg, #0d0d0f 0%, #1a1010 100%);
}

.home__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.8);
}

.home__content {
  position: relative;
  z-index: 1;
  max-width: 1100px;
}

.home__header {
  text-align: center;
  margin-bottom: 3rem;
}

.home__title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  color: var(--hh-text);
  margin: 0;
}

.home__subtitle {
  margin: 0.75rem 0 0;
  font-size: 1.15rem;
  color: var(--hh-text-dim);
}

.home__card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.home__card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.home__card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(139, 0, 0, 0.35) !important;
  border-color: rgba(139, 0, 0, 0.6) !important;
}

.home__footer {
  text-align: center;
  margin-top: 2.5rem;
  font-size: 0.95rem;
}

.home__theme-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>
