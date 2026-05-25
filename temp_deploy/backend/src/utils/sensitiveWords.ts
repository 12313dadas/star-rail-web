const DEFAULT_SENSITIVE_WORDS = [
  '垃圾', '傻逼', '操你', 'fuck', 'shit', 'damn',
];

export function filterSensitiveWords(text: string, customWords: string[] = []): string {
  const words = [...DEFAULT_SENSITIVE_WORDS, ...customWords];
  let result = text;
  for (const word of words) {
    if (!word) continue;
    const pattern = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(pattern, '*'.repeat(word.length));
  }
  return result;
}

export function containsSensitiveWords(text: string, customWords: string[] = []): boolean {
  const words = [...DEFAULT_SENSITIVE_WORDS, ...customWords];
  const lower = text.toLowerCase();
  return words.some((word) => word && lower.includes(word.toLowerCase()));
}
