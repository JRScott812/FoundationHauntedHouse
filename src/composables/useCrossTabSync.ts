import { onMounted, onUnmounted } from "vue";
import { useQueueStore } from "@/stores/queue";

const CHANNEL_NAME = "haunted-house-queue";

export function useCrossTabSync() {
  const store = useQueueStore();
  let channel: BroadcastChannel | null = null;

  function handleExternalUpdate() {
    store.hydrateFromStorage();
  }

  onMounted(() => {
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = () => handleExternalUpdate();
    }

    window.addEventListener("storage", handleExternalUpdate);
  });

  onUnmounted(() => {
    channel?.close();
    window.removeEventListener("storage", handleExternalUpdate);
  });

  function notifyOtherTabs() {
    channel?.postMessage("update");
  }

  return { notifyOtherTabs };
}
