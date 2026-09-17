import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'openai/gpt-oss-20b';

// ─── Security: block private/internal IP ranges (SSRF protection) ─────────────
const BLOCKED_PATTERNS = [
  /^https?:\/\/localhost/i,
  /^https?:\/\/127\./,
  /^https?:\/\/0\.0\.0\.0/,
  /^https?:\/\/10\./,
  /^https?:\/\/192\.168\./,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\./,
  /^https?:\/\/169\.254\./,          // AWS metadata endpoint
  /^https?:\/\/::1/,                 // IPv6 loopback
];

function isBlockedUrl(url) {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(url));
}

// ─── Security: max steps per chain to prevent abuse ──────────────────────────
const MAX_STEPS = 8;

// ─── Helper: resolve {{stepN.field.nested}} placeholders in strings ───────────
function resolvePlaceholders(value, context) {
  if (typeof value === 'string') {
    return value.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
      const parts = path.split('.');
      let current = context;
      for (const part of parts) {
        if (current == null) return match;
        current = current[part];
      }
      return current !== undefined ? current : match;
    });
  }
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) return value.map((v) => resolvePlaceholders(v, context));
    const resolved = {};
    for (const [k, v] of Object.entries(value)) {
      resolved[k] = resolvePlaceholders(v, context);
    }
    return resolved;
  }
  return value;
}

// ─── Helper: extract a nested value from an object using a dot-path ──────────
function extractByPath(obj, path) {
  if (!path) return undefined;
  const parts = path.split('.');
  if (parts[0] === 'response') parts.shift();
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

// ─── PLAN: generate step list from natural language goal ─────────────────────
export const planChain = async (req, res) => {
  try {
    const { goal, baseUrl } = req.body;
    if (!goal || !goal.trim()) {
      return res.status(400).json({ error: 'Goal description is required' });
    }

    const systemPrompt = `You are an expert API automation planner.
Convert the user's natural language goal into a sequence of HTTP API steps.

Return ONLY a JSON object matching this exact schema:
{
  "steps": [
    {
      "stepNumber": 1,
      "description": "Clear explanation of what this step does",
      "method": "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
      "url": "full URL (e.g. https://api.example.com/users) or relative path (/users)",
      "headers": { "Header-Name": "Header-Value" },
      "body": null or JSON object payload,
      "extract": {
        "variableName": "path in response JSON to extract, e.g. token or user.id"
      }
    }
  ]
}

Rules:
1. Always return a JSON object with a "steps" array.
2. If the user mentions a domain like "youtube.com" without protocol, use "https://youtube.com".
3. To reference a value extracted from a previous step, use {{stepN.variableName}}.
4. Keep the steps minimal, focused, and directly addressing the user's goal.
5. Base URL context: ${baseUrl || 'None provided. Use full URLs.'}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: goal },
      ],
      model: MODEL,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    let parsed = {};
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse Groq response:', raw);
    }

    let steps = [];
    if (Array.isArray(parsed)) {
      steps = parsed;
    } else if (Array.isArray(parsed.steps)) {
      steps = parsed.steps;
    } else if (Array.isArray(parsed.plan)) {
      steps = parsed.plan;
    } else if (Array.isArray(parsed.chain)) {
      steps = parsed.chain;
    } else {
      const firstArray = Object.values(parsed).find((val) => Array.isArray(val));
      if (firstArray) steps = firstArray;
    }

    // Ensure stepNumber and valid defaults on all steps
    steps = steps.map((step, idx) => ({
      stepNumber: step.stepNumber || idx + 1,
      description: step.description || `Step ${idx + 1}`,
      method: (step.method || 'GET').toUpperCase(),
      url: step.url || '',
      headers: step.headers || {},
      body: step.body || null,
      extract: step.extract || {},
    }));

    res.json({ steps });
  } catch (error) {
    console.error('planChain error:', error);
    res.status(500).json({ error: error.message || 'Failed to plan the chain' });
  }
};

// ─── EXECUTE: run all steps sequentially ─────────────────────────────────────
export const executeChain = async (req, res) => {
  try {
    const { steps, baseUrl } = req.body;
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ error: 'Steps array is required' });
    }

    if (steps.length > MAX_STEPS) {
      return res.status(400).json({ error: `Chain too long. Maximum ${MAX_STEPS} steps allowed.` });
    }

    const context = {};
    const results = [];

    for (const step of steps) {
      const stepKey = `step${step.stepNumber}`;

      // 1. Resolve all placeholders in URL, headers, body
      const resolvedUrl = resolvePlaceholders(step.url, context);
      const resolvedHeaders = resolvePlaceholders(step.headers || {}, context);
      const resolvedBody = step.body ? resolvePlaceholders(step.body, context) : undefined;

      // 2. Build the full URL
      let fullUrl = resolvedUrl;
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        const base = (baseUrl || '').replace(/\/$/, '');
        if (base) {
          fullUrl = `${base}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
        } else {
          fullUrl = `https://${fullUrl}`;
        }
      }

      // 3. SSRF check
      if (isBlockedUrl(fullUrl)) {
        return res.status(403).json({
          error: `Blocked: "${fullUrl}" targets an internal or private address.`,
        });
      }

      let stepResult = {
        stepNumber: step.stepNumber,
        description: step.description,
        method: step.method,
        url: fullUrl,
        headers: resolvedHeaders,
        body: resolvedBody,
        status: null,
        response: null,
        extracted: {},
        error: null,
      };

      try {
        const response = await axios({
          method: (step.method || 'GET').toLowerCase(),
          url: fullUrl,
          headers: resolvedHeaders,
          data: resolvedBody,
          validateStatus: () => true,
          timeout: 15000,
        });

        stepResult.status = response.status;
        stepResult.response = response.data;

        const extracted = {};
        if (step.extract && typeof step.extract === 'object') {
          for (const [varName, path] of Object.entries(step.extract)) {
            const value = extractByPath(response.data, path);
            extracted[varName] = value;
          }
        }
        stepResult.extracted = extracted;
        context[stepKey] = extracted;

      } catch (httpError) {
        stepResult.error = httpError.message || 'Request failed';
        stepResult.status = 0;
        context[stepKey] = {};
      }

      results.push(stepResult);

      if (stepResult.status === 0) break;
    }

    res.json({ results, context });
  } catch (error) {
    console.error('executeChain error:', error);
    res.status(500).json({ error: error.message || 'Failed to execute chain' });
  }
};
