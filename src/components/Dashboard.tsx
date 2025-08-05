import React from 'react';
import { Car, Users, MapPin, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { ParkingSpace, User, Payment } from '../types';

interface DashboardProps {
  parkingSpaces: ParkingSpace[];
  users: User[];
  payments: Payment[];
}

const Dashboard: React.FC<DashboardProps> = ({ parkingSpaces, users, payments }) => {
  const occupiedSpaces = parkingSpaces.filter(space => space.isOccupied).length;
  const totalSpaces = parkingSpaces.length;
  const occupancyRate = Math.round((occupiedSpaces / totalSpaces) * 100);
  
  const paidPayments = payments.filter(p => p.status === 'paid').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const overduePayments = payments.filter(p => p.status === 'overdue').length;
  
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      title: 'Zajęte Miejsca',
      value: `${occupiedSpaces}/${totalSpaces}`,
      change: `${occupancyRate}% zajętości`,
      icon: MapPin,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'Aktywni Użytkownicy',
      value: users.length.toString(),
      change: '+2 w tym miesiącu',
      icon: Users,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Przychody (mies.)',
      value: `${totalRevenue} zł`,
      change: '+15% vs poprzedni miesiąc',
      icon: DollarSign,
      color: 'emerald',
      trend: 'up'
    },
    {
      title: 'Zaległe Płatności',
      value: (pendingPayments + overduePayments).toString(),
      change: `${overduePayments} przeterminowane`,
      icon: AlertTriangle,
      color: overduePayments > 0 ? 'red' : 'yellow',
      trend: 'down'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      red: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconBg = (color: string) => {
    const colors = {
      blue: 'bg-blue-100',
      green: 'bg-green-100',
      emerald: 'bg-emerald-100',
      yellow: 'bg-yellow-100',
      red: 'bg-red-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel Główny </h1>
          <p className="text-gray-600">Przegląd systemu zarządzania parkingiem</p>
        </div>
        <div className="text-sm text-gray-500">
          Ostatnia aktualizacja: {new Date().toLocaleString('pl-PL')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow ${getColorClasses(stat.color)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs mt-2 opacity-75">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${getIconBg(stat.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ostatnia Aktywność</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <Car className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Nowe miejsce przypisane</p>
                <p className="text-xs text-gray-500">Miejsce A1 - Jan Kowalski</p>
              </div>
              <span className="text-xs text-gray-400">2 min temu</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Płatność otrzymana</p>
                <p className="text-xs text-gray-500">50 zł - Jan Kowalski</p>
              </div>
              <span className="text-xs text-gray-400">1 godz. temu</span>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="bg-yellow-100 p-2 rounded-full">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Zbliża się termin płatności</p>
                <p className="text-xs text-gray-500">Anna Nowak - 3 dni</p>
              </div>
              <span className="text-xs text-gray-400">Dziś</span>
            </div>
          </div>
        </div>

        {/* Parking Layout Preview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mapa Parkingu</h3>
          <div className="grid grid-cols-4 gap-2">
            {parkingSpaces.map((space) => (
              <div
                key={space.id}
                className={`aspect-square flex items-center justify-center text-xs font-medium rounded-lg border-2 transition-colors ${
                  space.isOccupied
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-green-100 text-green-700 border-green-200'
                }`}
              >
                {space.number}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-gray-600">Wolne</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-gray-600">Zajęte</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;