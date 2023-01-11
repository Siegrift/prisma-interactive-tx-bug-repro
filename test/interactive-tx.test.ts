import { PrismaClient } from '@prisma/client'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

it('works', async () => {
  const before = Date.now()
  const prisma = new PrismaClient()

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
