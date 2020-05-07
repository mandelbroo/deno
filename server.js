import { serve } from "https://deno.land/std@v0.42.0/http/server.ts"
const port = 3000
const s = serve({ port })
console.log(`http://localhost:${port}`)
for await (const req of s) {
  req.respond({ body: 'Server on Deno 🦕' })
}
