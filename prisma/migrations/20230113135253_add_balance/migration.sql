/*
  Warnings:

  - Added the required column `balance` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "balance" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Deposit" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Verify consistency using trigger
CREATE OR REPLACE FUNCTION verify_balance()
RETURNS trigger AS $verify_balance$
  DECLARE
    expected_balance DECIMAL;
    actual_balance DECIMAL;
  BEGIN
    -- Compute the expected balance amount
    SELECT SUM(amount)
    FROM "Deposit"
    WHERE "userId" = NEW.id
    INTO expected_balance;
    IF expected_balance IS NULL THEN expected_balance = 0; END IF;

    -- Get the actual balance amount
    SELECT balance
    FROM "User"
    WHERE id = NEW.id
    INTO actual_balance;
    IF actual_balance IS NULL THEN actual_balance = 0; END IF;

    RAISE NOTICE 'Firing TG_WHEN % % % %', TG_WHEN, TG_OP, expected_balance, actual_balance;
    -- Verify that the expected balance amount is consistent
    IF expected_balance != NEW.balance THEN
      RAISE EXCEPTION 'User field "balance" is inconsistent. Expected=%, actual=%', expected_balance, NEW.balance;
    END IF;

    RETURN NEW;
  END;
$verify_balance$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER verify_balance
AFTER INSERT OR UPDATE ON "User"
-- Run at the end of the transaction (before COMMIT). See: https://stackoverflow.com/a/5300418
DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION verify_balance();

-- NOTE: You can use the following raw SQL to test the trigger:
-- BEGIN;
-- -- add user
-- INSERT INTO "public"."User" ("email","balance", "id") VALUES ('xx@x.402',0, 402);
-- -- add deposit
-- INSERT INTO "public"."Deposit" ("amount","userId") VALUES (100,402);
-- -- update user
-- UPDATE "public"."User" SET "balance" = 100 WHERE "id" = 402;

-- -- add deposit
-- INSERT INTO "public"."Deposit" ("amount","userId") VALUES (100,402);
-- -- update user
-- UPDATE "public"."User" SET "balance" = 200 WHERE "id" = 402;

-- -- add deposit
-- INSERT INTO "public"."Deposit" ("amount","userId") VALUES (100,402);
-- -- update user
-- UPDATE "public"."User" SET "balance" = 300 WHERE "id" = 402;
-- END;
