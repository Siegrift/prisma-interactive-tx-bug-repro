import { PrismaClient } from '@prisma/client'

// NOTE: This test actually fails
it('works with interactive transactions and triggers', async () => {
  const prisma = new PrismaClient({ log: ['query', 'info', 'warn'] })

  // This should fail, because the Postgres trigger throws an error. However, Prisma resolves and there is no log output
  // for this.
  await expect(
    prisma.$transaction(async (ctx) => {
      await ctx.user.create({
        data: {
          email: 'askjkjas@assfg.com',
        },
      })
    }),
  ).rejects.toThrow()
})

it('works when using executeRaw', async () => {
  const prisma = new PrismaClient({ log: ['query', 'info', 'warn'] })

  await expect(prisma.$executeRaw`
    INSERT INTO "User" ("email") VALUES ('askjkjas@assfg.com') RETURNING "User"."id";
  `).rejects.toThrow('ERROR: Simulated trigger error')
})
