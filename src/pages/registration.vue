<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { saveAs } from "file-saver";
import { useCrossTabSync } from "@/composables/useCrossTabSync";
import { useSnackbar } from "@/composables/useSnackbar";
import { Direction } from "@/enums";
import { useQueueStore } from "@/stores/queue";
import type { Group } from "@/types/group";
import { isValidUsPhone, normalizePhone } from "@/utils/phone";
import { computeNightStats } from "@/utils/stats";
import { formatMinutes } from "@/utils/time";

const store = useQueueStore();
const { queue, nextRegistrationNumber, totalPeopleWaiting, avgTimeBetweenGroups, queueHistory } =
  storeToRefs(store);
const { show: showSnackbar } = useSnackbar();
const { notifyOtherTabs } = useCrossTabSync();

const formRef = ref<{ validate: () => Promise<{ valid: boolean }>; reset: () => void } | null>(
  null
);
const editFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const valid = ref(false);

const resetDialog = ref(false);
const restoreDialog = ref(false);
const restorePreview = ref<ReturnType<typeof store.exportState> | null>(null);
const restoreFileInput = ref<HTMLInputElement | null>(null);
const editDialog = ref(false);
const cancelGroupDialog = reactive({
  active: false,
  group: undefined as Group | undefined
});

const defaultEditGroupForm = Object.freeze({
  number: 0,
  name: "",
  size: 1,
  phone: "+1",
  notifyByText: true
});

const group = reactive({
  name: "",
  size: 1,
  phone: "+1",
  notifyByText: true
});

const editGroup = reactive({ ...defaultEditGroupForm });

const nameRules = [(v: string) => !!v || "Group name is required"];

const sizeRules = [
  (v: number | string) => !!v || "Group count is required",
  (v: number | string) => {
    const n = Number(v);
    return (Number.isInteger(n) && n >= 1 && n <= 20) || "Enter a whole number between 1 and 20";
  }
];

const addPhoneRules = computed(() => {
  if (!group.notifyByText) return [() => true];
  return [(v: string) => isValidUsPhone(v) || "Must be a valid US phone number (+1##########)"];
});

const editPhoneRules = computed(() => {
  if (!editGroup.notifyByText) return [() => true];
  return [(v: string) => isValidUsPhone(v) || "Must be a valid US phone number (+1##########)"];
});

const headers = [
  { title: "Group #", key: "number", width: "90px" },
  { title: "Name", key: "name" },
  { title: "Size", key: "size", width: "80px" },
  { title: "Phone", key: "phone" },
  { title: "SMS", key: "notifyByText", width: "70px" },
  { title: "Actions", key: "actions", sortable: false, width: "120px" },
  { title: "Move", key: "move", sortable: false, width: "110px" }
];

const statsText = computed(() => {
  const groups = queue.value.length;
  const people = totalPeopleWaiting.value;
  const avg = formatMinutes(avgTimeBetweenGroups.value);
  return `${groups} groups waiting · ${people} people total · ${avg} avg between groups`;
});

const nightStats = computed(() => computeNightStats(queueHistory.value));

const nightStatsText = computed(() => {
  const stats = nightStats.value;
  if (stats.groupsCompleted === 0) return "No completed groups yet tonight";
  const avg = stats.avgWaitMinutes ?? "—";
  const longest = stats.longestWaitMinutes ?? "—";
  return `${stats.groupsCompleted} groups · ${stats.totalPeople} people · ${avg} min avg wait · ${longest} min longest`;
});

function handleSmsResult(result: { ok: boolean; error?: string; groupNumber?: number }) {
  notifyOtherTabs();
  if (!result.ok) {
    showSnackbar(result.error ?? "Failed to send SMS", "error");
    return;
  }
  if (result.groupNumber !== undefined) {
    showSnackbar(`SMS sent to group #${result.groupNumber}`, "success");
  }
}

function clearForm() {
  formRef.value?.reset();
  group.name = "";
  group.size = 1;
  group.phone = "+1";
  group.notifyByText = true;
}

async function addGroup() {
  const validation = await formRef.value?.validate();
  if (!validation?.valid) return;

  const phone = normalizePhone(group.phone, group.notifyByText);
  if (group.notifyByText && !phone) {
    showSnackbar("A valid phone number is required for SMS", "error");
    return;
  }

  const added = await store.enqueue(
    {
      name: group.name.trim(),
      size: Number(group.size),
      phone,
      notifyByText: group.notifyByText
    },
    handleSmsResult
  );

  notifyOtherTabs();
  showSnackbar(`Group #${added.number} added`, "success");
  clearForm();
}

async function sendGroup() {
  await store.dequeue(handleSmsResult);
  notifyOtherTabs();
}

function showResetQueue() {
  resetDialog.value = true;
}

function hideResetQueue() {
  resetDialog.value = false;
}

function resetQueue() {
  store.reset();
  notifyOtherTabs();
  resetDialog.value = false;
  showSnackbar("Queue reset", "info");
}

function showEditItem(item: Group) {
  Object.assign(editGroup, item);
  editDialog.value = true;
}

function hideEditItem() {
  Object.assign(editGroup, defaultEditGroupForm);
  editDialog.value = false;
}

async function saveEdit() {
  const validation = await editFormRef.value?.validate();
  if (!validation?.valid) return;

  const phone = normalizePhone(editGroup.phone, editGroup.notifyByText);
  if (editGroup.notifyByText && !phone) {
    showSnackbar("A valid phone number is required for SMS", "error");
    return;
  }

  store.edit({
    number: editGroup.number,
    name: editGroup.name.trim(),
    size: Number(editGroup.size),
    phone,
    notifyByText: editGroup.notifyByText
  });
  notifyOtherTabs();
  hideEditItem();
  showSnackbar(`Group #${editGroup.number} updated`, "success");
}

function showCancelDialog(item: Group) {
  cancelGroupDialog.group = item;
  cancelGroupDialog.active = true;
}

function cancelSelectedGroup() {
  if (!cancelGroupDialog.group) return;
  store.cancel({
    groupNumber: cancelGroupDialog.group.number,
    noShow: false
  });
  notifyOtherTabs();
  cancelGroupDialog.active = false;
  showSnackbar(`Group #${cancelGroupDialog.group.number} cancelled`, "info");
}

function move(item: Group, direction: Direction) {
  store.move({ groupNumber: item.number, direction });
  notifyOtherTabs();
}

function downloadHistory() {
  const history = store.queueHistoryGetter;
  const downloadedFile = new Blob([JSON.stringify(history)], {
    type: "application/json"
  });
  saveAs(downloadedFile, "HauntedHouseHistory.json");
}

function backupQueue() {
  const snapshot = store.exportState();
  const downloadedFile = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: "application/json"
  });
  saveAs(downloadedFile, `HauntedHouseBackup-${Date.now()}.json`);
  showSnackbar("Queue backup downloaded", "success");
}

function openRestorePicker() {
  restoreFileInput.value?.click();
}

async function handleRestoreFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";

  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as Partial<ReturnType<typeof store.exportState>>;

    if (!parsed.queue || !parsed.queueHistory || !parsed.nextRegistrationNumber) {
      throw new Error("Invalid backup file format");
    }

    restorePreview.value = {
      queue: parsed.queue,
      queueHistory: parsed.queueHistory,
      nextRegistrationNumber: parsed.nextRegistrationNumber
    };
    restoreDialog.value = true;
  } catch {
    showSnackbar("Could not read backup file", "error");
  }
}

function confirmRestore() {
  if (!restorePreview.value) return;
  store.importState(restorePreview.value);
  notifyOtherTabs();
  restoreDialog.value = false;
  restorePreview.value = null;
  showSnackbar("Queue restored from backup", "success");
}

function cancelRestore() {
  restoreDialog.value = false;
  restorePreview.value = null;
}

function rowProps({ item }: { item: Group }) {
  return {
    class: item.number === queue.value[0]?.number ? "registration__row--next" : ""
  };
}
</script>

<template>
  <v-container class="registration" fluid>
    <v-row>
      <v-col cols="12" lg="4">
        <v-card class="hh-glass-card pa-4 registration__form-card" elevation="4">
          <div class="d-flex align-center justify-space-between mb-4">
            <h2 class="text-h5">Register New Group</h2>
            <v-chip color="primary" variant="flat" size="large">
              Next #{{ nextRegistrationNumber }}
            </v-chip>
          </div>

          <v-form ref="formRef" v-model="valid">
            <v-text-field
              v-model="group.name"
              :rules="nameRules"
              label="Group Name"
              autocomplete="off"
            />
            <v-text-field
              v-model.number="group.size"
              :rules="sizeRules"
              label="Number of people"
              type="number"
              min="1"
              max="20"
            />
            <v-text-field
              v-model="group.phone"
              :rules="addPhoneRules"
              label="Phone number"
              hint="US format: +1##########"
              persistent-hint
            />
            <v-checkbox v-model="group.notifyByText" label="Send SMS notifications" hide-details />
          </v-form>

          <v-btn
            color="primary"
            size="large"
            block
            class="mt-4"
            :disabled="!valid"
            @click="addGroup"
          >
            Add Group
          </v-btn>
          <v-btn variant="text" block class="mt-2" @click="clearForm">Clear Form</v-btn>

          <v-divider class="my-4" />

          <h3 class="text-subtitle-1 mb-2">Tonight's stats</h3>
          <p class="text-medium-emphasis registration__night-stats">{{ nightStatsText }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" lg="8">
        <v-card class="hh-glass-card pa-4" elevation="4">
          <div class="registration__toolbar">
            <v-btn color="primary" size="large" @click="sendGroup"> Send Next Group → </v-btn>

            <v-spacer />

            <v-btn
              icon="mdi-download"
              title="Download history"
              variant="text"
              @click="downloadHistory"
            />
            <v-btn
              icon="mdi-content-save"
              title="Backup queue"
              variant="text"
              @click="backupQueue"
            />
            <v-btn
              icon="mdi-backup-restore"
              title="Restore queue"
              variant="text"
              @click="openRestorePicker"
            />
            <input
              ref="restoreFileInput"
              type="file"
              accept="application/json,.json"
              hidden
              @change="handleRestoreFile"
            />
            <v-btn color="error" variant="outlined" @click="showResetQueue"> Reset Queue </v-btn>
          </div>

          <p class="registration__stats text-medium-emphasis">{{ statsText }}</p>

          <v-data-table
            :headers="headers"
            :items="queue"
            :row-props="rowProps"
            density="comfortable"
            hide-default-footer
            items-per-page="-1"
            class="registration__table"
          >
            <template #[`item.notifyByText`]="{ item }">
              <v-icon
                :icon="item.notifyByText ? 'mdi-check' : 'mdi-close'"
                :color="item.notifyByText ? 'success' : 'error'"
                size="small"
              />
            </template>

            <template #[`item.phone`]="{ item }">
              {{ item.phone ?? "—" }}
            </template>

            <template #[`item.actions`]="{ item }">
              <v-btn icon="mdi-pencil" size="small" variant="text" @click="showEditItem(item)" />
              <v-btn
                icon="mdi-cancel"
                size="small"
                variant="text"
                color="error"
                @click="showCancelDialog(item)"
              />
            </template>

            <template #[`item.move`]="{ item }">
              <v-btn
                icon="mdi-arrow-up"
                size="small"
                variant="text"
                :disabled="item.number === queue[0]?.number"
                @click="move(item, Direction.UP)"
              />
              <v-btn
                icon="mdi-arrow-down"
                size="small"
                variant="text"
                :disabled="item.number === queue[queue.length - 1]?.number"
                @click="move(item, Direction.DOWN)"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="editDialog" max-width="500">
      <v-card class="pa-4 hh-glass-card">
        <v-form ref="editFormRef">
          <p class="text-medium-emphasis mb-4">Group #{{ editGroup.number }}</p>
          <v-text-field v-model="editGroup.name" :rules="nameRules" label="Group Name" />
          <v-text-field
            v-model.number="editGroup.size"
            :rules="sizeRules"
            label="Group Size"
            type="number"
            min="1"
            max="20"
          />
          <v-text-field v-model="editGroup.phone" :rules="editPhoneRules" label="Group Phone" />
          <v-checkbox v-model="editGroup.notifyByText" label="Send SMS notifications" />
        </v-form>
        <v-card-actions>
          <v-btn color="primary" @click="saveEdit">Save Changes</v-btn>
          <v-spacer />
          <v-btn variant="text" @click="hideEditItem">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="resetDialog" max-width="500">
      <v-card class="pa-4 hh-glass-card">
        <v-card-title>Reset the queue?</v-card-title>
        <v-card-subtitle>You cannot undo this action.</v-card-subtitle>
        <v-card-actions>
          <v-btn color="error" @click="resetQueue">Reset</v-btn>
          <v-spacer />
          <v-btn variant="text" @click="hideResetQueue">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="restoreDialog" max-width="500">
      <v-card class="pa-4 hh-glass-card">
        <v-card-title>Restore queue backup?</v-card-title>
        <v-card-subtitle>
          This replaces the current queue with
          {{ restorePreview?.queue.length ?? 0 }} waiting groups and
          {{ restorePreview?.queueHistory.length ?? 0 }} history entries.
        </v-card-subtitle>
        <v-card-actions>
          <v-btn color="primary" @click="confirmRestore">Restore</v-btn>
          <v-spacer />
          <v-btn variant="text" @click="cancelRestore">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="cancelGroupDialog.active" max-width="500">
      <v-card class="pa-4 hh-glass-card">
        <v-card-title>Cancel this group?</v-card-title>
        <v-card-subtitle>This removes them from the active queue.</v-card-subtitle>
        <v-card-actions>
          <v-btn color="error" @click="cancelSelectedGroup">Cancel Group</v-btn>
          <v-spacer />
          <v-btn variant="text" @click="cancelGroupDialog.active = false">Nevermind</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.registration {
  max-width: 1400px;
  padding-top: 1.5rem;
  padding-bottom: 2rem;
}

.registration__form-card {
  position: sticky;
  top: 1rem;
}

.registration__toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.registration__stats {
  margin: 0 0 1rem;
  font-size: 0.95rem;
}

.registration__night-stats {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

:deep(.registration__row--next) {
  background: rgba(139, 0, 0, 0.18) !important;
}
</style>
