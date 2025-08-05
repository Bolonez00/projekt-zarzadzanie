import React, { useState } from 'react';
import { Plus, Search, Eye, DollarSign, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Payment, User } from '../types';

interface PaymentsProps {
  payments: Payment[];
  users: User[];
  onAddPayment: (paymentData: Omit<Payment, 'id'>) => Promise<void>;
  onUpdatePayment: (paymentId: string, updates: Partial<Payment>) => Promise<void>;
  onGeneratePayments?: () => void;
}

const Payments: React.FC<PaymentsProps> = ({ 
  payments, 
  users, 
  onAddPayment, 
  onUpdatePayment, 
  onGeneratePayments 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [newPayment, setNewPayment] = useState({
    userId: '',
    amount: '',
    description: '',
    status: 'pending' as Payment['status']
  });

  // Funkcja do sprawdzania czy płatność jest przeterminowana
  const isPaymentOverdue = (payment: Payment) => {
    if (payment.status !== 'pending') return false;
    
    const paymentDate = new Date(payment.date);
    const currentDate = new Date();
    
    // Sprawdź czy minął miesiąc od daty płatności
    const nextMonth = new Date(paymentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return currentDate >= nextMonth;
  };

  // Automatycznie oznacz przeterminowane płatności
  React.useEffect(() => {
    const checkOverduePayments = async () => {
      const overduePayments = payments.filter(payment => 
        payment.status === 'pending' && isPaymentOverdue(payment)
      );
      
      for (const payment of overduePayments) {
        await onUpdatePayment(payment.id!, { status: 'overdue' });
      }
    };
    
    if (payments.length > 0) {
      checkOverduePayments();
    }
  }, [payments, onUpdatePayment]);

  const statusConfig = {
    paid: { label: 'Opłacone', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    pending: { label: 'Oczekuje', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    overdue: { label: 'Przeterminowane', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
  };

  const filteredPayments = payments.filter(payment => {
    const user = users.find(u => u.id === payment.userId);
    const userName = user ? user.name.toLowerCase() : '';
    const matchesSearch = userName.includes(searchTerm.toLowerCase()) || 
                         payment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    // Filtrowanie po dacie
    let matchesDate = true;
    if (filterDateFrom) {
      matchesDate = matchesDate && new Date(payment.date) >= new Date(filterDateFrom);
    }
    if (filterDateTo) {
      matchesDate = matchesDate && new Date(payment.date) <= new Date(filterDateTo);
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleAddPayment = async () => {
    if (newPayment.userId && newPayment.amount && newPayment.description) {
      const paymentData: Omit<Payment, 'id'> = {
        userId: newPayment.userId,
        amount: parseFloat(newPayment.amount),
        date: new Date().toISOString().split('T')[0],
        status: newPayment.status,
        description: newPayment.description.trim()
      };
      
      await onAddPayment(paymentData);
      setNewPayment({ userId: '', amount: '', description: '', status: 'pending' });
      setShowAddModal(false);
    }
  };

  const handleStatusChange = async (paymentId: string, newStatus: Payment['status']) => {
    await onUpdatePayment(paymentId, { status: newStatus });
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Nieznany użytkownik';
  };

  const getTotalAmount = (status?: string) => {
  let filtered = payments;

  // Filtrowanie po dacie z zakresu filtrów
  if (filterDateFrom || filterDateTo) {
    filtered = filtered.filter(p => {
      const paymentDate = new Date(p.date);
      const fromOk = filterDateFrom ? paymentDate >= new Date(filterDateFrom) : true;
      const toOk = filterDateTo ? paymentDate <= new Date(filterDateTo) : true;
      return fromOk && toOk;
    });
  }

  // Filtrowanie po statusie (jeśli podany)
  if (status && status !== 'all') {
    filtered = filtered.filter(p => p.status === status);
  }

  return filtered.reduce((sum, p) => sum + p.amount, 0);
};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Płatności</h1>
          <p className="text-gray-600">Zarządzaj płatnościami i fakturami</p>
        </div>
        <div className="flex space-x-3">
          {onGeneratePayments && (
            <button
              onClick={onGeneratePayments}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Generuj Płatności</span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Dodaj Płatność</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Łączne przychody</p>
              <p className="text-xl font-bold text-gray-900">{getTotalAmount()} zł</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Opłacone</p>
              <p className="text-xl font-bold text-gray-900">{getTotalAmount('paid')} zł</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Oczekujące</p>
              <p className="text-xl font-bold text-gray-900">{getTotalAmount('pending')} zł</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Przeterminowane</p>
              <p className="text-xl font-bold text-gray-900">{getTotalAmount('overdue')} zł</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj po użytkowniku lub opisie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="paid">Opłacone</option>
            <option value="pending">Oczekujące</option>
            <option value="overdue">Przeterminowane</option>
          </select>
          <div>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              placeholder="Data od"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              placeholder="Data do"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {(filterDateFrom || filterDateTo) && (
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filterDateFrom && filterDateTo ? (
                `Filtrowanie: ${new Date(filterDateFrom).toLocaleDateString('pl-PL')} - ${new Date(filterDateTo).toLocaleDateString('pl-PL')}`
              ) : filterDateFrom ? (
                `Od: ${new Date(filterDateFrom).toLocaleDateString('pl-PL')}`
              ) : (
                `Do: ${new Date(filterDateTo).toLocaleDateString('pl-PL')}`
              )}
            </div>
            <button
              onClick={() => {
                setFilterDateFrom('');
                setFilterDateTo('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Wyczyść filtry dat
            </button>
          </div>
        )}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Użytkownik</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Opis</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Kwota</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Data</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => {
                const config = statusConfig[payment.status];
                const Icon = config.icon;
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {getUserName(payment.userId)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {payment.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">
                        {payment.amount} zł
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(payment.date).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <select
                          value={payment.status}
                          onChange={(e) => handleStatusChange(payment.id!, e.target.value as Payment['status'])}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="pending">Oczekuje</option>
                          <option value="paid">Opłacone</option>
                          <option value="overdue">Przeterminowane</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dodaj Nową Płatność</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Użytkownik *
                </label>
                <select
                  value={newPayment.userId}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Wybierz użytkownika</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kwota (zł) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opis *
                </label>
                <input
                  type="text"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="np. Opłata za styczeń 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={newPayment.status}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, status: e.target.value as Payment['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Oczekuje</option>
                  <option value="paid">Opłacone</option>
                  <option value="overdue">Przeterminowane</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddPayment}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dodaj Płatność
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;