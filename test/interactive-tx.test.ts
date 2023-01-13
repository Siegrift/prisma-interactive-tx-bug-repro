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
          balance: 0,
        },
      })
    }),
  ).rejects.toThrow()
})

it('works when using executeRaw', async () => {
  const prisma = new PrismaClient({ log: ['query', 'info', 'warn'] })

  await expect(prisma.$executeRaw`
    INSERT INTO "public"."User" ("email","balance") VALUES ('xx@x.x',100);
  `).rejects.toThrow('db error: ERROR: User field "balance" is inconsistent. Expected=0, actual=100')
})
