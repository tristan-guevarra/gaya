/* ═══════════════════════════════════════════════════════════════════
   Gaya — API Playground
   Interactive API testing console with endpoint explorer,
   request builder, response viewer, code generation, and
   authentication helpers.
   ═══════════════════════════════════════════════════════════════════ */

'use client';

import { useState } from 'react';
import {
  Play, Code, Copy, Check, ChevronRight, ChevronDown,
  Globe, Lock, Key, Clock, Zap, BookOpen, Terminal,
  AlertTriangle, CheckCircle, Loader2, RotateCcw, Braces
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────

interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  category: string;
  auth: boolean;
  params?: { name: string; type: string; required: boolean; description: string }[];
  body?: string;
  exampleResponse: string;
  statusCode: number;
  latency: number;
}

// ─── Endpoint Catalog ───────────────────────────────────────────

const ENDPOINTS: Endpoint[] = [
  // Discovery
  { id: 'e1', method: 'GET', path: '/api/v1/map/listings', description: 'Search listings with geo filters', category: 'Discovery', auth: false,
    params: [
      { name: 'lat', type: 'number', required: true, description: 'Latitude center' },
      { name: 'lng', type: 'number', required: true, description: 'Longitude center' },
      { name: 'radius_km', type: 'number', required: false, description: 'Search radius (default: 10)' },
      { name: 'type', type: 'string', required: false, description: 'camp | clinic | private' },
      { name: 'age_min', type: 'number', required: false, description: 'Minimum age' },
      { name: 'age_max', type: 'number', required: false, description: 'Maximum age' },
    ],
    exampleResponse: JSON.stringify({
      data: [
        { id: "evt_12345", type: "camp", title: "Spring Elite Camp", coach: { name: "Marcus Thompson", rating: 4.97 }, location: { lat: 43.7615, lng: -79.2195, zone: "Scarborough East" }, price: 349, capacity: 40, filled: 37, dates: { start: "2026-04-14", end: "2026-04-18" } },
        { id: "evt_12346", type: "clinic", title: "Speed & Agility Clinic", coach: { name: "Sarah Chen", rating: 4.94 }, location: { lat: 43.7731, lng: -79.3416, zone: "North York" }, price: 199, capacity: 20, filled: 18, dates: { start: "2026-04-20", end: "2026-04-20" } }
      ],
      meta: { total: 47, page: 1, per_page: 20, radius_km: 10 }
    }, null, 2), statusCode: 200, latency: 124
  },
  { id: 'e2', method: 'GET', path: '/api/v1/coaches/{id}', description: 'Get coach profile with stats', category: 'Discovery', auth: false,
    params: [{ name: 'id', type: 'string', required: true, description: 'Coach UUID' }],
    exampleResponse: JSON.stringify({
      id: "coach_abc123", name: "Marcus Thompson", title: "Elite Youth Development Coach", rating: 4.97, reviews_count: 234, verified: true, zones: ["Scarborough East", "North York"], specialties: ["Technical Skills", "Goalkeeping"], events_active: 5, fill_rate_avg: 0.98, tier: "legend", xp: 84200
    }, null, 2), statusCode: 200, latency: 87
  },
  // Intelligence
  { id: 'e3', method: 'GET', path: '/api/v1/intelligence/zones', description: 'Get all zone metrics with scores', category: 'Intelligence', auth: true,
    params: [
      { name: 'min_score', type: 'number', required: false, description: 'Filter by min opportunity score' },
      { name: 'sort_by', type: 'string', required: false, description: 'opportunity_score | demand | supply' },
    ],
    exampleResponse: JSON.stringify({
      zones: [
        { h3_index: "882a91", name: "Scarborough East", opportunity_score: 92, demand_index: 87, supply_index: 34, coaches_active: 4, leads_30d: 156, fill_rate_avg: 0.91, trend: "rising" },
        { h3_index: "882a92", name: "Brampton North", opportunity_score: 87, demand_index: 78, supply_index: 29, coaches_active: 2, leads_30d: 98, fill_rate_avg: 0.85, trend: "rising" }
      ],
      meta: { total_zones: 48, avg_score: 64 }
    }, null, 2), statusCode: 200, latency: 234
  },
  { id: 'e4', method: 'GET', path: '/api/v1/intelligence/heatmap', description: 'Get GeoJSON heatmap for map overlay', category: 'Intelligence', auth: true,
    params: [
      { name: 'layer', type: 'string', required: true, description: 'supply | demand | underserved | hotspot' },
      { name: 'resolution', type: 'number', required: false, description: 'H3 resolution (7-9, default: 8)' },
    ],
    exampleResponse: JSON.stringify({
      type: "FeatureCollection",
      features: [
        { type: "Feature", geometry: { type: "Polygon", coordinates: [[[/* hex vertices */]]] }, properties: { h3_index: "882a91", score: 0.92, demand: 87, supply: 34 } }
      ]
    }, null, 2), statusCode: 200, latency: 456
  },
  // ML / Simulator
  { id: 'e5', method: 'POST', path: '/api/v1/simulator/predict', description: 'Predict fill rate for a proposed event', category: 'ML / Simulator', auth: true,
    body: JSON.stringify({ zone: "882a91", event_type: "camp", capacity: 40, price: 299, duration_days: 5, start_date: "2026-07-07", age_range: [8, 14] }, null, 2),
    exampleResponse: JSON.stringify({
      prediction: { fill_rate: 0.94, confidence: 0.87, revenue_estimate: 11254, fill_timeline: [{ week: 1, projected: 12 }, { week: 2, projected: 24 }, { week: 3, projected: 34 }, { week: 4, projected: 38 }] },
      factors: [
        { name: "Zone demand", impact: 0.32, direction: "positive" },
        { name: "Price competitiveness", impact: 0.24, direction: "positive" },
        { name: "Seasonal timing", impact: 0.18, direction: "positive" },
        { name: "Supply saturation", impact: -0.08, direction: "negative" }
      ],
      recommendations: ["Consider starting July 7 for optimal timing", "Price at $299 hits the sweet spot for this zone"]
    }, null, 2), statusCode: 200, latency: 892
  },
  // Auth
  { id: 'e6', method: 'POST', path: '/api/v1/auth/login', description: 'Authenticate and get JWT tokens', category: 'Auth', auth: false,
    body: JSON.stringify({ email: "coach@example.com", password: "••••••••" }, null, 2),
    exampleResponse: JSON.stringify({
      access_token: "eyJhbGciOiJIUzI1NiIs...", refresh_token: "eyJhbGciOiJIUzI1NiIs...", token_type: "bearer", expires_in: 3600, user: { id: "usr_abc123", email: "coach@example.com", role: "org_admin", org_id: "org_xyz" }
    }, null, 2), statusCode: 200, latency: 156
  },
  // Leads
  { id: 'e7', method: 'POST', path: '/api/v1/leads', description: 'Submit a new lead / waitlist request', category: 'Leads', auth: false,
    body: JSON.stringify({ name: "Jennifer Park", email: "jennifer@email.com", event_id: "evt_12345", type: "camp", child_age: 12, message: "Interested in summer camp", location: { lat: 43.76, lng: -79.22 } }, null, 2),
    exampleResponse: JSON.stringify({
      id: "lead_789", status: "new", created_at: "2026-03-01T10:30:00Z", confirmation_sent: true
    }, null, 2), statusCode: 201, latency: 98
  },
];

// ─── Method Badge ───────────────────────────────────────────────

const METHOD_STYLES: Record<string, string> = {
  GET: 'bg-green-500/15 text-green-400 border-green-500/20',
  POST: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  PUT: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  DELETE: 'bg-red-500/15 text-red-400 border-red-500/20',
  PATCH: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

// ─── Code Generators ────────────────────────────────────────────

function generateCurl(endpoint: Endpoint): string {
  let cmd = `curl -X ${endpoint.method}`;
  if (endpoint.auth) cmd += ` \\\n  -H "Authorization: Bearer YOUR_API_KEY"`;
  cmd += ` \\\n  -H "Content-Type: application/json"`;
  if (endpoint.body) cmd += ` \\\n  -d '${endpoint.body.replace(/\n/g, '').replace(/\s+/g, ' ')}'`;
  cmd += ` \\\n  "https://api.gaya.app${endpoint.path}"`;
  return cmd;
}

function generatePython(endpoint: Endpoint): string {
  let code = `import requests\n\n`;
  if (endpoint.auth) code += `headers = {"Authorization": "Bearer YOUR_API_KEY"}\n`;
  if (endpoint.method === 'GET') {
    code += `response = requests.get(\n    "https://api.gaya.app${endpoint.path}",\n`;
    if (endpoint.auth) code += `    headers=headers,\n`;
    code += `)\n`;
  } else {
    code += `payload = ${endpoint.body || '{}'}\n\nresponse = requests.${endpoint.method.toLowerCase()}(\n    "https://api.gaya.app${endpoint.path}",\n`;
    if (endpoint.auth) code += `    headers=headers,\n`;
    code += `    json=payload,\n)\n`;
  }
  code += `\nprint(response.json())`;
  return code;
}

function generateJS(endpoint: Endpoint): string {
  let code = `const response = await fetch(\n  "https://api.gaya.app${endpoint.path}",\n  {\n    method: "${endpoint.method}",\n    headers: {\n      "Content-Type": "application/json",\n`;
  if (endpoint.auth) code += `      "Authorization": "Bearer YOUR_API_KEY",\n`;
  code += `    },\n`;
  if (endpoint.body) code += `    body: JSON.stringify(${endpoint.body.replace(/\n/g, '').replace(/\s+/g, ' ')}),\n`;
  code += `  }\n);\n\nconst data = await response.json();\nconsole.log(data);`;
  return code;
}

// ─── Page Component ─────────────────────────────────────────────

export default function APIPlaygroundPage() {
  const [selected, setSelected] = useState<Endpoint>(ENDPOINTS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [codeLang, setCodeLang] = useState<'curl' | 'python' | 'javascript'>('curl');
  const [copied, setCopied] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string>('Discovery');

  const categories = Array.from(new Set(ENDPOINTS.map(e => e.category)));

  const handleRun = () => {
    setIsRunning(true);
    setShowResponse(false);
    setTimeout(() => {
      setIsRunning(false);
      setShowResponse(true);
    }, selected.latency);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippet = codeLang === 'curl' ? generateCurl(selected) : codeLang === 'python' ? generatePython(selected) : generateJS(selected);

  return (
    <div className="min-h-screen flex">
      {/* ═══ Sidebar: Endpoint Explorer ═══ */}
      <div className="w-72 shrink-0 border-r border-slate-200 bg-slate-50/30 overflow-y-auto">
        <div className="px-4 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-4 h-4 text-atlas-400" />
            <span className="text-sm font-display font-semibold text-text-primary">API Explorer</span>
          </div>
          <p className="text-[10px] text-text-muted">v1.0 · 7 endpoints</p>
        </div>

        {categories.map(cat => (
          <div key={cat}>
            <button onClick={() => setExpandedCat(expandedCat === cat ? '' : cat)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider hover:bg-slate-50">
              {cat}
              <ChevronDown className={cn('w-3 h-3 transition-transform', expandedCat === cat && 'rotate-180')} />
            </button>
            {expandedCat === cat && ENDPOINTS.filter(e => e.category === cat).map(ep => (
              <button key={ep.id} onClick={() => { setSelected(ep); setShowResponse(false); }}
                className={cn('w-full flex items-center gap-2 px-4 py-2 text-left transition-colors',
                  selected.id === ep.id ? 'bg-slate-50 border-l-2 border-atlas-500' : 'hover:bg-slate-50 border-l-2 border-transparent')}>
                <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border', METHOD_STYLES[ep.method])}>
                  {ep.method}
                </span>
                <span className="text-xs text-text-secondary truncate flex-1 font-mono">{ep.path.split('/').pop()}</span>
                {ep.auth && <Lock className="w-3 h-3 text-text-muted/40" />}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 overflow-y-auto">
        {/* Endpoint Header */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <span className={cn('px-2 py-1 rounded-lg text-xs font-mono font-bold border', METHOD_STYLES[selected.method])}>
              {selected.method}
            </span>
            <code className="text-base font-mono text-text-primary">{selected.path}</code>
            {selected.auth && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400">
                <Lock className="w-3 h-3" /> Auth Required
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted">{selected.description}</p>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Parameters */}
          {selected.params && selected.params.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Parameters</h3>
              <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-slate-200 bg-slate-50 text-[10px] font-medium text-text-muted uppercase tracking-wider">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Required</div>
                  <div className="col-span-5">Description</div>
                </div>
                {selected.params.map(param => (
                  <div key={param.name} className="grid grid-cols-12 gap-4 px-4 py-2.5 border-b border-slate-200 last:border-0">
                    <div className="col-span-3"><code className="text-xs text-atlas-400 font-mono">{param.name}</code></div>
                    <div className="col-span-2"><span className="text-xs text-text-muted font-mono">{param.type}</span></div>
                    <div className="col-span-2">
                      {param.required
                        ? <span className="text-[10px] text-red-400 font-medium">required</span>
                        : <span className="text-[10px] text-text-muted">optional</span>}
                    </div>
                    <div className="col-span-5"><span className="text-xs text-text-muted">{param.description}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Body */}
          {selected.body && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Request Body</h3>
              <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 p-4 overflow-auto">
                <pre className="text-xs font-mono text-text-secondary whitespace-pre">{selected.body}</pre>
              </div>
            </div>
          )}

          {/* Run Button */}
          <div className="flex items-center gap-3">
            <button onClick={handleRun} disabled={isRunning}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-atlas-500 text-white text-sm font-bold hover:bg-atlas-400 transition-all disabled:opacity-50 shadow-lg shadow-atlas-500/20">
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Running...' : 'Send Request'}
            </button>
            {showResponse && (
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle className="w-3.5 h-3.5" /> {selected.statusCode}</span>
                <span className="flex items-center gap-1 text-xs text-text-muted"><Clock className="w-3.5 h-3.5" /> {selected.latency}ms</span>
              </div>
            )}
          </div>

          {/* Response */}
          {showResponse && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">Response</h3>
                <button onClick={() => handleCopy(selected.exampleResponse)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100/50 text-text-muted text-xs">
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 p-4 max-h-96 overflow-auto">
                <pre className="text-xs font-mono text-text-secondary whitespace-pre">{selected.exampleResponse}</pre>
              </div>
            </div>
          )}

          {/* Code Snippets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">Code Snippet</h3>
              <div className="flex gap-1 p-0.5 rounded-lg bg-white/40 border border-white/60">
                {(['curl', 'python', 'javascript'] as const).map(lang => (
                  <button key={lang} onClick={() => setCodeLang(lang)}
                    className={cn('px-2.5 py-1 rounded-md text-[10px] font-medium transition-all',
                      codeLang === lang ? 'bg-slate-100 text-text-primary' : 'text-text-muted hover:text-text-secondary')}>
                    {lang === 'javascript' ? 'JS' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-lg shadow-blue-900/5 p-4 overflow-auto">
              <button onClick={() => handleCopy(codeSnippet)}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100/50 text-text-muted">
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <pre className="text-xs font-mono text-text-secondary whitespace-pre">{codeSnippet}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
