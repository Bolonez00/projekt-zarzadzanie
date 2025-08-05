import React, { useState, useEffect } from 'react';
import { Car, Users as UsersIcon, MapPin, TrendingUp, Plus, Search, Filter, Calendar, DollarSign } from 'lucide-react';
import { useSupabaseData } from './hooks/useSupabaseData';
import Dashboard from './components/Dashboard';
import ParkingSpaces from './components/ParkingSpaces';
import Users from './components/Users';
import Payments from './components/Payments';
import Reports from './components/Reports';
import { ParkingSpace, User, Vehicle, Payment } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'spaces' | 'users' | 'payments' | 'reports'>('dashboard');
  
  // Używamy hooka do zarządzania danymi z Supabase
  const {
    users,
    parkingSpaces,
    payments,
    loading,
    error,
    addUser,
    deleteUser,
    addParkingSpace,
    updateParkingSpace,
    deleteParkingSpace,
    addPayment,
    updatePayment
  } = useSupabaseData();

  // Stawki miesięczne według typu miejsca
  const monthlyRates = {
    'motor': 100,
    'auto-osobowe': 100,
    'dostawcze': 100,
    'inne': 100
  };

  // Funkcja automatycznego generowania płatności
  const generateMonthlyPayments = async () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Znajdź wszystkich użytkowników z przypisanymi miejscami
    const occupiedSpaces = parkingSpaces.filter(space => space.isOccupied && space.userId);
    
    const newPayments: Payment[] = [];
    
    for (const space of occupiedSpaces) {
      if (!space.userId) return;
      
      // Sprawdź czy użytkownik już ma płatność za bieżący miesiąc
      const existingPayment = payments.find(payment => 
        payment.userId === space.userId && 
        payment.date.startsWith(currentMonth) &&
        payment.description.includes(`za ${getMonthName(new Date().getMonth())}`)
      );
      
      // Jeśli nie ma płatności, utwórz nową
      if (!existingPayment) {
        const user = users.find(u => u.id === space.userId);
        if (user) {
          const amount = monthlyRates[space.type] || monthlyRates['inne'];
          const monthName = getMonthName(new Date().getMonth());
          
          const payment: Payment = {
            userId: space.userId,
            amount: amount,
            date: currentDate,
            status: 'pending',
            description: `Opłata za ${monthName} ${new Date().getFullYear()} - Miejsce ${space.number}`
          };
          
          // Dodaj płatność do bazy danych
          await addPayment(payment);
        }
      }
    }
    
    if (newPayments.length > 0) {
      alert(`Wygenerowano ${newPayments.length} nowych płatności dla użytkowników z przypisanymi miejscami!`);
    } else {
      alert('Wszystkie płatności za bieżący miesiąc zostały już wygenerowane.');
    }
  };
  
  // Funkcja pomocnicza do nazw miesięcy
  const getMonthName = (monthIndex: number): string => {
    const months = [
      'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
      'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
    ];
    return months[monthIndex];
  };

  // Automatyczne generowanie płatności przy zmianie przypisań miejsc
  useEffect(() => {
    if (loading || parkingSpaces.length === 0 || users.length === 0) return; // Nie uruchamiaj jeśli dane się jeszcze ładują
    
    // Usuń automatyczne generowanie - będzie tylko przez przycisk
  }, [parkingSpaces, users, payments, loading, addPayment]);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'spaces', label: 'Miejsca Parkingowe', icon: MapPin },
    { id: 'users', label: 'Użytkownicy', icon: UsersIcon },
    { id: 'payments', label: 'Płatności', icon: DollarSign },
    { id: 'reports', label: 'Raporty', icon: Calendar },
  ];

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie danych...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Błąd: {error}</p>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard parkingSpaces={parkingSpaces} users={users} payments={payments} />;
      case 'spaces':
        return (
          <ParkingSpaces 
            spaces={parkingSpaces} 
            users={users}
            onAddSpace={addParkingSpace}
            onUpdateSpace={updateParkingSpace}
            onDeleteSpace={deleteParkingSpace}
          />
        );
      case 'users':
        return (
          <Users 
            users={users}
            onAddUser={addUser}
            onDeleteUser={deleteUser}
          />
        );
      case 'payments':
        return (
          <Payments 
            payments={payments} 
            users={users} 
            onAddPayment={addPayment}
            onUpdatePayment={updatePayment}
            onGeneratePayments={generateMonthlyPayments} 
          />
        );
      case 'reports':
        return <Reports parkingSpaces={parkingSpaces} users={users} payments={payments} />;
      default:
        return <Dashboard parkingSpaces={parkingSpaces} users={users} payments={payments} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Parking Manager</h1>
            </div>
            <div className="text-sm text-gray-600">
              System Zarządzania Parkingiem
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
          <div className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentView(item.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        currentView === item.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default App;