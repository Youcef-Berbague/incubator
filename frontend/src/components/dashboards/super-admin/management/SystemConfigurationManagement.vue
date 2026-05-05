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
const refreshingAudit = ref(false);

const auditFileMap = {
  securityLog: "securityLog.txt",
  reqLog: "reqLog.txt",
  errLog: "errLog.txt",
  unauthorizedReqLog: "unauthorizedReqLog.txt",
};

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
  refreshingAudit.value = true;
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
  } finally {
    refreshingAudit.value = false;
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
        <div class="runtime-grid">
          <div class="runtime-item"><span>Environment</span><strong>{{ runtime?.nodeEnv }}</strong></div>
          <div class="runtime-item"><span>Node</span><strong>{{ runtime?.nodeVersion }}</strong></div>
          <div class="runtime-item"><span>Platform</span><strong>{{ runtime?.platform }}/{{ runtime?.arch }}</strong></div>
          <div class="runtime-item"><span>Uptime (sec)</span><strong>{{ runtime?.uptimeSeconds }}</strong></div>
          <div class="runtime-item"><span>Hostname</span><strong>{{ runtime?.hostname }}</strong></div>
        </div>
        <hr />
        <div class="runtime-grid">
          <div class="runtime-item"><span>Total Users</span><strong>{{ counts?.users }}</strong></div>
          <div class="runtime-item"><span>Total Projects</span><strong>{{ counts?.projects }}</strong></div>
          <div class="runtime-item"><span>Total Registrations</span><strong>{{ counts?.registrations }}</strong></div>
        </div>
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
          <button class="btn-secondary" :disabled="refreshingAudit" @click="loadAuditLog">
            {{ refreshingAudit ? "Refreshing..." : "Refresh" }}
          </button>
        </div>

        <div class="audit-summary" v-if="auditSummary">
          <p><strong>Current log lines:</strong> {{ auditSummary[auditFileMap[selectedAuditType]]?.lineCount || 'N/A' }}</p>
        </div>

        <pre class="log-box">{{ auditLogLines.join('\n') || 'No log lines found.' }}</pre>
      </section>
    </div>
  </div>
</template>

<style scoped>
.system-config { padding: 24px; background: linear-gradient(180deg, #f8fbff 0%, #f6f9f7 100%); min-height: 100vh; }
.header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; }
.alert { padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; }
.alert.error { background: #fdecec; color: #b42318; }
.alert.success { background: #edfdf3; color: #027a48; }
.loading { background: #fff; border-radius: 12px; padding: 16px; border: 1px solid #eaecf0; color: #475467; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.card { background: #fff; border: 1px solid #eaecf0; border-radius: 12px; padding: 14px; display: grid; gap: 8px; }
.card.full { grid-column: 1 / -1; }
input, select { width: 100%; padding: 9px; border: 1px solid #d0d5dd; border-radius: 8px; background: #fff; }
input:focus, select:focus { outline: none; border-color: #0c7a43; box-shadow: 0 0 0 3px rgba(12, 122, 67, 0.15); }
.toggle { display: flex; align-items: center; gap: 8px; }
.save { margin-top: 8px; }
.btn-primary, .btn-secondary { border: none; border-radius: 8px; padding: 10px 12px; cursor: pointer; transition: .2s ease; }
.btn-primary { background: #0c7a43; color: #fff; }
.btn-secondary { background: #f2f4f7; color: #101828; }
.btn-primary:hover, .btn-secondary:hover { transform: translateY(-1px); }
.btn-primary:disabled, .btn-secondary:disabled { opacity: .65; cursor: not-allowed; transform: none; }
.audit-controls { display: flex; gap: 8px; margin-bottom: 8px; }
.log-box { max-height: 320px; overflow: auto; background: #0b1220; color: #d6e3ff; padding: 12px; border-radius: 10px; font-size: 12px; line-height: 1.5; }
.runtime-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.runtime-item { background: #f8fafc; border: 1px solid #e4e7ec; border-radius: 8px; padding: 8px; display: grid; gap: 2px; }
.runtime-item span { color: #667085; font-size: 12px; }
.runtime-item strong { color: #101828; font-size: 13px; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .header { flex-direction: column; align-items: flex-start; } }
</style>
