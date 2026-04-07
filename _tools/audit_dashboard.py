#!/usr/bin/env python3
"""
audit_dashboard.py — Local web dashboard for accuracy audit results.

Reads reference_matrix.json and summary.json, serves an interactive
dashboard at http://localhost:8787.

Usage:
    python3 _tools/audit_dashboard.py              # Start on port 8787
    python3 _tools/audit_dashboard.py --port 9000   # Custom port
"""

import argparse
import json
import os
import sys

# Ensure stdout can handle UTF-8 (needed on Windows where cp1252 is default)
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from collections import Counter, defaultdict

ROOT = Path(__file__).resolve().parent.parent
AUDIT_DIR = ROOT / "_tools" / "audit"
MATRIX_PATH = AUDIT_DIR / "reference_matrix.json"
SUMMARY_PATH = AUDIT_DIR / "summary.json"


def load_json(path):
    if path.exists():
        return json.load(open(path, encoding='utf-8'))
    return {}


def build_dashboard_data():
    """Build all dashboard data from the matrix and summary files."""
    matrix = load_json(MATRIX_PATH)
    summary = load_json(SUMMARY_PATH)
    claims = matrix.get("claims", {})

    # ── Book scores ──
    book_scores = {}
    book_claims = defaultdict(list)
    for cid, c in claims.items():
        book_claims[c["book_dir"]].append(c)

    for book, cls in book_claims.items():
        total = len(cls)
        by_status = Counter(c["status"] for c in cls)
        by_type = defaultdict(lambda: {"total": 0, "verified": 0, "skipped": 0, "flagged": 0, "refuted": 0, "unverified": 0})
        for c in cls:
            by_type[c["claim_type"]]["total"] += 1
            by_type[c["claim_type"]][c["status"].lower()] += 1

        book_scores[book] = {
            "total": total,
            "by_status": dict(by_status),
            "by_type": {k: dict(v) for k, v in by_type.items()},
        }

    # ── Scholar breakdown ──
    scholar_stats = defaultdict(lambda: {"total": 0, "verified": 0, "flagged": 0, "refuted": 0, "unverified": 0, "skipped": 0})
    for c in claims.values():
        if c["claim_type"] == "scholar_attribution" and c.get("source_attribution"):
            scholar = c["source_attribution"]
            scholar_stats[scholar]["total"] += 1
            scholar_stats[scholar][c["status"].lower()] += 1

    # ── Flagged + Refuted claims ──
    flagged = []
    refuted = []
    for cid, c in claims.items():
        if c["status"] == "FLAGGED":
            flagged.append({"id": cid, **c})
        elif c["status"] == "REFUTED":
            refuted.append({"id": cid, **c})

    # ── Chapter-level data ──
    chapter_data = defaultdict(lambda: {"total": 0, "verified": 0, "skipped": 0, "flagged": 0, "refuted": 0, "unverified": 0})
    for c in claims.values():
        key = f"{c['book_dir']}|{c.get('chapter_id', '?')}"
        chapter_data[key]["total"] += 1
        chapter_data[key][c["status"].lower()] += 1

    return {
        "metadata": matrix.get("metadata", {}),
        "summary": summary,
        "corpus_stats": matrix.get("metadata", {}).get("corpus_stats", {}),
        "book_scores": book_scores,
        "scholar_stats": dict(scholar_stats),
        "flagged": flagged,
        "refuted": refuted,
        "chapter_data": dict(chapter_data),
        "total_claims": len(claims),
    }


DASHBOARD_HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Companion Study — Accuracy Audit</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Source+Sans+3:wght@300;400;600;700&display=swap');

  :root {
    --bg: #1a1710;
    --elev: #252015;
    --elev2: #2e2818;
    --gold: #bfa050;
    --gold-dim: rgba(191,160,80,0.15);
    --gold-glow: rgba(191,160,80,0.08);
    --text: #e8dcc8;
    --dim: #c8baa8;
    --muted: #908878;
    --green: #5cb85c;
    --red: #e06050;
    --blue: #70b8e8;
    --orange: #e8a040;
    --radius: 8px;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Source Sans 3', sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.5;
    min-height: 100vh;
  }

  /* ── Header ── */
  .header {
    background: linear-gradient(135deg, var(--elev) 0%, var(--bg) 100%);
    border-bottom: 2px solid var(--gold);
    padding: 28px 32px 22px;
  }
  .header-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .header-bar { width: 5px; height: 40px; background: var(--gold); border-radius: 2px; flex-shrink: 0; }
  .header h1 {
    font-family: 'Cinzel', serif;
    font-size: 22px;
    color: var(--gold);
    letter-spacing: 1.5px;
  }
  .header-sub { color: var(--muted); font-size: 13px; margin-left: auto; }

  /* ── Layout ── */
  .container { max-width: 1400px; margin: 0 auto; padding: 24px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }

  @media (max-width: 900px) {
    .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  }

  /* ── Cards ── */
  .card {
    background: var(--elev);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: var(--radius);
    padding: 20px;
  }
  .card-gold { border-color: rgba(191,160,80,0.2); }
  .card-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  /* ── Stat boxes ── */
  .stat-box { text-align: center; padding: 16px 12px; }
  .stat-value { font-size: 32px; font-weight: 700; line-height: 1.1; }
  .stat-label { font-size: 11px; color: var(--muted); margin-top: 4px; }
  .stat-green { color: var(--green); }
  .stat-red { color: var(--red); }
  .stat-gold { color: var(--gold); }
  .stat-blue { color: var(--blue); }
  .stat-orange { color: var(--orange); }
  .stat-muted { color: var(--muted); }

  /* ── Progress bar ── */
  .progress-bar {
    height: 6px;
    background: rgba(255,255,255,0.05);
    border-radius: 3px;
    overflow: hidden;
    display: flex;
    margin: 8px 0;
  }
  .progress-seg { height: 100%; transition: width 0.3s; }

  /* ── Tables ── */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--muted);
    text-transform: uppercase;
    text-align: left;
    padding: 8px 10px;
    border-bottom: 1px solid rgba(191,160,80,0.15);
    background: var(--gold-glow);
  }
  th.num { text-align: right; }
  td {
    padding: 7px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.03);
    color: var(--dim);
  }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  tr:hover td { background: rgba(255,255,255,0.02); }
  tr.clickable { cursor: pointer; }
  tr.clickable:hover td { background: var(--gold-glow); }

  /* ── Badges ── */
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  .badge-verified { background: rgba(92,184,92,0.15); color: var(--green); }
  .badge-flagged { background: rgba(232,160,64,0.15); color: var(--orange); }
  .badge-refuted { background: rgba(224,96,80,0.15); color: var(--red); }
  .badge-unverified { background: rgba(144,136,120,0.1); color: var(--muted); }
  .badge-skipped { background: rgba(112,184,232,0.1); color: var(--blue); }

  .badge-grade {
    display: inline-block; padding: 2px 10px; border-radius: 4px;
    font-size: 12px; font-weight: 700; font-family: 'Cinzel', serif;
  }
  .grade-A { background: rgba(92,184,92,0.15); color: var(--green); }
  .grade-B { background: rgba(191,160,80,0.15); color: var(--gold); }
  .grade-C { background: rgba(232,160,64,0.15); color: var(--orange); }
  .grade-D { background: rgba(224,96,80,0.15); color: var(--red); }

  /* ── Sections ── */
  .section { margin-bottom: 24px; }
  .section-title {
    font-family: 'Cinzel', serif;
    font-size: 15px;
    color: var(--gold);
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(191,160,80,0.15);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-title .count {
    font-family: 'Source Sans 3', sans-serif;
    font-size: 11px;
    color: var(--muted);
    font-weight: 400;
  }

  /* ── Claims list ── */
  .claim-item {
    background: var(--elev);
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: var(--radius);
    padding: 14px 16px;
    margin-bottom: 8px;
  }
  .claim-item.refuted { border-left: 3px solid var(--red); }
  .claim-item.flagged { border-left: 3px solid var(--orange); }
  .claim-id { font-size: 11px; color: var(--muted); font-family: monospace; }
  .claim-type { font-size: 10px; color: var(--blue); margin-left: 8px; }
  .claim-text { font-size: 13px; color: var(--dim); margin: 6px 0; line-height: 1.6; }
  .claim-notes { font-size: 12px; color: var(--orange); margin-top: 4px; }
  .claim-fix { font-size: 12px; color: var(--green); margin-top: 4px; }
  .claim-source { font-size: 11px; color: var(--muted); font-style: italic; }

  /* ── Tabs ── */
  .tabs { display: flex; gap: 2px; margin-bottom: 20px; border-bottom: 1px solid rgba(191,160,80,0.1); }
  .tab {
    padding: 10px 20px;
    border: none;
    background: transparent;
    color: var(--muted);
    font-family: 'Source Sans 3', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }
  .tab:hover { color: var(--dim); }
  .tab.active {
    color: var(--gold);
    border-bottom-color: var(--gold);
    background: var(--gold-glow);
  }

  .tab-content { display: none; }
  .tab-content.active { display: block; }

  /* ── Heatmap cells ── */
  .heat-cell {
    width: 100%;
    height: 28px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s;
  }
  .heat-cell:hover { transform: scale(1.05); }

  /* ── Book grid ── */
  .book-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
  }
  .book-card {
    background: var(--elev);
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: var(--radius);
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .book-card:hover { border-color: var(--gold); background: var(--elev2); }
  .book-card.selected { border-color: var(--gold); background: var(--gold-glow); }
  .book-name { font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .book-stats { font-size: 10px; color: var(--muted); }

  /* ── Empty state ── */
  .empty {
    text-align: center;
    padding: 60px 20px;
    color: var(--muted);
    font-size: 14px;
  }
  .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.3; }

  /* ── Back link ── */
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--gold);
    font-size: 12px;
    cursor: pointer;
    margin-bottom: 12px;
    opacity: 0.8;
  }
  .back-link:hover { opacity: 1; }

  /* ── Loading ── */
  .loading { text-align: center; padding: 80px; color: var(--muted); }
  @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
  .loading-dot { animation: pulse 1.5s infinite; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--muted); border-radius: 3px; }
</style>
</head>
<body>

<div class="header">
  <div class="header-inner">
    <div class="header-bar"></div>
    <h1>Accuracy Audit</h1>
    <span class="header-sub" id="lastUpdated"></span>
  </div>
</div>

<div class="container">
  <div class="tabs">
    <button class="tab active" onclick="showTab('overview')">Overview</button>
    <button class="tab" onclick="showTab('books')">Books</button>
    <button class="tab" onclick="showTab('scholars')">Scholars</button>
    <button class="tab" onclick="showTab('issues')">Issues</button>
  </div>

  <!-- ═══ OVERVIEW ═══ -->
  <div id="tab-overview" class="tab-content active"></div>

  <!-- ═══ BOOKS ═══ -->
  <div id="tab-books" class="tab-content"></div>

  <!-- ═══ SCHOLARS ═══ -->
  <div id="tab-scholars" class="tab-content"></div>

  <!-- ═══ ISSUES ═══ -->
  <div id="tab-issues" class="tab-content"></div>
</div>

<script>
let DATA = null;

async function init() {
  try {
    const resp = await fetch('/api/data');
    DATA = await resp.json();
    document.getElementById('lastUpdated').textContent =
      DATA.metadata?.last_updated ? 'Updated: ' + new Date(DATA.metadata.last_updated).toLocaleDateString() : '';
    renderOverview();
    renderBooks();
    renderScholars();
    renderIssues();
  } catch (e) {
    document.querySelector('.container').innerHTML =
      '<div class="empty"><div class="empty-icon">⚠</div>Failed to load audit data.<br>Run: python3 _tools/accuracy_auditor.py --book genesis --tier 1</div>';
  }
}

function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  event.target.classList.add('active');
}

function fmt(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n/1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function pct(n, total) { return total > 0 ? ((n/total)*100).toFixed(1) : '0.0'; }

function gradeFor(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  return 'D';
}

function gradeClass(grade) {
  if (grade.startsWith('A')) return 'grade-A';
  if (grade.startsWith('B')) return 'grade-B';
  if (grade.startsWith('C')) return 'grade-C';
  return 'grade-D';
}

function statusColor(status) {
  const map = { VERIFIED: '#5cb85c', SKIPPED: '#70b8e8', FLAGGED: '#e8a040', REFUTED: '#e06050', UNVERIFIED: '#908878' };
  return map[status] || '#908878';
}

function bookTitle(id) { return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

function progressBar(byStatus, total) {
  const order = ['VERIFIED','SKIPPED','FLAGGED','REFUTED','UNVERIFIED'];
  let html = '<div class="progress-bar">';
  for (const s of order) {
    const n = byStatus[s] || 0;
    if (n > 0) {
      html += '<div class="progress-seg" style="width:' + pct(n,total) + '%;background:' + statusColor(s) + '"></div>';
    }
  }
  return html + '</div>';
}

function tierScore(byStatus, total) {
  if (total === 0) return 100;
  const passing = (byStatus.VERIFIED||0) + (byStatus.SKIPPED||0);
  return (passing / total) * 100;
}

// ═══ OVERVIEW ═══
function renderOverview() {
  const cs = DATA.corpus_stats || {};
  const bs = cs.by_status || {};
  const total = DATA.total_claims || 0;
  
  // New three-metric calculation
  const verified = bs.VERIFIED || 0;
  const skipped = bs.SKIPPED || 0;
  const flagged = bs.FLAGGED || 0;
  const refuted = bs.REFUTED || 0;
  const unverified = bs.UNVERIFIED || 0;
  
  const checked = verified + skipped + flagged + refuted;
  const passing = verified + skipped;
  
  // Three key metrics
  const verifiedPct = checked > 0 ? (passing / checked * 100) : 0;
  const coveragePct = total > 0 ? (checked / total * 100) : 0;
  const refutedCount = refuted;

  let html = '';

  // New three-metric header
  html += '<div class="card card-gold" style="margin-bottom:16px">';
  html += '<div style="display:flex;justify-content:space-around;text-align:center;padding:8px 0">';
  
  // Verified %
  html += '<div>';
  html += '<div style="font-size:36px;font-weight:700;color:var(--green)">' + verifiedPct.toFixed(1) + '%</div>';
  html += '<div style="font-size:11px;color:var(--muted)">Verified Accuracy</div>';
  html += '<div style="font-size:9px;color:var(--dim)">of checked claims</div>';
  html += '</div>';
  
  // Coverage %
  html += '<div>';
  html += '<div style="font-size:36px;font-weight:700;color:var(--gold)">' + coveragePct.toFixed(1) + '%</div>';
  html += '<div style="font-size:11px;color:var(--muted)">Coverage</div>';
  html += '<div style="font-size:9px;color:var(--dim)">claims checked</div>';
  html += '</div>';
  
  // Refuted count
  const refColor = refutedCount > 100 ? 'red' : refutedCount > 0 ? 'orange' : 'green';
  html += '<div>';
  html += '<div style="font-size:36px;font-weight:700;color:var(--' + refColor + ')">' + fmt(refutedCount) + '</div>';
  html += '<div style="font-size:11px;color:var(--muted)">Refuted</div>';
  html += '<div style="font-size:9px;color:var(--dim)">need fixing</div>';
  html += '</div>';
  
  html += '</div></div>';

  // Status breakdown
  html += '<div class="grid-4" style="margin-bottom:16px">';
  html += statBox(fmt(total), 'Total Claims', 'gold');
  html += statBox(fmt(checked), 'Checked', 'blue');
  html += statBox(fmt(passing), 'Passing', 'green');
  html += statBox(fmt(flagged), 'Flagged', 'orange');
  html += '</div>';

  // Progress bar
  html += '<div class="card" style="margin-bottom:16px">';
  html += progressBar(bs, total);
  html += '<div style="display:flex;gap:16px;margin-top:6px;flex-wrap:wrap">';
  for (const [s,c] of [['VERIFIED','green'],['SKIPPED','blue'],['FLAGGED','orange'],['REFUTED','red'],['UNVERIFIED','muted']]) {
    const n = bs[s]||0;
    if (n > 0) html += '<span style="font-size:10px;color:var(--'+c+')">&#9679; '+s+': '+fmt(n)+' ('+pct(n,total)+'%)</span>';
  }
  html += '</div></div>';

  // By claim type
  const bt = cs.by_type || {};
  html += '<div class="card" style="margin-bottom:16px"><div class="card-title">By Claim Type</div>';
  html += '<table><tr><th>Type</th><th class="num">Total</th><th class="num">Verified</th><th class="num">Flagged</th><th class="num">Refuted</th><th class="num">Unverified</th><th style="width:200px">Distribution</th></tr>';
  const typeWeights = {scholar_attribution:30,hebrew_greek:20,cross_reference:15,historical:15,timeline:10,people_places:10};
  for (const [type, w] of Object.entries(typeWeights)) {
    const td = bt[type] || {};
    const t = td.total || 0;
    if (t === 0) continue;
    html += '<tr>';
    html += '<td style="font-weight:600">' + type.replace(/_/g,' ') + ' <span style="color:var(--muted);font-size:10px">(' + w + '%)</span></td>';
    html += '<td class="num">' + fmt(t) + '</td>';
    html += '<td class="num" style="color:var(--green)">' + fmt(td.VERIFIED||0) + '</td>';
    html += '<td class="num" style="color:var(--orange)">' + fmt(td.FLAGGED||0) + '</td>';
    html += '<td class="num" style="color:var(--red)">' + fmt(td.REFUTED||0) + '</td>';
    html += '<td class="num" style="color:var(--muted)">' + fmt(td.UNVERIFIED||0) + '</td>';
    html += '<td>' + progressBar(td, t) + '</td>';
    html += '</tr>';
  }
  html += '</table></div>';

  // Tier breakdown
  html += '<div class="card"><div class="card-title">Verification Tier Coverage</div>';
  html += '<div style="font-size:12px;color:var(--dim);line-height:1.8">';
  html += '<div style="display:flex;gap:24px;flex-wrap:wrap">';
  const tierCounts = {0:0,1:0,2:0,3:0};
  // Count from claims data indirectly via status
  const skipped = bs.SKIPPED||0;
  const verifiedN = bs.VERIFIED||0;
  const unverifiedN = bs.UNVERIFIED||0;
  html += tierBadge('T0+T1', verifiedN + skipped, 'Local checks complete', 'green');
  html += tierBadge('T2', 0, 'Needs API key', 'muted');
  html += tierBadge('T3', 0, 'Needs API key + web search', 'muted');
  html += '</div></div></div>';

  document.getElementById('tab-overview').innerHTML = html;
}

function statBox(value, label, color) {
  return '<div class="card stat-box"><div class="stat-value stat-'+color+'">'+value+'</div><div class="stat-label">'+label+'</div></div>';
}

function tierBadge(label, count, desc, color) {
  return '<div style="flex:1;min-width:200px;padding:12px;background:var(--gold-glow);border-radius:6px;text-align:center">' +
    '<div style="font-size:18px;font-weight:700;color:var(--'+color+')">' + label + '</div>' +
    '<div style="font-size:11px;color:var(--muted)">' + desc + '</div>' +
    (count > 0 ? '<div style="font-size:12px;color:var(--'+color+');margin-top:4px">' + fmt(count) + ' claims resolved</div>' : '') +
    '</div>';
}

// ═══ BOOKS ═══
function renderBooks() {
  const books = DATA.book_scores || {};
  const bookList = Object.keys(books).sort();

  let html = '<div class="section"><div class="section-title">Book Accuracy <span class="count">' + bookList.length + ' books audited</span></div>';

  html += '<div class="table-wrap"><table>';
  html += '<tr><th>Book</th><th class="num">Claims</th><th class="num">Verified</th><th class="num">Skipped</th><th class="num">Flagged</th><th class="num">Refuted</th><th class="num">Unverified</th><th style="width:180px">Status</th></tr>';

  for (const book of bookList) {
    const b = books[book];
    const bs = b.by_status || {};
    const t = b.total || 0;
    html += '<tr class="clickable" onclick="drillBook(\'' + book + '\')">';
    html += '<td style="font-weight:600;color:var(--text)">' + bookTitle(book) + '</td>';
    html += '<td class="num">' + t + '</td>';
    html += '<td class="num" style="color:var(--green)">' + (bs.VERIFIED||0) + '</td>';
    html += '<td class="num" style="color:var(--blue)">' + (bs.SKIPPED||0) + '</td>';
    html += '<td class="num" style="color:var(--orange)">' + (bs.FLAGGED||0) + '</td>';
    html += '<td class="num" style="color:var(--red)">' + (bs.REFUTED||0) + '</td>';
    html += '<td class="num" style="color:var(--muted)">' + (bs.UNVERIFIED||0) + '</td>';
    html += '<td>' + progressBar(bs, t) + '</td>';
    html += '</tr>';
  }
  html += '</table></div></div>';

  // Drill-down area
  html += '<div id="book-detail"></div>';

  document.getElementById('tab-books').innerHTML = html;
}

function drillBook(book) {
  const chapters = DATA.chapter_data || {};
  const relevant = {};
  for (const [key, val] of Object.entries(chapters)) {
    const [b, chId] = key.split('|');
    if (b === book) relevant[chId] = val;
  }

  let html = '<div class="back-link" onclick="document.getElementById(\'book-detail\').innerHTML=\'\'">← Back to all books</div>';
  html += '<div class="card"><div class="card-title">' + bookTitle(book) + ' — Chapter Detail</div>';
  html += '<table><tr><th>Chapter</th><th class="num">Claims</th><th class="num">Verified</th><th class="num">Skipped</th><th class="num">Flagged</th><th class="num">Refuted</th><th class="num">Unverified</th><th style="width:150px">Status</th></tr>';

  const sorted = Object.entries(relevant).sort((a,b) => {
    const na = parseInt(a[0].replace(/\D/g,'')) || 0;
    const nb = parseInt(b[0].replace(/\D/g,'')) || 0;
    return na - nb;
  });

  for (const [chId, ch] of sorted) {
    const t = ch.total || 0;
    html += '<tr>';
    html += '<td style="font-weight:600">' + chId + '</td>';
    html += '<td class="num">' + t + '</td>';
    html += '<td class="num" style="color:var(--green)">' + (ch.verified||0) + '</td>';
    html += '<td class="num" style="color:var(--blue)">' + (ch.skipped||0) + '</td>';
    html += '<td class="num" style="color:var(--orange)">' + (ch.flagged||0) + '</td>';
    html += '<td class="num" style="color:var(--red)">' + (ch.refuted||0) + '</td>';
    html += '<td class="num" style="color:var(--muted)">' + (ch.unverified||0) + '</td>';
    html += '<td>' + progressBar({VERIFIED:ch.verified||0,SKIPPED:ch.skipped||0,FLAGGED:ch.flagged||0,REFUTED:ch.refuted||0,UNVERIFIED:ch.unverified||0}, t) + '</td>';
    html += '</tr>';
  }
  html += '</table></div>';

  document.getElementById('book-detail').innerHTML = html;
  document.getElementById('book-detail').scrollIntoView({ behavior: 'smooth' });
}

// ═══ SCHOLARS ═══
function renderScholars() {
  const scholars = DATA.scholar_stats || {};
  const sorted = Object.entries(scholars).sort((a,b) => b[1].total - a[1].total);

  let html = '<div class="section"><div class="section-title">Scholar Attribution Accuracy <span class="count">' + sorted.length + ' scholars</span></div>';

  if (sorted.length === 0) {
    html += '<div class="empty"><div class="empty-icon">📚</div>No scholar attribution data yet.</div>';
  } else {
    html += '<table><tr><th>Scholar / Source</th><th class="num">Claims</th><th class="num">Verified</th><th class="num">Flagged</th><th class="num">Refuted</th><th class="num">Unverified</th><th style="width:180px">Status</th></tr>';

    for (const [name, s] of sorted) {
      const t = s.total || 0;
      const bs = {VERIFIED:s.verified||0,SKIPPED:s.skipped||0,FLAGGED:s.flagged||0,REFUTED:s.refuted||0,UNVERIFIED:s.unverified||0};
      html += '<tr>';
      html += '<td style="font-weight:600;color:var(--text)">' + escHtml(name) + '</td>';
      html += '<td class="num">' + t + '</td>';
      html += '<td class="num" style="color:var(--green)">' + (s.verified||0) + '</td>';
      html += '<td class="num" style="color:var(--orange)">' + (s.flagged||0) + '</td>';
      html += '<td class="num" style="color:var(--red)">' + (s.refuted||0) + '</td>';
      html += '<td class="num" style="color:var(--muted)">' + (s.unverified||0) + '</td>';
      html += '<td>' + progressBar(bs, t) + '</td>';
      html += '</tr>';
    }
    html += '</table>';
  }
  html += '</div>';

  document.getElementById('tab-scholars').innerHTML = html;
}

// ═══ ISSUES ═══
function renderIssues() {
  const refuted = DATA.refuted || [];
  const flagged = DATA.flagged || [];

  let html = '';

  // Refuted
  html += '<div class="section"><div class="section-title" style="color:var(--red)">Refuted Claims <span class="count">' + refuted.length + '</span></div>';
  if (refuted.length === 0) {
    html += '<div class="card" style="text-align:center;color:var(--green);padding:24px">No refuted claims found.</div>';
  } else {
    for (const c of refuted) {
      html += claimCard(c, 'refuted');
    }
  }
  html += '</div>';

  // Flagged
  html += '<div class="section"><div class="section-title" style="color:var(--orange)">Flagged Claims <span class="count">' + flagged.length + '</span></div>';
  if (flagged.length === 0) {
    html += '<div class="card" style="text-align:center;color:var(--green);padding:24px">No flagged claims.</div>';
  } else {
    for (const c of flagged.slice(0, 100)) {
      html += claimCard(c, 'flagged');
    }
    if (flagged.length > 100) {
      html += '<div style="text-align:center;color:var(--muted);padding:12px;font-size:12px">Showing 100 of ' + flagged.length + ' flagged claims</div>';
    }
  }
  html += '</div>';

  document.getElementById('tab-issues').innerHTML = html;
}

function claimCard(c, type) {
  let html = '<div class="claim-item ' + type + '">';
  html += '<div><span class="claim-id">' + escHtml(c.id) + '</span>';
  html += '<span class="claim-type">' + c.claim_type.replace(/_/g,' ') + '</span>';
  html += ' <span class="badge badge-' + type + '">' + c.status + '</span></div>';
  if (c.source_attribution) {
    html += '<div class="claim-source">Source: ' + escHtml(c.source_attribution) + '</div>';
  }
  html += '<div class="claim-text">' + escHtml(truncate(c.claim_text, 300)) + '</div>';
  if (c.notes) html += '<div class="claim-notes">⚠ ' + escHtml(c.notes) + '</div>';
  if (c.fix_suggestion) html += '<div class="claim-fix">✓ Fix: ' + escHtml(c.fix_suggestion) + '</div>';
  html += '</div>';
  return html;
}

function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function truncate(s, n) {
  if (!s || s.length <= n) return s;
  return s.substring(0, n) + '…';
}

init();
</script>
</body>
</html>"""


class DashboardHandler(BaseHTTPRequestHandler):
    """HTTP request handler for the audit dashboard."""

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/" or path == "/index.html":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(DASHBOARD_HTML.encode("utf-8"))

        elif path == "/api/data":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            data = build_dashboard_data()
            self.wfile.write(json.dumps(data).encode("utf-8"))

        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Suppress default request logging
        pass


def main():
    parser = argparse.ArgumentParser(description="Accuracy audit dashboard")
    parser.add_argument("--port", type=int, default=8787, help="Port (default 8787)")
    parser.add_argument("--no-open", action="store_true", help="Don't open browser")
    args = parser.parse_args()

    if not MATRIX_PATH.exists():
        print(f"No audit data found at {MATRIX_PATH}")
        print(f"Run: python3 _tools/accuracy_auditor.py --book genesis --tier 1")
        sys.exit(1)

    server = HTTPServer(("0.0.0.0", args.port), DashboardHandler)
    url = f"http://localhost:{args.port}"
    print(f"═══ Accuracy Audit Dashboard ═══")
    print(f"  Serving at {url}")
    print(f"  Data: {MATRIX_PATH.relative_to(ROOT)}")
    print(f"  Press Ctrl+C to stop")

    if not args.no_open:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
