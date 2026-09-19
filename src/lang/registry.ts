export interface LanguageProfile {
  id: string;
  extensions: string[];
  /** Matched against the file path, not its contents. */
  testFile: RegExp;
  testDeclaration: RegExp;
  skipMarker: RegExp;
  /** Focusing a test skips every other test in the file, which is not the same as skipping it. */
  focusMarker: RegExp;
  assertion: RegExp;
  hollowAssertion: RegExp;
  swallowedError: RegExp;
  mockSetup: RegExp;
}

/** Matches nothing, for a language with no equivalent of the marker. */
const NEVER = /(?!)/;

const profiles: LanguageProfile[] = [
  {
    id: 'javascript',
    extensions: ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts'],
    testFile: /(^|[/])(__tests__|tests?)[/]|\.(test|spec)\.[cm]?[jt]sx?$/,
    testDeclaration: /\b(it|test|describe)\s*(\.\w+)?\s*\(/,
    skipMarker: /\b(it|test|describe)\s*\.\s*(skip|todo|failing)\s*\(|\bx(it|describe)\s*\(/,
    focusMarker: /\b(it|test|describe)\s*\.\s*only\b|\bf(it|describe)\s*\(/,
    assertion: /\b(expect|assert|should)\s*[.(]|\bt\.(is|deepEqual|truthy|throws)\b/,
    hollowAssertion:
      /expect\s*\(\s*(true|1|'[^']*'|"[^"]*")\s*\)\s*\.\s*(toBe|toEqual|toBeTruthy)\s*\(\s*(true|1|'[^']*'|"[^"]*")?\s*\)/,
    swallowedError:
      /catch\s*(\([^)]*\))?\s*\{\s*\}|\.catch\s*\(\s*\(?\s*\w*\s*\)?\s*=>\s*\{?\s*\}?\s*\)/,
    mockSetup: /\b(jest|vi)\s*\.\s*(mock|spyOn|doMock)\s*\(|\bsinon\s*\.\s*(stub|mock)\s*\(/,
  },
  {
    id: 'python',
    extensions: ['.py'],
    testFile: /(^|[/])tests?[/]|(^|[/])test_[^/]+\.py$|_test\.py$/,
    testDeclaration: /^\s*(async\s+)?def\s+test_\w+\s*\(/,
    skipMarker:
      /@pytest\s*\.\s*mark\s*\.\s*(skip|skipif|xfail)\b|\bunittest\s*\.\s*skip\b|\bpytest\s*\.\s*skip\s*\(/,
    focusMarker: NEVER,
    assertion: /^\s*assert\b|\bself\s*\.\s*assert\w+\s*\(/,
    hollowAssertion: /^\s*assert\s+(True|1)\s*$|\bself\s*\.\s*assertTrue\s*\(\s*True\s*\)/,
    swallowedError: /except[^:]*:\s*(pass|\.\.\.)\s*$/,
    mockSetup: /\b(mock|patch)\s*\(|@patch\b|\bMagicMock\s*\(/,
  },
  {
    id: 'go',
    extensions: ['.go'],
    testFile: /_test\.go$/,
    testDeclaration: /^\s*func\s+(Test|Benchmark|Fuzz)\w*\s*\(/,
    skipMarker: /\b\w+\s*\.\s*Skip(Now|f)?\s*\(|\bt\s*\.\s*Skip\b/,
    focusMarker: NEVER,
    assertion: /\b\w+\s*\.\s*(Errorf?|Fatalf?)\s*\(|\b(assert|require)\s*\.\s*\w+\s*\(/,
    hollowAssertion: /\bassert\s*\.\s*True\s*\(\s*\w+\s*,\s*true\s*\)/,
    swallowedError: /if\s+err\s*!=\s*nil\s*\{\s*\}|_\s*=\s*err\b/,
    mockSetup: /\bgomock\s*\.\s*|\bmock\w*\s*\.\s*On\s*\(/,
  },
  {
    id: 'rust',
    extensions: ['.rs'],
    testFile: /(^|[/])tests?[/]|_test\.rs$/,
    testDeclaration: /#\[\s*(tokio::)?test\s*\]/,
    skipMarker: /#\[\s*ignore\b/,
    focusMarker: NEVER,
    assertion: /\bassert(_eq|_ne)?\s*!|\bdebug_assert\s*!/,
    hollowAssertion: /\bassert\s*!\s*\(\s*true\s*\)|\bassert_eq\s*!\s*\(\s*(\w+)\s*,\s*\1\s*\)/,
    swallowedError: /\.ok\s*\(\s*\)\s*;|let\s+_\s*=\s*\w+\s*\.\s*unwrap_or/,
    mockSetup: /\bmockall\b|\bMockAll\b/,
  },
];

const byExtension = new Map<string, LanguageProfile>();
for (const profile of profiles) {
  for (const ext of profile.extensions) byExtension.set(ext, profile);
}

export function profileFor(path: string): LanguageProfile | null {
  const dot = path.lastIndexOf('.');
  if (dot === -1) return null;
  return byExtension.get(path.slice(dot).toLowerCase()) ?? null;
}

export function isTestFile(path: string): boolean {
  const profile = profileFor(path);
  return profile ? profile.testFile.test(path) : false;
}

export function listProfiles(): readonly LanguageProfile[] {
  return profiles;
}
