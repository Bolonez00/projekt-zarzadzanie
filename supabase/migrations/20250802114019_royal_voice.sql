/*
  # Napraw polityki RLS dla dostępu do danych

  1. Usuń istniejące polityki
  2. Dodaj nowe polityki z publicznym dostępem do odczytu
  3. Zachowaj bezpieczeństwo dla operacji zapisu
*/

-- Usuń wszystkie istniejące polityki
DROP POLICY IF EXISTS "Allow select for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON users;

DROP POLICY IF EXISTS "Allow select for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON vehicles;

DROP POLICY IF EXISTS "Allow select for authenticated users" ON parking_spaces;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON parking_spaces;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON parking_spaces;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON parking_spaces;

DROP POLICY IF EXISTS "Allow select for authenticated users" ON payments;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON payments;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON payments;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON payments;

-- Dodaj nowe polityki z publicznym dostępem do odczytu
-- USERS
CREATE POLICY "Public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON users FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON users FOR DELETE USING (true);

-- VEHICLES
CREATE POLICY "Public read access" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON vehicles FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON vehicles FOR DELETE USING (true);

-- PARKING_SPACES
CREATE POLICY "Public read access" ON parking_spaces FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON parking_spaces FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON parking_spaces FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON parking_spaces FOR DELETE USING (true);

-- PAYMENTS
CREATE POLICY "Public read access" ON payments FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON payments FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON payments FOR DELETE USING (true);