export const PERFORMANCE_CYCLES = [
  { id: "h1-2026", label: "H1 2026 Review" },
  { id: "h2-2025", label: "H2 2025 Review" },
  { id: "h1-2025", label: "H1 2025 Review" },
];

export interface OrgNode {
  name: string;
  title: string;
  score: number;
  cycleScores: Record<string, number>;
  children?: OrgNode[];
}

// Seeded PRNG (mulberry32) — ensures identical org data on every refresh
let _rng: () => number = Math.random;

function seedRng(seed: number) {
  let s = seed >>> 0;
  _rng = function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rand(min: number, max: number) {
  return min + _rng() * (max - min);
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(_rng() * arr.length)];
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function clusteredScore(teamBias: number): number {
  const u1 = _rng();
  const u2 = _rng();
  const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const score = teamBias + normal * 0.15;
  return Math.round(clamp(score, 0.01, 0.99) * 100) / 100;
}

function teamBias(): number {
  const r = _rng();
  if (r < 0.25) return rand(0.10, 0.30);
  if (r < 0.55) return rand(0.35, 0.60);
  return rand(0.65, 0.90);
}

const firstNames = [
  "James", "Maria", "Chen", "Priya", "Omar", "Sarah", "David", "Yuki",
  "Carlos", "Fatima", "Alex", "Mei", "Raj", "Elena", "Kwame", "Nina",
  "Liam", "Sofia", "Amir", "Zara", "Ben", "Chloe", "Devi", "Erik",
  "Fiona", "George", "Hannah", "Ivan", "Julia", "Kofi", "Leila", "Marco",
  "Nadia", "Oscar", "Paula", "Quinn", "Rosa", "Sam", "Tara", "Uma",
  "Victor", "Wendy", "Xavier", "Yolanda", "Zach", "Ada", "Boris", "Diana",
  "Felix", "Grace", "Hugo", "Iris", "Jack", "Kate", "Leo", "Mina",
  "Noah", "Olga", "Pete", "Ruth", "Ava", "Lena", "Maya", "Ravi",
  "Kira", "Dane", "Mila", "Troy", "Aria", "Cole", "Jade", "Axel",
  "Vera", "Theo", "Luna", "Rhys", "Nora", "Emil", "Sage", "Cruz",
  "Lyra", "Nico", "Zena", "Finn", "Wren", "Jude", "Ines", "Abel",
  "Suki", "Lars", "Opal", "Remy", "Esme", "Clay", "Thea", "Kian",
  "Ivy", "Max", "Zoe", "Ali", "Eva", "Ian", "Joy", "Kit",
  "Lea", "Moe", "Nia", "Oz", "Rey", "Sky", "Ty", "Val",
  "Ash", "Bo", "Cal", "Dev", "Eli", "Gia", "Hal", "Ida",
  "Jay", "Kim", "Lou", "Nat", "Pam", "Rio", "Sol", "Tom",
  "Uri", "Vic", "Win", "Xia", "Yaz", "Zan", "Bea", "Cai",
  "Dom", "Emi", "Fay", "Gil", "Hao", "Ira", "Jem", "Kai",
];

const lastNames = [
  "Smith", "Patel", "Kim", "Garcia", "Johnson", "Lee", "Brown", "Chen",
  "Williams", "Singh", "Jones", "Wang", "Davis", "Lopez", "Wilson", "Li",
  "Moore", "Kumar", "Taylor", "Zhang", "Anderson", "Ali", "Thomas", "Nakamura",
  "Jackson", "Park", "White", "Martinez", "Harris", "Sato", "Clark", "Hall",
  "Young", "King", "Wright", "Hill", "Scott", "Green", "Adams", "Baker",
  "Nelson", "Carter", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey",
  "Rivera", "Cooper", "Cox", "Ward", "Torres", "Gray", "Watson", "Brooks",
  "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross", "Long",
  "Foster", "Diaz", "Perry", "Ford", "Hunt", "Dunn", "Stone", "Carr",
  "Webb", "Shaw", "Fox", "Lane", "Cole", "Rowe", "Nash", "Dale",
];

const vpDomains = [
  "Engineering", "Product", "Design", "Sales", "Marketing", "Operations", "Data", "Infrastructure",
  "Security", "Platform", "Growth", "Partnerships",
];

const icTitles = [
  "Senior Engineer", "Engineer", "Staff Engineer", "Analyst", "Senior Analyst",
  "Specialist", "Associate", "Coordinator", "Designer", "Senior Designer",
  "Strategist", "Lead", "Developer", "Researcher", "Consultant", "Architect",
];

const usedNames = new Set<string>();
let nameCounter = 0;

function uniqueName(): string {
  let name: string;
  let attempts = 0;
  do {
    name = `${pick(firstNames)} ${pick(lastNames)}`;
    attempts++;
    if (attempts > 100) {
      nameCounter++;
      name = `${pick(firstNames)} ${pick(lastNames)} ${String.fromCharCode(65 + (nameCounter % 26))}`;
    }
  } while (usedNames.has(name));
  usedNames.add(name);
  return name;
}

function avgChildCycleScores(children: OrgNode[], cycleId: string): number {
  const scores: number[] = [];
  function collect(n: OrgNode) {
    if (!n.children) scores.push(n.cycleScores[cycleId]);
    else n.children.forEach(collect);
  }
  children.forEach(collect);
  return scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : 0;
}

function buildCycleScores(children: OrgNode[]): Record<string, number> {
  const cs: Record<string, number> = {};
  for (const cycle of PERFORMANCE_CYCLES) {
    cs[cycle.id] = avgChildCycleScores(children, cycle.id);
  }
  return cs;
}

function makeIC(bias: number): OrgNode {
  const cycleScores: Record<string, number> = {};
  // Each cycle gets an independent draw from the same team bias (with slight drift for older cycles)
  for (let i = 0; i < PERFORMANCE_CYCLES.length; i++) {
    const driftedBias = clamp(bias + rand(-0.08, 0.08) * i, 0.05, 0.95);
    cycleScores[PERFORMANCE_CYCLES[i].id] = clusteredScore(driftedBias);
  }
  return {
    name: uniqueName(),
    title: pick(icTitles),
    score: cycleScores[PERFORMANCE_CYCLES[0].id],
    cycleScores,
  };
}

function makeManager(domain: string, parentBias: number): OrgNode {
  const bias = clamp(parentBias + rand(-0.15, 0.15), 0.05, 0.95);
  const icCount = randInt(5, 8);
  const children = Array.from({ length: icCount }, () => makeIC(bias));
  const cycleScores = buildCycleScores(children);
  return {
    name: uniqueName(),
    title: `${domain} Manager`,
    score: cycleScores[PERFORMANCE_CYCLES[0].id],
    cycleScores,
    children,
  };
}

function makeDirector(domain: string): OrgNode {
  const bias = teamBias();
  const mgrCount = randInt(4, 7);
  const children = Array.from({ length: mgrCount }, () => makeManager(domain, bias));
  const cycleScores = buildCycleScores(children);
  return {
    name: uniqueName(),
    title: `Director of ${domain}`,
    score: cycleScores[PERFORMANCE_CYCLES[0].id],
    cycleScores,
    children,
  };
}

function makeVP(domain: string): OrgNode {
  const dirCount = randInt(3, 5);
  const children = Array.from({ length: dirCount }, () => makeDirector(domain));
  const cycleScores = buildCycleScores(children);
  return {
    name: uniqueName(),
    title: `VP of ${domain}`,
    score: cycleScores[PERFORMANCE_CYCLES[0].id],
    cycleScores,
    children,
  };
}

export function generateOrgData(): OrgNode {
  seedRng(0xDEADBEEF); // fixed seed — same names every refresh
  usedNames.clear();
  nameCounter = 0;
  const children = vpDomains.map((d) => makeVP(d));
  const cycleScores = buildCycleScores(children);
  return {
    name: uniqueName(),
    title: "CEO",
    score: cycleScores[PERFORMANCE_CYCLES[0].id],
    cycleScores,
    children,
  };
}

export function getHeadcount(node: OrgNode): number {
  if (!node.children) return 1;
  return node.children.reduce((s, c) => s + getHeadcount(c), 0);
}
