import { createClient } from "@insforge/sdk";

let _server: ReturnType<typeof createClient> | null = null;
let _browser: ReturnType<typeof createClient> | null = null;

export function insforgeServer() {
  if (_server) return _server;
  _server = createClient({
    baseUrl: process.env.INSFORGE_API_BASE_URL!,
    anonKey: process.env.INSFORGE_ANON_KEY!,
    isServerMode: true,
  });
  return _server;
}

export function insforgeBrowser() {
  if (_browser) return _browser;
  _browser = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
  });
  return _browser;
}
