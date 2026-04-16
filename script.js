const form = document.getElementById('analyze-form');
const postText = document.getElementById('postText');
const charCount = document.getElementById('char-count');
const analyzeBtn = document.getElementById('analyze-btn');
const spinner = document.getElementById('spinner');
const btnText = document.getElementById('btn-text');
const errorBanner = document.getElementById('error-banner');
const emptyState = document.getElementById('empty-state');
const results = document.getElementById('results');

const overallScore = document.getElementById('overall-score');
const toneSummary = document.getElementById('tone-summary');
const emotionalImpact = document.getElementById('emotional-impact');
const riskFlags = document.getElementById('risk-flags');
const culturalNotes = document.getElementById('cultural-notes');
const engagementLevel = document.getElementById('engagement-level');
const engagementWhy = document.getElementById('engagement-why');
const rewriteList = document.getElementById('rewrite-list');

const API_BASE = 'http://localhost:4000';

postText.addEventListener('input', () => {
  charCount.textContent = `${postText.value.length} / 4000`;
});

function setLoading(isLoading) {
  analyzeBtn.disabled = isLoading;
  spinner.classList.toggle('hidden', !isLoading);
  btnText.textContent = isLoading ? 'Analyzing...' : 'Analyze Post';
}

function clearError() {
  errorBanner.classList.add('hidden');
  errorBanner.textContent = '';
}

function showError(message) {
  errorBanner.classList.remove('hidden');
  errorBanner.textContent = message;
}

function riskBadgeClass(severity) {
  if (severity === 'high') return 'bg-rose-100 text-rose-700';
  if (severity === 'medium') return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
}

function buildRewriteCard(title, text) {
  const wrapper = document.createElement('div');
  wrapper.className = 'rounded-lg border border-slate-200 p-3';

  const heading = document.createElement('div');
  heading.className = 'flex items-center justify-between gap-2';

  const h4 = document.createElement('h4');
  h4.className = 'font-medium text-sm';
  h4.textContent = title;

  const copyBtn = document.createElement('button');
  copyBtn.className = 'text-xs font-semibold text-violet-700 hover:text-violet-900';
  copyBtn.textContent = 'Use this rewrite';
  copyBtn.type = 'button';
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text || '');
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Use this rewrite'), 1200);
    } catch {
      copyBtn.textContent = 'Copy failed';
      setTimeout(() => (copyBtn.textContent = 'Use this rewrite'), 1200);
    }
  });

  const p = document.createElement('p');
  p.className = 'mt-2 text-sm text-slate-700';
  p.textContent = text || '—';

  heading.appendChild(h4);
  heading.appendChild(copyBtn);
  wrapper.appendChild(heading);
  wrapper.appendChild(p);

  return wrapper;
}

function renderAnalysis(data) {
  emptyState.classList.add('hidden');
  results.classList.remove('hidden');

  overallScore.textContent = `${data.overallScore ?? '--'}/100`;
  toneSummary.textContent = data.toneSummary || 'No tone summary available.';

  emotionalImpact.innerHTML = '';
  (data.emotionalImpact || []).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    emotionalImpact.appendChild(li);
  });

  riskFlags.innerHTML = '';
  (data.misinterpretationRisks || []).forEach(risk => {
    const row = document.createElement('div');
    row.className = 'rounded-lg border border-slate-200 p-3';

    const badge = document.createElement('span');
    badge.className = `inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${riskBadgeClass(risk.severity)}`;
    badge.textContent = (risk.severity || 'low').toUpperCase();

    const riskText = document.createElement('p');
    riskText.className = 'mt-2 text-sm font-medium';
    riskText.textContent = risk.risk || 'Potential misinterpretation risk.';

    const rationale = document.createElement('p');
    rationale.className = 'mt-1 text-sm text-slate-600';
    rationale.textContent = risk.rationale || '';

    row.appendChild(badge);
    row.appendChild(riskText);
    row.appendChild(rationale);
    riskFlags.appendChild(row);
  });

  culturalNotes.innerHTML = '';
  (data.culturalSensitivityNotes || []).forEach(note => {
    const li = document.createElement('li');
    li.textContent = note;
    culturalNotes.appendChild(li);
  });

  const level = data.engagementPrediction?.level || 'unknown';
  engagementLevel.textContent = `Level: ${String(level).toUpperCase()}`;
  engagementLevel.className = 'text-sm font-medium ' + (
    level === 'high' ? 'text-emerald-700' : level === 'medium' ? 'text-amber-700' : 'text-slate-700'
  );
  engagementWhy.textContent = data.engagementPrediction?.why || '';

  rewriteList.innerHTML = '';
  rewriteList.appendChild(buildRewriteCard('Safer rewrite', data.safeRewrite));
  rewriteList.appendChild(buildRewriteCard('More engaging rewrite', data.engagingRewrite));
  rewriteList.appendChild(buildRewriteCard('Professional rewrite', data.professionalRewrite));
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();

  const payload = {
    platform: document.getElementById('platform').value,
    goal: document.getElementById('goal').value,
    audience: document.getElementById('audience').value.trim(),
    postText: postText.value.trim(),
  };

  if (!payload.postText) {
    showError('Please enter your draft post before analyzing.');
    return;
  }

  setLoading(true);
  try {
    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || `Request failed (${response.status})`);
    }

    renderAnalysis(result);
  } catch (error) {
    showError(error.message || 'Something went wrong while analyzing your post.');
  } finally {
    setLoading(false);
  }
});
