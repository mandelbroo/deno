import { assert, fail, assertEquals } from "https://deno.land/std/testing/asserts.ts"

Deno.test({
  name: "example test",
  fn: () => {
    assertEquals("world", "world")
  },
})
