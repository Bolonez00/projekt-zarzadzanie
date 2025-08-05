/*
  # System Zarządzania Parkingiem - Schemat Bazy Danych

  1. Nowe Tabele
    - `users` - użytkownicy systemu z danymi kontaktowymi
    - `vehicles` - pojazdy przypisane do użytkowników
    - `parking_spaces` - miejsca parkingowe z typami i statusami
    - `payments` - historia płatności z różnymi statusami

  2. Bezpieczeństwo
    - Włączenie RLS dla wszystkich tabel
    - Polityki dostępu dla operacji CRUD
    - Indeksy dla wydajności

  3. Relacje
    - vehicles.user_id → users.id
    - parking_spaces.user_id → users.id  
    - payments.user_id → users.id
*/

-- Włącz rozszerzenie UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela użytkowników
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela pojazdów
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  brand text NOT NULL,
  model text NOT NULL,
  plate text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('motor', 'auto-osobowe', 'dostawcze', 'inne')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela miejsc parkingowych
CREATE TABLE IF NOT EXISTS parking_spaces (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  number text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('motor', 'auto-osobowe', 'dostawcze', 'inne')),
  is_occupied boolean DEFAULT false,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela płatności
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  date date DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_user_id ON parking_spaces(user_id);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_occupied ON parking_spaces(is_occupied);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);

-- Włącz RLS dla wszystkich tabel
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Polityki RLS - pozwalamy na wszystkie operacje (dla uproszczenia w demo)
-- W produkcji należy ograniczyć dostęp według ról użytkowników

CREATE POLICY "Allow all operations on users" ON users
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on vehicles" ON vehicles
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on parking_spaces" ON parking_spaces
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on payments" ON payments
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Funkcja do automatycznego aktualizowania updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggery do automatycznego aktualizowania updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parking_spaces_updated_at BEFORE UPDATE ON parking_spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();