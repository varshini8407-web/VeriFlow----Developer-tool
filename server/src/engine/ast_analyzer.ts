export interface ParsedCodeItem {
  type: 'function' | 'class' | 'import' | 'endpoint' | 'query' | 'sink';
  name: string;
  lineStart: number;
  lineEnd: number;
  params?: string[];
  docstring?: string;
  securityRisk?: 'high' | 'medium' | 'low';
}

export interface ASTAnalysisResult {
  filePath: string;
  language: string;
  items: ParsedCodeItem[];
  functionsCount: number;
  classesCount: number;
  endpointsCount: number;
  imports: string[];
}

export function analyzeAST(filePath: string, code: string): ASTAnalysisResult {
  const items: ParsedCodeItem[] = [];
  const lines = code.split('\n');
  const imports: string[] = [];

  let currentClass: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    // Imports
    if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
      imports.push(trimmed);
      items.push({
        type: 'import',
        name: trimmed,
        lineStart: lineNum,
        lineEnd: lineNum
      });
      continue;
    }

    // Classes
    const classMatch = trimmed.match(/^class\s+([A-Za-z0-9_]+)/);
    if (classMatch) {
      currentClass = classMatch[1];
      items.push({
        type: 'class',
        name: currentClass,
        lineStart: lineNum,
        lineEnd: lineNum + 10 // approximated
      });
      continue;
    }

    // Functions
    const funcMatch = trimmed.match(/^def\s+([A-Za-z0-9_]+)\s*\((.*?)\)/);
    if (funcMatch) {
      const funcName = funcMatch[1];
      const params = funcMatch[2].split(',').map((p) => p.trim());
      items.push({
        type: 'function',
        name: currentClass ? `${currentClass}.${funcName}` : funcName,
        lineStart: lineNum,
        lineEnd: lineNum + 15,
        params
      });
      continue;
    }

    // Endpoints (FastAPI / Express)
    const endpointMatch = trimmed.match(/@(router|app)\.(get|post|put|delete|patch)\(["']([^"']+)["']/);
    if (endpointMatch) {
      const method = endpointMatch[2].toUpperCase();
      const path = endpointMatch[3];
      items.push({
        type: 'endpoint',
        name: `${method} ${path}`,
        lineStart: lineNum,
        lineEnd: lineNum + 8
      });
      continue;
    }

    // Dangerous Sinks / DB Queries
    if (trimmed.includes('db.query(') || trimmed.includes('db.execute(') || trimmed.includes('.execute(')) {
      items.push({
        type: 'query',
        name: 'Database Query Sink',
        lineStart: lineNum,
        lineEnd: lineNum,
        securityRisk: trimmed.includes('?') || trimmed.includes('%s') ? 'low' : 'high'
      });
    }

    if (trimmed.includes('eval(') || trimmed.includes('exec(') || trimmed.includes('subprocess.')) {
      items.push({
        type: 'sink',
        name: 'Dynamic Execution Sink',
        lineStart: lineNum,
        lineEnd: lineNum,
        securityRisk: 'high'
      });
    }
  }

  return {
    filePath,
    language: filePath.endsWith('.py') ? 'python' : 'typescript',
    items,
    functionsCount: items.filter((i) => i.type === 'function').length,
    classesCount: items.filter((i) => i.type === 'class').length,
    endpointsCount: items.filter((i) => i.type === 'endpoint').length,
    imports
  };
}
