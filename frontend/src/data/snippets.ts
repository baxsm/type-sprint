import type { Snippet } from "@/lib/types";

// static catalog. ids are stable so runs can reference them.
// difficulty for code tracks line count, symbol density, and indentation.
// difficulty for prose tracks length and punctuation.
// code snippets use a literal tab character for indentation, matched by a single
// Tab keypress in TypingSurface (same pattern as Enter matching "\n").

export const snippets: Snippet[] = [
  // javascript - easy
  {
    id: "js-easy-001",
    language: "javascript",
    difficulty: "easy",
    text: "const sum = (a, b) => a + b;",
  },
  {
    id: "js-easy-002",
    language: "javascript",
    difficulty: "easy",
    text: "const name = user.name || 'Guest';",
  },
  {
    id: "js-easy-003",
    language: "javascript",
    difficulty: "easy",
    text: "const doubled = nums.map((n) => n * 2);",
  },
  {
    id: "js-easy-004",
    language: "javascript",
    difficulty: "easy",
    text: "if (count > 0) return true;",
  },
  {
    id: "js-easy-005",
    language: "javascript",
    difficulty: "easy",
    text: "const total = price * quantity;",
  },

  // javascript - medium
  {
    id: "js-medium-001",
    language: "javascript",
    difficulty: "medium",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: this is snippet content to type, not code
    text: "function greet(name) {\n\treturn `Hello, ${name}!`;\n}",
  },
  {
    id: "js-medium-002",
    language: "javascript",
    difficulty: "medium",
    text: "const active = users.filter((u) => u.isActive);\nconst names = active.map((u) => u.name);",
  },
  {
    id: "js-medium-003",
    language: "javascript",
    difficulty: "medium",
    text: "const cache = new Map();\nif (!cache.has(key)) {\n\tcache.set(key, compute(key));\n}",
  },
  {
    id: "js-medium-004",
    language: "javascript",
    difficulty: "medium",
    text: "async function load(url) {\n\tconst res = await fetch(url);\n\treturn res.json();\n}",
  },

  // javascript - hard
  {
    id: "js-hard-001",
    language: "javascript",
    difficulty: "hard",
    text: "const debounce = (fn, ms) => {\n\tlet timer;\n\treturn (...args) => {\n\t\tclearTimeout(timer);\n\t\ttimer = setTimeout(() => fn(...args), ms);\n\t};\n};",
  },
  {
    id: "js-hard-002",
    language: "javascript",
    difficulty: "hard",
    text: "const memoize = (fn) => {\n\tconst cache = new Map();\n\treturn (arg) => {\n\t\tif (cache.has(arg)) return cache.get(arg);\n\t\tconst result = fn(arg);\n\t\tcache.set(arg, result);\n\t\treturn result;\n\t};\n};",
  },
  {
    id: "js-hard-003",
    language: "javascript",
    difficulty: "hard",
    text: "export const groupBy = (items, key) =>\n\titems.reduce((acc, item) => {\n\t\tconst group = item[key];\n\t\t(acc[group] ??= []).push(item);\n\t\treturn acc;\n\t}, {});",
  },

  // python - easy
  {
    id: "py-easy-001",
    language: "python",
    difficulty: "easy",
    text: "def add(a, b):\n\treturn a + b",
  },
  {
    id: "py-easy-002",
    language: "python",
    difficulty: "easy",
    text: "name = user.get('name', 'Guest')",
  },
  {
    id: "py-easy-003",
    language: "python",
    difficulty: "easy",
    text: "doubled = [n * 2 for n in nums]",
  },
  {
    id: "py-easy-004",
    language: "python",
    difficulty: "easy",
    text: "if count > 0:\n\treturn True",
  },
  {
    id: "py-easy-005",
    language: "python",
    difficulty: "easy",
    text: "total = price * quantity",
  },

  // python - medium
  {
    id: "py-medium-001",
    language: "python",
    difficulty: "medium",
    text: "def greet(name):\n\treturn f'Hello, {name}!'",
  },
  {
    id: "py-medium-002",
    language: "python",
    difficulty: "medium",
    text: "active = [u for u in users if u.is_active]\nnames = [u.name for u in active]",
  },
  {
    id: "py-medium-003",
    language: "python",
    difficulty: "medium",
    text: "cache = {}\nif key not in cache:\n\tcache[key] = compute(key)",
  },
  {
    id: "py-medium-004",
    language: "python",
    difficulty: "medium",
    text: "with open(path) as f:\n\tlines = f.readlines()\n\tcount = len(lines)",
  },

  // python - hard
  {
    id: "py-hard-001",
    language: "python",
    difficulty: "hard",
    text: "def memoize(fn):\n\tcache = {}\n\tdef wrapper(arg):\n\t\tif arg not in cache:\n\t\t\tcache[arg] = fn(arg)\n\t\treturn cache[arg]\n\treturn wrapper",
  },
  {
    id: "py-hard-002",
    language: "python",
    difficulty: "hard",
    text: "def group_by(items, key):\n\tresult = {}\n\tfor item in items:\n\t\tresult.setdefault(item[key], []).append(item)\n\treturn result",
  },
  {
    id: "py-hard-003",
    language: "python",
    difficulty: "hard",
    text: "async def fetch_all(urls):\n\tasync with aiohttp.ClientSession() as session:\n\t\ttasks = [session.get(url) for url in urls]\n\t\treturn await asyncio.gather(*tasks)",
  },

  // prose - easy
  {
    id: "prose-easy-001",
    language: "prose",
    difficulty: "easy",
    text: "The quick brown fox jumps over the lazy dog.",
  },
  {
    id: "prose-easy-002",
    language: "prose",
    difficulty: "easy",
    text: "Practice makes progress, not perfection.",
  },
  {
    id: "prose-easy-003",
    language: "prose",
    difficulty: "easy",
    text: "A small step each day builds a long road.",
  },
  {
    id: "prose-easy-004",
    language: "prose",
    difficulty: "easy",
    text: "Type what you see and keep a steady pace.",
  },
  {
    id: "prose-easy-005",
    language: "prose",
    difficulty: "easy",
    text: "Good habits are worth more than good luck.",
  },

  // prose - medium
  {
    id: "prose-medium-001",
    language: "prose",
    difficulty: "medium",
    text: "The only way to do great work is to love what you do, and to keep doing it every single day.",
    source: "adapted",
  },
  {
    id: "prose-medium-002",
    language: "prose",
    difficulty: "medium",
    text: "Speed comes from accuracy. When you stop making errors, the pace takes care of itself over time.",
  },
  {
    id: "prose-medium-003",
    language: "prose",
    difficulty: "medium",
    text: "We are what we repeatedly do; excellence, then, is not an act but a habit we practice.",
    source: "adapted from Aristotle",
  },

  // prose - hard
  {
    id: "prose-hard-001",
    language: "prose",
    difficulty: "hard",
    text: "It was the best of times, it was the worst of times; it was the age of wisdom, it was the age of foolishness, the season of light, the season of darkness.",
    source: "Charles Dickens",
  },
  {
    id: "prose-hard-002",
    language: "prose",
    difficulty: "hard",
    text: "Whether you think you can, or you think you can't, you're right; the mind sets the ceiling long before the hands ever reach for it.",
    source: "adapted from Henry Ford",
  },
  {
    id: "prose-hard-003",
    language: "prose",
    difficulty: "hard",
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts, quietly, one keystroke and one attempt at a time.",
    source: "adapted from Winston Churchill",
  },
];
