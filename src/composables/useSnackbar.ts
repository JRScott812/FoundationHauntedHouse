import { ref } from "vue";

const message = ref("");
const visible = ref(false);
const color = ref<"success" | "error" | "info">("info");
let timeoutId: ReturnType<typeof setTimeout> | null = null;

export function useSnackbar() {
  function show(text: string, type: "success" | "error" | "info" = "info") {
    message.value = text;
    color.value = type;
    visible.value = true;

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      visible.value = false;
    }, 4000);
  }

  return {
    message,
    visible,
    color,
    show
  };
}
