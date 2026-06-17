<script setup lang="ts">
import { RouterView } from "vue-router";
import { useSnackbar } from "@/composables/useSnackbar";

const { message, visible, color } = useSnackbar();
</script>

<template>
  <v-app class="hh-page">
    <v-main>
      <RouterView />
    </v-main>

    <v-snackbar v-model="visible" :color="color" location="top">
      {{ message }}
    </v-snackbar>
  </v-app>
</template>

<style scoped>
.hh-page {
  background: var(--hh-bg-dark);
}
</style>
