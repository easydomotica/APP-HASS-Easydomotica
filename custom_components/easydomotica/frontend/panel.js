/**
 * Easydomotica Panel — accesso legato all'utente HA "easydomotica"
 * Nessun form di login separato: usa il token HA già presente nel browser.
 */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :host {
    display: block;
    width: 100%;
    height: 100%;
    font-family: 'Inter', system-ui, sans-serif;
    background: #0f1117;
    color: #e2e8f0;
  }

  .panel { width: 100%; height: 100%; overflow-y: auto; background: #0f1117; }

  /* ── SCHERMATA ACCESSO NEGATO ── */
  .denied-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse at 50% 40%, #1a0a0a 0%, #0f1117 60%);
  }

  .denied-card {
    background: #161b27;
    border: 1px solid #3f1515;
    border-radius: 16px;
    padding: 48px 40px;
    width: 380px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  }

  .denied-icon {
    width: 64px;
    height: 64px;
    background: #2d0d0d;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .denied-icon svg { width: 32px; height: 32px; fill: #f87171; }

  .denied-card h2 {
    font-size: 20px;
    font-weight: 700;
    color: #fca5a5;
    margin-bottom: 10px;
  }

  .denied-card p {
    font-size: 13px;
    color: #64748b;
    line-height: 1.6;
  }

  .denied-card code {
    background: #0f1117;
    border: 1px solid #3f1515;
    border-radius: 4px;
    padding: 2px 8px;
    color: #f87171;
    font-size: 13px;
    font-family: monospace;
  }

  .denied-user {
    background: #1a1020;
    border: 1px solid #2d1a3d;
    border-radius: 8px;
    padding: 10px 14px;
    margin-top: 20px;
    font-size: 12px;
    color: #7c6f8a;
  }

  .denied-user span { color: #a78bfa; font-weight: 600; }

  /* ── LOADING ── */
  .loading-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
  }

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #1e2a3d;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .loading-text { font-size: 13px; color: #475569; }

  /* ── TOPBAR ── */
  .topbar {
    background: #161b27;
    border-bottom: 1px solid #1e2a3d;
    padding: 0 24px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .topbar-left { display: flex; align-items: center; gap: 10px; }

  .topbar-logo {
    width: 28px; height: 28px;
    background: #3b82f6;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
  }

  .topbar-logo svg { width: 16px; height: 16px; fill: white; }
  .topbar-title { font-size: 15px; font-weight: 600; color: #e2e8f0; }

  .topbar-badge {
    background: #0f3460;
    color: #60a5fa;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .topbar-user {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #475569;
  }

  .topbar-user-dot {
    width: 7px; height: 7px;
    background: #4ade80;
    border-radius: 50%;
    box-shadow: 0 0 6px #4ade80;
  }

  .topbar-user strong { color: #94a3b8; }

  /* ── CONTENT ── */
  .content {
    max-width: 800px;
    margin: 0 auto;
    padding: 32px 24px;
  }

  .page-title { font-size: 24px; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; }
  .page-subtitle { font-size: 13px; color: #475569; margin-bottom: 32px; }

  /* ── CARD ── */
  .card {
    background: #161b27;
    border: 1px solid #1e2a3d;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
  }

  .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }

  .card-icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .card-icon.blue { background: #1e3a5f; }
  .card-icon.green { background: #14532d; }
  .card-icon svg { width: 18px; height: 18px; }

  .card-header-text h3 { font-size: 15px; font-weight: 600; color: #e2e8f0; }
  .card-header-text p { font-size: 12px; color: #475569; margin-top: 2px; }

  /* ── FORM ── */
  .field { margin-bottom: 0; }
  .field label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 6px;
  }

  .input-wrap { position: relative; }

  .input-wrap input {
    width: 100%;
    background: #0f1117;
    border: 1px solid #1e2a3d;
    border-radius: 8px;
    padding: 11px 40px 11px 14px;
    font-size: 14px;
    color: #e2e8f0;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
  }

  .input-wrap input:focus { border-color: #3b82f6; }

  .input-hint {
    position: absolute;
    right: 12px; top: 50%;
    transform: translateY(-50%);
    color: #475569;
    font-size: 13px;
    cursor: help;
  }

  .help-text { font-size: 11px; color: #475569; margin-top: 6px; line-height: 1.5; }

  .form-row { display: flex; gap: 12px; align-items: flex-end; }
  .form-row .field { flex: 1; }

  .btn-save {
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 11px 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    font-family: inherit;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .btn-save:hover { background: #2563eb; }
  .btn-save:disabled { background: #1e2a3d; color: #475569; cursor: not-allowed; }

  .divider { border: none; border-top: 1px solid #1e2a3d; margin: 20px 0; }

  .actions-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .btn-reload {
    background: #14532d;
    color: #4ade80;
    border: 1px solid #166534;
    border-radius: 8px;
    padding: 9px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .btn-reload:hover { background: #166534; }
  .btn-reload:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-reload svg { width: 14px; height: 14px; fill: #4ade80; transition: transform 0.5s; }
  .btn-reload.spinning svg { animation: spin 1s linear infinite; }

  .last-reload-text { font-size: 12px; color: #475569; }
  .last-reload-text span { color: #94a3b8; font-weight: 500; }

  /* ── STATUS GRID ── */
  .status-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 4px;
  }

  .status-item {
    background: #0f1117;
    border: 1px solid #1e2a3d;
    border-radius: 8px;
    padding: 12px 14px;
  }

  .status-label { font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
  .status-value { font-size: 13px; font-weight: 600; color: #e2e8f0; }

  .dot {
    display: inline-block;
    width: 7px; height: 7px;
    border-radius: 50%;
    margin-right: 6px;
  }
  .dot-green { background: #4ade80; box-shadow: 0 0 6px #4ade80; }
  .dot-red   { background: #f87171; }
  .dot-gray  { background: #475569; }

  /* ── INFO BOX ── */
  .info-box {
    background: #0f1e38;
    border: 1px solid #1e3a5f;
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 12px;
    color: #93c5fd;
    line-height: 1.6;
    margin-top: 16px;
  }

  .info-box strong { color: #bfdbfe; }

  code {
    background: #0f1117;
    border: 1px solid #1e2a3d;
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 11px;
    color: #7dd3fc;
    font-family: 'Courier New', monospace;
  }

  /* ── TOAST ── */
  .toast {
    position: fixed;
    bottom: 24px; right: 24px;
    background: #161b27;
    border: 1px solid #1e2a3d;
    border-radius: 10px;
    padding: 12px 18px;
    font-size: 13px;
    color: #e2e8f0;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    gap: 8px;
    transform: translateY(80px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 999;
  }

  .toast.show   { transform: translateY(0); opacity: 1; }
  .toast.success { border-color: #166534; }
  .toast.error   { border-color: #7f1d1d; }

  .toast-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .toast.success .toast-dot { background: #4ade80; }
  .toast.error   .toast-dot { background: #f87171; }
`;

class EasydomoticaPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._state = "loading";   // loading | authorized | denied
    this._username = "";
  }

  connectedCallback() {
    this._render();
    this._checkAuth();
  }

  // Recupera il token HA dal localStorage del browser (standard HA)
  _getHAToken() {
    try {
      const raw = localStorage.getItem("hassTokens");
      if (!raw) return null;
      const tokens = JSON.parse(raw);
      return tokens.access_token || null;
    } catch (_) {
      return null;
    }
  }

  async _checkAuth() {
    const token = this._getHAToken();
    if (!token) {
      this._state = "denied";
      this._username = "(nessun token)";
      this._render();
      return;
    }

    try {
      const res = await fetch("/api/easydomotica/whoami", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        this._state = "denied";
        this._username = "(non autenticato)";
        this._render();
        return;
      }

      const data = await res.json();
      this._username = data.username || "sconosciuto";

      if (data.authorized) {
        this._state = "authorized";
        this._render();
        this._loadData();
      } else {
        this._state = "denied";
        this._render();
      }
    } catch (e) {
      this._state = "denied";
      this._username = "(errore di rete)";
      this._render();
    }
  }

  _render() {
    const shadow = this.shadowRoot;
    shadow.innerHTML = `
      <style>${STYLES}</style>
      <div class="panel" id="panel">
        ${this._state === "loading"    ? this._renderLoading()    : ""}
        ${this._state === "denied"     ? this._renderDenied()     : ""}
        ${this._state === "authorized" ? this._renderMain()       : ""}
      </div>
      <div class="toast" id="toast">
        <div class="toast-dot"></div>
        <span id="toast-msg"></span>
      </div>
    `;
    if (this._state === "authorized") this._bindEvents();
  }

  _renderLoading() {
    return `
      <div class="loading-wrap">
        <div class="spinner"></div>
        <div class="loading-text">Verifica accesso…</div>
      </div>
    `;
  }

  _renderDenied() {
    return `
      <div class="denied-wrap">
        <div class="denied-card">
          <div class="denied-icon">
            <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>
          </div>
          <h2>Accesso riservato</h2>
          <p>
            Questo pannello è accessibile solo all'utente<br/>
            <code>easydomotica</code> di Home Assistant.
          </p>
          <div class="denied-user">
            Hai effettuato l'accesso come: <span>${this._username}</span>
          </div>
        </div>
      </div>
    `;
  }

  _renderMain() {
    return `
      <div class="topbar">
        <div class="topbar-left">
          <div class="topbar-logo">
            <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          </div>
          <span class="topbar-title">Easydomotica</span>
          <span class="topbar-badge">Admin</span>
        </div>
        <div class="topbar-user">
          <div class="topbar-user-dot"></div>
          <span>Connesso come <strong>${this._username}</strong></span>
        </div>
      </div>

      <div class="content">
        <div class="page-title">Gestione Sistema</div>
        <div class="page-subtitle">Configurazione e controllo delle integrazioni Home Assistant</div>

        <!-- SmartThings -->
        <div class="card">
          <div class="card-header">
            <div class="card-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07"/>
              </svg>
            </div>
            <div class="card-header-text">
              <h3>SmartThings — Reload automatico</h3>
              <p>Ricarica l'integrazione ogni 10 minuti per mantenere la sincronizzazione</p>
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>ID Config Entry SmartThings</label>
              <div class="input-wrap">
                <input type="text" id="st-entry-id"
                  placeholder="es. a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"/>
                <span class="input-hint" title="Impostazioni → Integrazioni → SmartThings → ⋮ → Info">?</span>
              </div>
              <div class="help-text">
                Vai in <strong>Impostazioni → Dispositivi e Servizi → SmartThings → ⋮ → Info</strong>
                e copia l'ID mostrato nell'URL.
              </div>
            </div>
            <button class="btn-save" id="btn-save-st">Salva</button>
          </div>

          <div class="info-box">
            <strong>Come trovare l'ID:</strong> Apri HA → Impostazioni → Dispositivi e Servizi →
            SmartThings → clicca i tre puntini → Info. L'URL conterrà l'<code>entry_id</code>
            oppure lo trovi in <code>.storage/core.config_entries</code>.
          </div>

          <hr class="divider"/>

          <div class="actions-row">
            <div class="last-reload-text">
              Ultimo reload: <span id="last-reload-text">—</span>
            </div>
            <button class="btn-reload" id="btn-reload-now">
              <svg viewBox="0 0 24 24">
                <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8
                  c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6
                  6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              Reload manuale
            </button>
          </div>
        </div>

        <!-- Stato -->
        <div class="card">
          <div class="card-header">
            <div class="card-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div class="card-header-text">
              <h3>Stato sistema</h3>
              <p>Monitoraggio in tempo reale dell'integrazione SmartThings</p>
            </div>
          </div>
          <div class="status-grid">
            <div class="status-item">
              <div class="status-label">Reload auto</div>
              <div class="status-value" id="st-reload-status">—</div>
            </div>
            <div class="status-item">
              <div class="status-label">Entry trovata</div>
              <div class="status-value" id="st-entry-found">—</div>
            </div>
            <div class="status-item">
              <div class="status-label">Intervallo</div>
              <div class="status-value">10 min</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    const s = this.shadowRoot;
    s.getElementById("btn-save-st")?.addEventListener("click", () => this._saveSmartThings());
    s.getElementById("btn-reload-now")?.addEventListener("click", () => this._manualReload());
  }

  _getAuthHeaders() {
    const token = this._getHAToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async _loadData() {
    try {
      const [cfgRes, statusRes] = await Promise.all([
        fetch("/api/easydomotica/config",  { headers: this._getAuthHeaders() }),
        fetch("/api/easydomotica/status",  { headers: this._getAuthHeaders() }),
      ]);

      const cfg    = await cfgRes.json();
      const status = await statusRes.json();
      const s      = this.shadowRoot;

      const input = s.getElementById("st-entry-id");
      if (input) input.value = cfg.smartthings_entry_id || "";

      const lastEl = s.getElementById("last-reload-text");
      if (lastEl) {
        lastEl.textContent = cfg.last_reload
          ? new Date(cfg.last_reload).toLocaleString("it-IT")
          : "Mai";
      }

      const reloadEl = s.getElementById("st-reload-status");
      if (reloadEl) {
        reloadEl.innerHTML = cfg.reload_active
          ? `<span class="dot dot-green"></span>Attivo`
          : `<span class="dot dot-gray"></span>Inattivo`;
      }

      const foundEl = s.getElementById("st-entry-found");
      if (foundEl) {
        foundEl.innerHTML = status.entry_found
          ? `<span class="dot dot-green"></span>Sì`
          : cfg.smartthings_entry_id
            ? `<span class="dot dot-red"></span>Non trovata`
            : `<span class="dot dot-gray"></span>Non impostato`;
      }
    } catch (e) {
      console.error("Easydomotica: errore caricamento dati", e);
    }
  }

  async _saveSmartThings() {
    const s      = this.shadowRoot;
    const entryId = s.getElementById("st-entry-id").value.trim();
    const btn    = s.getElementById("btn-save-st");

    btn.disabled    = true;
    btn.textContent = "Salvataggio…";

    try {
      const res = await fetch("/api/easydomotica/config", {
        method: "POST",
        headers: this._getAuthHeaders(),
        body: JSON.stringify({ smartthings_entry_id: entryId }),
      });

      if (res.ok) {
        this._showToast("Configurazione salvata!", "success");
        await this._loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        this._showToast(err.error || "Errore nel salvataggio", "error");
      }
    } catch (e) {
      this._showToast("Errore di connessione", "error");
    } finally {
      btn.disabled    = false;
      btn.textContent = "Salva";
    }
  }

  async _manualReload() {
    const s   = this.shadowRoot;
    const btn = s.getElementById("btn-reload-now");
    btn.classList.add("spinning");
    btn.disabled = true;

    try {
      const res  = await fetch("/api/easydomotica/reload", {
        method: "POST",
        headers: this._getAuthHeaders(),
      });
      const data = await res.json();

      if (data.success) {
        this._showToast("SmartThings ricaricato con successo!", "success");
        await this._loadData();
      } else {
        this._showToast(data.error || "Errore nel reload", "error");
      }
    } catch (e) {
      this._showToast("Errore di connessione", "error");
    } finally {
      btn.classList.remove("spinning");
      btn.disabled = false;
    }
  }

  _showToast(msg, type = "success") {
    const toast = this.shadowRoot.getElementById("toast");
    const msgEl = this.shadowRoot.getElementById("toast-msg");
    toast.className = `toast ${type} show`;
    msgEl.textContent = msg;
    setTimeout(() => toast.classList.remove("show"), 3200);
  }
}

customElements.define("easydomotica-panel", EasydomoticaPanel);
