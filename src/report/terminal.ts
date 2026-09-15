import type { Finding, Severity, Verdict } from '../types.js';

const useColor = process.env['NO_COLOR'] === undefined && process.stdout.isTTY;

const paint = (code: string, text: string): string =>
  useColor ? `\u001b[${code}m${text}\u001b[0m` : text;
const bold = (t: string): string => paint('1', t);
const dim = (t: string): string => paint('2', t);
const red = (t: string): string => paint('31', t);
const yellow = (t: string): string => paint('33', t);
const green = (t: string): string => paint('32', t);

const SEVERITY_TAG: Record<Severity, (text: string) => string> = {
  high: red,
  medium: yellow,
  low: dim,
};

function renderFinding(finding: Finding, indent: string): string[] {
  const tag = SEVERITY_TAG[finding.severity](finding.severity.toUpperCase());
  const lines = [`${indent}${tag} ${bold(finding.check)}: ${finding.summary}`];
  for (const evidence of finding.evidence) {
    const where = evidence.line === null ? evidence.file : `${evidence.file}:${evidence.line}`;
    lines.push(`${indent}  ${dim(where)}  ${evidence.snippet}`);
  }
  return lines;
}

export function toTerminal(verdict: Verdict): string {
  const out: string[] = [];

  if (verdict.claims.length === 0) {
    out.push(dim('No claims found in the transcript.'));
  }

  for (const { claim, findings } of verdict.contradicted) {
    out.push('');
    out.push(`${red('✗')} ${bold(`It said:`)} "${claim.text}"`);
    out.push(`  ${dim(`(${claim.kind}, ${claim.adapter} line ${claim.line})`)}`);
    out.push(`  ${bold('The diff says:')}`);
    out.push(...findings.flatMap((finding) => renderFinding(finding, '  ')));
  }

  if (verdict.unclaimed.length > 0) {
    out.push('');
    out.push(bold('Also worth a look:'));
    out.push(...verdict.unclaimed.flatMap((finding) => renderFinding(finding, '  ')));
  }

  out.push('');
  if (verdict.contradicted.length === 0 && verdict.findings.length === 0) {
    out.push(
      green(
        'Nothing contradicted. That is not proof it works, only that these checks found nothing.',
      ),
    );
  } else {
    const claimWord = verdict.contradicted.length === 1 ? 'claim' : 'claims';
    out.push(
      `${verdict.contradicted.length} ${claimWord} contradicted, ${verdict.findings.length} finding(s) total.`,
    );
  }

  return out.join('\n');
}
