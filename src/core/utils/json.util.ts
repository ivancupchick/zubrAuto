export function JSONparse<T>(json: string): T | null {
  try {
    return JSON.parse(json);
  } catch (e) {
    console.log('JSON parsing error', e); // TODO logger
    return null;
  }
}
