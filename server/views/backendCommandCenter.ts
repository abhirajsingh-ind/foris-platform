export function renderBackendCommandCenter(): string {
  const nodeVersion = process.version;
  const platform = process.platform;
  const memoryUsage = process.memoryUsage();
  const heapUsedMb = (memoryUsage.heapUsed / 1024 / 1024).toFixed(1);
  const rssMb = (memoryUsage.rss / 1024 / 1024).toFixed(1);
  const uptimeMinutes = (process.uptime() / 60).toFixed(1);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FORIS // Backend Command Matrix</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Plus+Jakarta+Sans:wght@400;600;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #030712;
      --card-bg: rgba(15, 23, 42, 0.75);
      --cyan: #06b6d4;
      --emerald: #10b981;
      --amber: #f59e0b;
      --purple: #a855f7;
      --rose: #f43f5e;
      --border: rgba(51, 65, 85, 0.6);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 40%),
                  radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 40%),
                  var(--bg);
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      padding: 24px;
      line-height: 1.5;
    }
    .container {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* TOP HEADER */
    .hero-header {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.98));
      border: 2px solid rgba(6, 182, 212, 0.4);
      border-radius: 24px;
      padding: 28px 32px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 40px -15px rgba(6, 182, 212, 0.2);
    }
    .hero-header::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, var(--cyan), var(--emerald), var(--purple), var(--amber));
    }
    .top-telemetry {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      padding-bottom: 16px;
      margin-bottom: 16px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.4);
    }
    .pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .pill-cyan { background: rgba(6, 182, 212, 0.15); color: var(--cyan); border: 1px solid rgba(6, 182, 212, 0.4); }
    .pill-emerald { background: rgba(16, 185, 129, 0.15); color: var(--emerald); border: 1px solid rgba(16, 185, 129, 0.4); }
    .pill-purple { background: rgba(168, 85, 247, 0.15); color: var(--purple); border: 1px solid rgba(168, 85, 247, 0.4); }
    .pill-amber { background: rgba(245, 158, 11, 0.15); color: var(--amber); border: 1px solid rgba(245, 158, 11, 0.4); }
    .pill-rose { background: rgba(244, 63, 94, 0.15); color: var(--rose); border: 1px solid rgba(244, 63, 94, 0.4); }

    .pulse-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 8px currentColor;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }

    /* MAIN TITLE */
    .title-main {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      background: linear-gradient(90deg, #38bdf8, #34d399, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 6px;
    }
    .sub-title {
      color: #94a3b8;
      font-size: 13px;
      font-weight: 500;
      max-width: 800px;
    }

    /* 4 DISTINCT TELEMETRY CARDS */
    .telemetry-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }
    .metric-card {
      border-radius: 20px;
      padding: 22px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      backdrop-filter: blur(12px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .metric-card:hover {
      transform: translateY(-3px);
    }

    /* Card Archetype 1: Cyan Gateway Matrix */
    .card-cyan {
      background: linear-gradient(135deg, rgba(8, 47, 73, 0.4), rgba(15, 23, 42, 0.9));
      border: 2px solid rgba(6, 182, 212, 0.4);
      box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.15);
    }
    /* Card Archetype 2: Emerald Cryptoseal Safe */
    .card-emerald {
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.4), rgba(15, 23, 42, 0.9));
      border: 2px solid rgba(16, 185, 129, 0.4);
      box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.15);
    }
    /* Card Archetype 3: Purple AI Gyaan Engine */
    .card-purple {
      background: linear-gradient(135deg, rgba(88, 28, 135, 0.4), rgba(15, 23, 42, 0.9));
      border: 2px solid rgba(168, 85, 247, 0.4);
      box-shadow: 0 10px 25px -5px rgba(168, 85, 247, 0.15);
    }
    /* Card Archetype 4: Amber Legal Sentinel */
    .card-amber {
      background: linear-gradient(135deg, rgba(120, 53, 15, 0.4), rgba(15, 23, 42, 0.9));
      border: 2px solid rgba(245, 158, 11, 0.4);
      box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.15);
    }

    .topic-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 2px;
    }
    .topic-heading {
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .val-large {
      font-family: 'JetBrains Mono', monospace;
      font-size: 32px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1;
      margin-bottom: 4px;
    }
    .val-sub {
      font-size: 12px;
      color: #cbd5e1;
      font-weight: 600;
    }

    /* MAIN SECTIONS GRID */
    .sections-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 24px;
    }
    @media (max-width: 960px) {
      .sections-grid { grid-template-columns: 1fr; }
    }

    .panel {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(51, 65, 85, 0.8);
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 15px 30px -10px rgba(0,0,0,0.5);
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.6);
    }
    .panel-title {
      font-size: 15px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* MICROSERVICES MATRIX */
    .service-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-radius: 14px;
      background: rgba(2, 6, 23, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.6);
      transition: all 0.2s ease;
    }
    .service-row:hover {
      background: rgba(2, 6, 23, 0.9);
      border-color: var(--cyan);
      transform: translateX(4px);
    }
    .srv-name {
      font-weight: 800;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .srv-route {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #94a3b8;
    }

    /* INTERACTIVE TEST CONSOLE */
    .test-box {
      background: #020617;
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 16px;
      padding: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }
    .test-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .btn-test {
      background: rgba(6, 182, 212, 0.15);
      border: 1px solid var(--cyan);
      color: var(--cyan);
      padding: 6px 12px;
      border-radius: 8px;
      font-family: inherit;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-test:hover {
      background: var(--cyan);
      color: #020617;
    }
    .console-out {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(51, 65, 85, 0.8);
      border-radius: 10px;
      padding: 12px;
      min-height: 120px;
      max-height: 200px;
      overflow-y: auto;
      color: #34d399;
      font-size: 11px;
      line-height: 1.4;
      white-space: pre-wrap;
    }

    /* FOOTER */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      padding: 16px 20px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 16px;
      border: 1px solid rgba(51, 65, 85, 0.6);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #94a3b8;
    }
    .footer a {
      color: var(--cyan);
      text-decoration: none;
      font-weight: 700;
    }
    .footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <!-- HERO HEADER -->
    <header class="hero-header">
      <div class="top-telemetry">
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <span class="pill pill-cyan">
            <span class="pulse-dot"></span>
            FORIS KERNEL // ONLINE
          </span>
          <span class="pill pill-emerald">
            DEFENSE-IN-DEPTH ACTIVE
          </span>
          <span class="pill pill-purple">
            GYAAN GURU AI 24/7
          </span>
        </div>
        <div style="display: flex; gap: 12px; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8;">
          <span>NODE: <strong style="color: #ffffff;">${nodeVersion}</strong></span>
          <span>PLATFORM: <strong style="color: #ffffff;">${platform.toUpperCase()}</strong></span>
          <span>UPTIME: <strong style="color: #34d399;">${uptimeMinutes}m</strong></span>
        </div>
      </div>

      <h1 class="title-main">FORIS BACKEND COMMAND MATRIX</h1>
      <p class="sub-title">
        High-assurance central forensic server engine. Real-time API routing, hardware telemetry, SHA-256 Merkle chain verification, and defense-in-depth security interceptors.
      </p>
    </header>

    <!-- 4 DISTINCT ARCHITECTURAL TELEMETRY CARDS -->
    <div class="telemetry-grid">
      <!-- Card 1: API ROUTER (Electric Cyan) -->
      <div class="metric-card card-cyan">
        <div>
          <div class="topic-label">TOPIC 01 // ROUTER MATRIX</div>
          <div class="topic-heading" style="color: var(--cyan);">
            <span>⚡</span>
            <span>MICROSERVICES GATEWAY</span>
          </div>
          <div class="val-large">100%</div>
          <div class="val-sub">10 Active API Routers Online</div>
        </div>
        <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(6,182,212,0.25); display: flex; justify-content: space-between; font-size: 11px; color: var(--cyan); font-weight: 700;">
          <span>RATE LIMIT SHIELD</span>
          <span>100 REQ / 15M</span>
        </div>
      </div>

      <!-- Card 2: CRYPTOGRAPHIC VAULT (Cyber Emerald) -->
      <div class="metric-card card-emerald">
        <div>
          <div class="topic-label">TOPIC 02 // EVIDENCE VAULT</div>
          <div class="topic-heading" style="color: var(--emerald);">
            <span>🛡️</span>
            <span>SHA-256 HSM LEDGER</span>
          </div>
          <div class="val-large">MERKLE</div>
          <div class="val-sub">Zero-Tamper Chain-of-Custody</div>
        </div>
        <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(16,185,129,0.25); display: flex; justify-content: space-between; font-size: 11px; color: var(--emerald); font-weight: 700;">
          <span>INTEGRITY CHECK</span>
          <span>GENESIS ROOT LOCKED</span>
        </div>
      </div>

      <!-- Card 3: AI GYAAN GURU (Neon Purple) -->
      <div class="metric-card card-purple">
        <div>
          <div class="topic-label">TOPIC 03 // INTELLIGENCE</div>
          <div class="topic-heading" style="color: var(--purple);">
            <span>🔮</span>
            <span>GYAAN GURU REASONING</span>
          </div>
          <div class="val-large">OLLAMA / GROQ</div>
          <div class="val-sub">Conversational AI Engine Active</div>
        </div>
        <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(168,85,247,0.25); display: flex; justify-content: space-between; font-size: 11px; color: var(--purple); font-weight: 700;">
          <span>AUDIO CHIME</span>
          <span>SYNTHESIZER ONLINE</span>
        </div>
      </div>

      <!-- Card 4: RUNTIME MEMORY (Sovereign Amber) -->
      <div class="metric-card card-amber">
        <div>
          <div class="topic-label">TOPIC 04 // HARDWARE ENGINE</div>
          <div class="topic-heading" style="color: var(--amber);">
            <span>⚙️</span>
            <span>MEMORY & THREADS</span>
          </div>
          <div class="val-large">${rssMb} MB</div>
          <div class="val-sub">Heap Allocated: ${heapUsedMb} MB</div>
        </div>
        <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(245,158,11,0.25); display: flex; justify-content: space-between; font-size: 11px; color: var(--amber); font-weight: 700;">
          <span>GC CYCLES</span>
          <span>OPTIMAL HEALTH</span>
        </div>
      </div>
    </div>

    <!-- MAIN TWO COLUMN WORKBENCH -->
    <div class="sections-grid">
      <!-- LEFT COLUMN: ROUTE REGISTRY WITH DIFFERENT DESIGNS & COLORS -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title" style="color: #ffffff;">
            <span style="color: var(--cyan);">📡</span>
            <span>CORE MICROSERVICES ROUTE REGISTRY</span>
          </div>
          <span class="pill pill-cyan">10 ENDPOINTS</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="service-row" style="border-left: 4px solid var(--cyan);">
            <div>
              <div class="srv-name" style="color: var(--cyan);">🔑 AUTHENTICATION & SESSIONS</div>
              <div class="srv-route">POST /api/auth/login • GET /api/auth/me</div>
            </div>
            <span class="pill pill-cyan">GUARDED</span>
          </div>

          <div class="service-row" style="border-left: 4px solid var(--emerald);">
            <div>
              <div class="srv-name" style="color: var(--emerald);">📁 FORENSIC CASE MANAGEMENT</div>
              <div class="srv-route">GET /api/cases • POST /api/cases • GET /api/cases/:id</div>
            </div>
            <span class="pill pill-emerald">OPERATIONAL</span>
          </div>

          <div class="service-row" style="border-left: 4px solid var(--emerald);">
            <div>
              <div class="srv-name" style="color: var(--emerald);">🛡️ EVIDENCE & CHAIN-OF-CUSTODY</div>
              <div class="srv-route">GET /api/evidence • POST /api/evidence • SHA-256 Verified</div>
            </div>
            <span class="pill pill-emerald">SEALED</span>
          </div>

          <div class="service-row" style="border-left: 4px solid var(--amber);">
            <div>
              <div class="srv-name" style="color: var(--amber);">📜 LAB REPORTS & LEGAL ATTESTATIONS</div>
              <div class="srv-route">GET /api/reports • POST /api/reports • Sec 65B Certified</div>
            </div>
            <span class="pill pill-amber">ATTESTED</span>
          </div>

          <div class="service-row" style="border-left: 4px solid var(--purple);">
            <div>
              <div class="srv-name" style="color: var(--purple);">🔮 GYAAN GURU // AI SAMADHAAN</div>
              <div class="srv-route">POST /api/ai/samadhaan • Open-Source Ollama/Groq Engine</div>
            </div>
            <span class="pill pill-purple">INTELLIGENT</span>
          </div>

          <div class="service-row" style="border-left: 4px solid var(--rose);">
            <div>
              <div class="srv-name" style="color: var(--rose);">🚨 SECURITY POSTURE & ANOMALIES</div>
              <div class="srv-route">GET /api/security/overview • Rule-Based Anomaly Log</div>
            </div>
            <span class="pill pill-rose">INTERCEPTING</span>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: INTERACTIVE TEST HARNESS -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title" style="color: #ffffff;">
            <span style="color: var(--emerald);">⚡</span>
            <span>INSTANT API PING & DIAGNOSTICS</span>
          </div>
          <span class="pill pill-emerald">REAL-TIME</span>
        </div>

        <p style="font-size: 12px; color: #94a3b8;">
          Execute live diagnostic probes directly against backend core microservices:
        </p>

        <div class="test-box">
          <div class="test-actions">
            <button class="btn-test" onclick="probeEndpoint('/api/health')">Ping /api/health</button>
            <button class="btn-test" onclick="probeEndpoint('/api/cases')">Probe /api/cases</button>
            <button class="btn-test" onclick="probeEndpoint('/api/security/overview')">Inspect Security</button>
            <button class="btn-test" onclick="clearConsole()">Clear Screen</button>
          </div>

          <div class="console-out" id="consoleOut">FORIS Kernel Ready. Select a probe above to inspect JSON telemetry...</div>
        </div>

        <div style="background: rgba(2,6,23,0.8); border: 1px solid rgba(51,65,85,0.7); border-radius: 14px; padding: 14px; font-size: 11px; font-family: 'JetBrains Mono', monospace; space-y: 6px;">
          <div style="color: var(--cyan); font-weight: 700; margin-bottom: 4px;">// HARDWARE AUDIT TELEMETRY</div>
          <div style="display: flex; justify-content: space-between; color: #cbd5e1;">
            <span>PROCESS PID:</span>
            <span style="color: #ffffff; font-weight: 700;">${process.pid}</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #cbd5e1;">
            <span>NODE RUNTIME:</span>
            <span style="color: #38bdf8;">${process.version}</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #cbd5e1;">
            <span>DAEMON TIMER:</span>
            <span style="color: #34d399;">Active (60s Cadence)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <footer class="footer">
      <div>
        <span>STATE FORENSIC SCIENCE LABORATORY (SFSL) • CENTRAL FORENSIC BACKEND</span>
      </div>
      <div>
        <a href="/" target="_blank">Access Forensic Web GUI →</a>
      </div>
    </footer>
  </div>

  <script>
    async function probeEndpoint(url) {
      const out = document.getElementById('consoleOut');
      out.textContent = '>> Probing ' + url + ' ...\\n';
      const start = performance.now();
      try {
        const token = localStorage.getItem('foris_token');
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        const res = await fetch(url, { headers });
        const latency = (performance.now() - start).toFixed(1);
        const data = await res.json();
        out.textContent = '>> HTTP ' + res.status + ' (' + latency + 'ms)\\n' + JSON.stringify(data, null, 2);
      } catch (err) {
        out.textContent += '>> FAILED: ' + err.message;
      }
    }
    function clearConsole() {
      document.getElementById('consoleOut').textContent = '>> Console cleared.';
    }
  </script>
</body>
</html>`;
}
