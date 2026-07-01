import type { Snippet } from "@/lib/types";

// static catalog. ids are stable so runs can reference them.
// difficulty for code tracks line count, symbol density, and indentation.
// difficulty for prose tracks length and punctuation.

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
    text: "function greet(name) {\n  return `Hello, ${name}!`;\n}",
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
    text: "const cache = new Map();\nif (!cache.has(key)) {\n  cache.set(key, compute(key));\n}",
  },
  {
    id: "js-medium-004",
    language: "javascript",
    difficulty: "medium",
    text: "async function load(url) {\n  const res = await fetch(url);\n  return res.json();\n}",
  },

  // javascript - hard
  {
    id: "js-hard-001",
    language: "javascript",
    difficulty: "hard",
    text: "const debounce = (fn, ms) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n};",
  },
  {
    id: "js-hard-002",
    language: "javascript",
    difficulty: "hard",
    text: "const memoize = (fn) => {\n  const cache = new Map();\n  return (arg) => {\n    if (cache.has(arg)) return cache.get(arg);\n    const result = fn(arg);\n    cache.set(arg, result);\n    return result;\n  };\n};",
  },
  {
    id: "js-hard-003",
    language: "javascript",
    difficulty: "hard",
    text: "export const groupBy = (items, key) =>\n  items.reduce((acc, item) => {\n    const group = item[key];\n    (acc[group] ??= []).push(item);\n    return acc;\n  }, {});",
  },

  // python - easy
  {
    id: "py-easy-001",
    language: "python",
    difficulty: "easy",
    text: "def add(a, b):\n    return a + b",
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
    text: "if count > 0:\n    return True",
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
    text: "def greet(name):\n    return f'Hello, {name}!'",
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
    text: "cache = {}\nif key not in cache:\n    cache[key] = compute(key)",
  },
  {
    id: "py-medium-004",
    language: "python",
    difficulty: "medium",
    text: "with open(path) as f:\n    lines = f.readlines()\n    count = len(lines)",
  },

  // python - hard
  {
    id: "py-hard-001",
    language: "python",
    difficulty: "hard",
    text: "def memoize(fn):\n    cache = {}\n    def wrapper(arg):\n        if arg not in cache:\n            cache[arg] = fn(arg)\n        return cache[arg]\n    return wrapper",
  },
  {
    id: "py-hard-002",
    language: "python",
    difficulty: "hard",
    text: "def group_by(items, key):\n    result = {}\n    for item in items:\n        result.setdefault(item[key], []).append(item)\n    return result",
  },
  {
    id: "py-hard-003",
    language: "python",
    difficulty: "hard",
    text: "async def fetch_all(urls):\n    async with aiohttp.ClientSession() as session:\n        tasks = [session.get(url) for url in urls]\n        return await asyncio.gather(*tasks)",
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
