CREATE OR REPLACE FUNCTION prevent_user_upsert()
RETURNS trigger AS $prevent_user_upsert$
  DECLARE
  BEGIN
    IF NEW.email = 'askjkjas@assfg.com' THEN
      RAISE EXCEPTION 'Simulated trigger error';
    END IF;

    RETURN NEW;
  END;
$prevent_user_upsert$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER prevent_user_upsert
AFTER INSERT OR UPDATE ON "User"
-- Run at the end of the transaction (before COMMIT). See: https://stackoverflow.com/a/5300418
DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION prevent_user_upsert();
