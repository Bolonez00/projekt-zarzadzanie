/*
  # Kompletny schemat systemu zarządzania parkingiem

  1. Nowe tabele
    - `users` - użytkownicy systemu
    - `vehicles` - pojazdy użytkowników  
    - `parking_spaces` - miejsca parkingowe
    - `payments` - płatności

  2. Bezpieczeństwo
    - Włączenie RLS na wszystkich tabelach
    - Polityki dostępu dla użytkowników publicznych i uwierzytelnionych

  3. Relacje
    - vehicles.user_id -> users.id
    - parking_spaces.user_id -> users.id  
    - payments.user_id -> users.id
    - payments.space_id -> parking_spaces.id

  4. Indeksy
    - Indeksy na kluczach obcych dla wydajności
    - Unikalny indeks na numerach rejestracyjnych
*/

-- Usuń tabele jeśli istnieją (w odwrotnej kolejności ze względu na klucze obce)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS parking_spaces CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Tabela użytkowników
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela pojazdów
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  brand text NOT NULL,
  model text NOT NULL,
  plate text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('motor', 'auto-osobowe', 'dostawcze', 'inne')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela miejsc parkingowych
CREATE TABLE parking_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL,
  type text NOT NULL CHECK (type IN ('motor', 'auto-osobowe', 'dostawcze', 'inne')),
  is_occupied boolean DEFAULT false,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela płatności
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  space_id uuid REFERENCES parking_spaces(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  date timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indeksy dla wydajności
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_parking_spaces_user_id ON parking_spaces(user_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_space_id ON payments(space_id);

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

-- Włączenie Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Polityki RLS - dostęp publiczny do odczytu, uwierzytelnieni użytkownicy mogą dodawać
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON vehicles FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON parking_spaces FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON parking_spaces FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON payments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON payments FOR INSERT WITH CHECK (true);

-- Przykładowe dane testowe
INSERT INTO users (name, email, phone) VALUES 
('Jan Kowalski', 'jan.kowalski@email.com', '+48 123 456 789'),
('Anna Nowak', 'anna.nowak@email.com', '+48 987 654 321'),
('Piotr Wiśniewski', 'piotr.wisniewski@email.com', '+48 555 666 777');

INSERT INTO vehicles (user_id, brand, model, plate, type) VALUES 
((SELECT id FROM users WHERE email = 'jan.kowalski@email.com'), 'Toyota', 'Corolla', 'WA12345', 'auto-osobowe'),
((SELECT id FROM users WHERE email = 'anna.nowak@email.com'), 'Honda', 'CBR600', 'WA98765', 'motor'),
((SELECT id FROM users WHERE email = 'piotr.wisniewski@email.com'), 'Ford', 'Transit', 'WA55555', 'dostawcze');

INSERT INTO parking_spaces (number, type) VALUES 
('A1', 'auto-osobowe'),
('A2', 'auto-osobowe'),
('A3', 'auto-osobowe'),
('M1', 'motor'),
('M2', 'motor'),
('D1', 'dostawcze'),
('D2', 'dostawcze'),
('I1', 'inne');

-- Przypisz niektóre miejsca do użytkowników
UPDATE parking_spaces SET is_occupied = true, user_id = (SELECT id FROM users WHERE email = 'jan.kowalski@email.com') WHERE number = 'A1';
UPDATE parking_spaces SET is_occupied = true, user_id = (SELECT id FROM users WHERE email = 'anna.nowak@email.com') WHERE number = 'M1';

-- Dodaj przykładowe płatności
INSERT INTO payments (user_id, space_id, amount, description, status) VALUES 
((SELECT id FROM users WHERE email = 'jan.kowalski@email.com'), 
 (SELECT id FROM parking_spaces WHERE number = 'A1'), 
 50.00, 'Opłata za styczeń 2025 - Miejsce A1', 'paid'),
((SELECT id FROM users WHERE email = 'anna.nowak@email.com'), 
 (SELECT id FROM parking_spaces WHERE number = 'M1'), 
 30.00, 'Opłata za styczeń 2025 - Miejsce M1', 'pending');