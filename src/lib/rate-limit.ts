let cached: string | null = null;
const hits = new Map <string,{ count: number; reset: number}>();

export function rateLimit(key: string, limit = 10, windoMs = 60_000): boolean {
     const now = Date.now();
     
     //clean old entries so the map does n ot grow forever
     if (hits.size > 1000) {
        for(const[k,v] of hits) if (now > v.reset) hits.delete(k);
  }

  const entry = hits.get(key);
  if(!entry || now > entry.reset) {
    hits.set(key, { count: 1, reset: now + windoMs });
    return true; //allowed

  }
  if(entry.count >= limit) return false; // blocked
  entry.count++;
  return true;
}