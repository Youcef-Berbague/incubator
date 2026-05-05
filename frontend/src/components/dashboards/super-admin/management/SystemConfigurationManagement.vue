<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../../../../api.js";

const router = useRouter();

const loading = ref(false);
const saving = ref(false);
const error = ref("");
const successMessage = ref("");

const runtime = ref(null);
const counts = ref(null);
const auditSummary = ref(null);
const selectedAuditType = ref("securityLog");
const auditLogLines = ref([]);

const form = ref({
  registration: {
    minProjectTitleLength: 5,
    maxProjectTitleLength: 255,
    maxStudentsPerProject: 6,
    maxSupervisorsPerProject: 3,
  },
  security: {
    fingerprintMinSimilarity: 70,
    fingerprintSoftFail: true,
    refreshRotationThresholdMs: 86400000,
    rotateAfterRequests: 50,
    probabilisticRotatePercent: 0,
  },
  features: {
    aiChatPublic: true,
    projectRegistrationPublic: true,
  },
});

const loadConfig = async () => {
  loading.value = true;
  error.value = "";
  try {
    const [configRes, summaryRes] = await Promise.all([
      api.get("/admin/config"),
      api.get("/admin/audit/summary"),
    ]);

    if (configRes.data?.success) {
      const data = configRes.data.data;
      form.value = data.config;
      runtime.value = data.runtime;
      counts.value = data.counts;
    }

    if (summaryRes.data?.success) {
      auditSummary.value = summaryRes.data.data;
    }

    await loadAuditLog();
  } catch (err) {
    console.error("Error loading system config:", err);
    error.value = err.response?.data?.message || "Failed to load system configuration.";
  } finally {
    loading.value = false;
  }
};

const loadAuditLog = async () => {
  try {
    const response = await api.get("/admin/audit/logs", {
      params: { type: selectedAuditType.value, limit: 100 },
    });
    if (response.data?.success) {
      auditLogLines.value = response.data.data?.lines || [];
    }
  } catch (err) {
    console.error("Error loading audit log:", err);
    auditLogLines.value = [];
  }
};

const saveConfig = async () => {
  saving.value = true;
  error.value = "";
  try {
    const response = await api.patch("/admin/config", form.value);
    if (response.data?.success) {
      successMessage.value = "System configuration updated successfully.";
      setTimeout(() => (successMessage.value = ""), 3000);
    }
  } catch (err) {
    console.error("Error updating config:", err);
    if (err.response?.data?.errors?.length) {
      error.value = err.response.data.errors.map((e) => `${e.field}: ${e.message}`).join(" | ");
    } else {
      error.value = err.response?.data?.message || "Failed to update configuration.";
    }
  } finally {
    saving.value = false;
  }
};

onMounted(loadConfig);
</script>

<template>
  <div class="system-config">
    <div class="header">
      <div>
        <h1>System Configuration</h1>
        <p>Control platform limits, security behavior, and feature flags</p>
      </div>
      <button class="btn-secondary" @click="router.push('/dashboard')">Back</button>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="successMessage" class="alert success">{{ successMessage }}</div>

    <div v-if="loading" class="loading">Loading system settings...</div>

    <div v-else class="grid">
      <section class="card">
        <h3>Registration Rules</h3>
        <label>Min Title Length</label>
        <input v-model.number="form.registration.minProjectTitleLength" type="number" min="1" />
        <label>Max Title Length</label>
        <input v-model.number="form.registration.maxProjectTitleLength" type="number" min="1" />
        <label>Max Students per Project</label>
        <input v-model.number="form.registration.maxStudentsPerProject" type="number" min="1" />
        <label>Max Supervisors per Project</label>
        <input v-model.number="form.registration.maxSupervisorsPerProject" type="number" min="1" />
      </section>

      <section class="card">
        <h3>Security</h3>
        <label>Fingerprint Min Similarity</label>
        <input v-model.number="form.security.fingerprintMinSimilarity" type="number" min="0" />
        <label>Refresh Rotation Threshold (ms)</label>
        <input v-model.number="form.security.refreshRotationThresholdMs" type="number" min="0" />
        <label>Rotate After Requests</label>
        <input v-model.number="form.security.rotateAfterRequests" type="number" min="0" />
        <label>Probabilistic Rotate Percent (0-1)</label>
        <input v-model.number="form.security.probabilisticRotatePercent" type="number" min="0" max="1" step="0.01" />
        <label class="toggle"><input v-model="form.security.fingerprintSoftFail" type="checkbox" /> Fingerprint Soft Fail Enabled</label>
      </section>

      <section class="card">
        <h3>Feature Flags</h3>
        <label class="toggle"><input v-model="form.features.aiChatPublic" type="checkbox" /> AI Chat Public</label>
        <label class="toggle"><input v-model="form.features.projectRegistrationPublic" type="checkbox" /> Project Registration Public</label>

        <button class="btn-primary save" :disabled="saving" @click="saveConfig">
          {{ saving ? 'Saving...' : 'Save Configuration' }}
        </button>
      </section>

      <section class="card">
        <h3>Runtime Snapshot</h3>
        <p><strong>Environment:</strong> {{ runtime?.nodeEnv }}</p>
        <p><strong>Node:</strong> {{ runtime?.nodeVersion }}</p>
        <p><strong>Platform:</strong> {{ runtime?.platform }}/{{ runtime?.arch }}</p>
        <p><strong>Uptime (sec):</strong> {{ runtime?.uptimeSeconds }}</p>
        <p><strong>Hostname:</strong> {{ runtime?.hostname }}</p>
        <hr />
        <p><strong>Total Users:</strong> {{ counts?.users }}</p>
        <p><strong>Total Projects:</strong> {{ counts?.projects }}</p>
        <p><strong>Total Registrations:</strong> {{ counts?.registrations }}</p>
      </section>

      <section class="card full">
        <h3>Audit Logs</h3>
        <div class="audit-controls">
          <select v-model="selectedAuditType" @change="loadAuditLog">
            <option value="securityLog">Security</option>
            <option value="reqLog">Requests</option>
            <option value="errLog">Errors</option>
            <option value="unauthorizedReqLog">Unauthorized</option>
          </select>
          <button class="btn-secondary" @click="loadAuditLog">Refresh</button>
        </div>

        <div class="audit-summary" v-if="auditSummary">
          <p><strong>Current log lines:</strong> {{ auditSummary[selectedAuditType + '.txt']?.lineCount || 'N/A' }}</p>
        </div>

        <pre class="log-box">{{ auditLogLines.join('\n') || 'No log lines found.' }}</pre>
      </section>
    </div>
  </div>
</template>

<style scoped>
.system-config { padding: 24px; }
.header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; }
.alert { padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; }
.alert.error { background: #fdecec; color: #b42318; }
.alert.success { background: #edfdf3; color: #027a48; }
.loading { background: #fff; border-radius: 12px; padding: 16px; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.card { background: #fff; border: 1px solid #eaecf0; border-radius: 12px; padding: 14px; display: grid; gap: 8px; }
.card.full { grid-column: 1 / -1; }
input, select { width: 100%; padding: 9px; border: 1px solid #d0d5dd; border-radius: 8px; }
.toggle { display: flex; align-items: center; gap: 8px; }
.save { margin-top: 8px; }
.btn-primary, .btn-secondary { border: none; border-radius: 8px; padding: 10px 12px; cursor: pointer; }
.btn-primary { background: #0c7a43; color: #fff; }
.btn-secondary { background: #f2f4f7; color: #101828; }
.audit-controls { display: flex; gap: 8px; margin-bottom: 8px; }
.log-box { max-height: 280px; overflow: auto; background: #0b1220; color: #d6e3ff; padding: 12px; border-radius: 10px; font-size: 12px; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .header { flex-direction: column; align-items: flex-start; } }
</style>
