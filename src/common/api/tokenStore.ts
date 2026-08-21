// A plain, non-React module that holds the current token in memory.
// Why not just read it from AuthContext directly? Because apiClient.ts
// is plain TypeScript, not a React component - it can't call useContext,
// which only works inside components/hooks. This tiny store is the
// bridge between "React state" and "plain code that needs that state."
let currentToken: string | null = null;

export function setToken(token: string | null) {
  currentToken = token;
}

export function getToken(): string | null {
  return currentToken;
}