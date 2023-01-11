import { PrismaClient } from '@prisma/client'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

it('works', async () => {
  const before = Date.now()
  const prisma = new PrismaClient({ log: ['query', 'info', 'warn'] })

  // I first noticed the test failing when I ran it together with other tests. When I ran it standalone (e.g. with
  // "it.only"), it worked. I managed to reliably reproduce this by repeating the same tests two times.
  await expect(
    prisma.$transaction(
      async (ctx) => {
        await ctx.user.create({
          data: {
            email: 'askjkjas@assfg.com',
          },
        })
        await sleep(2_000) // Simulates a long running query or stuck API call
      },
      { timeout: 100 }, // Default timeout is 5 seconds
    ),
  ).rejects.toThrow('Transaction API error: Transaction already closed')
  await expect(
    prisma.$transaction(
      async (ctx) => {
        await ctx.user.create({
          data: {
            email: 'hjkhmm@assfg.com',
          },
        })
        await sleep(2_000) // Simulates a long running query or stuck API call
      },
      { timeout: 100 }, // Default timeout is 5 seconds
    ),
  ).rejects.toThrow('Transaction API error: Transaction already closed')

  const after = Date.now()
  expect(after - before).toBeLessThan(500)
})
