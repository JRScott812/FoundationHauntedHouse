import { computed, onMounted, onUnmounted, ref } from "vue";

export type WaitlistTheme = "asylum" | "catacombs";

const STORAGE_KEY = "hh-waitlist-theme";
const theme = ref<WaitlistTheme>(readStoredTheme());

function readStoredTheme(): WaitlistTheme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "catacombs" ? "catacombs" : "asylum";
}

function handleStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY) {
    theme.value = readStoredTheme();
  }
}

export function useWaitlistTheme() {
  const themeClass = computed(() => `waitlist--${theme.value}`);

  function setTheme(next: WaitlistTheme) {
    theme.value = next;
    localStorage.setItem(STORAGE_KEY, next);
  }

  onMounted(() => {
    window.addEventListener("storage", handleStorage);
  });

  onUnmounted(() => {
    window.removeEventListener("storage", handleStorage);
  });

  return {
    theme,
    themeClass,
    setTheme
  };
}
