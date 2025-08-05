import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Car, Phone, Mail } from 'lucide-react';
import { User, Vehicle } from '../types';

interface UsersProps {
  users: User[];
  onAddUser: (userData: Omit<User, 'id'>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

const Users: React.FC<UsersProps> = ({ users, onAddUser, onDeleteUser }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    vehicles: [] as Vehicle[]
  });
  const [newVehicle, setNewVehicle] = useState({
    brand: '',
    model: '',
    plate: '',
    type: 'auto-osobowe' as Vehicle['type']
  });

  const vehicleTypes = [
    { value: 'motor', label: 'Motor' },
    { value: 'auto-osobowe', label: 'Auto osobowe' },
    { value: 'dostawcze', label: 'Dostawcze' },
    { value: 'inne', label: 'Inne' }
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async () => {
    if (newUser.name.trim() && newUser.email.trim()) {
      const userData: Omit<User, 'id'> = {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        phone: newUser.phone.trim(),
        vehicles: newUser.vehicles
      };
      
      await onAddUser(userData);
      setNewUser({ name: '', email: '', phone: '', vehicles: [] });
      setShowAddModal(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tego użytkownika? Ta operacja jest nieodwracalna.')) {
      await onDeleteUser(id);
    }
  };

  const handleAddVehicle = () => {
    if (newVehicle.brand.trim() && newVehicle.model.trim() && newVehicle.plate.trim()) {
      const vehicle: Vehicle = {
        id: Date.now().toString(),
        brand: newVehicle.brand.trim(),
        model: newVehicle.model.trim(),
        plate: newVehicle.plate.trim().toUpperCase(),
        type: newVehicle.type
      };
      setNewUser(prev => ({
        ...prev,
        vehicles: [...prev.vehicles, vehicle]
      }));
      setNewVehicle({ brand: '', model: '', plate: '', type: 'auto-osobowe' });
    }
  };

  const handleRemoveVehicle = (vehicleId: string) => {
    setNewUser(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter(v => v.id !== vehicleId)
    }));
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'motor': 'bg-purple-100 text-purple-800',
      'auto-osobowe': 'bg-blue-100 text-blue-800',
      'dostawcze': 'bg-orange-100 text-orange-800',
      'inne': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors['inne'];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Użytkownicy</h1>
          <p className="text-gray-600">Zarządzaj użytkownikami i ich pojazdami</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Dodaj Użytkownika</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj użytkowników..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vehicles */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Pojazdy ({user.vehicles.length})
                  </h4>
                  {user.vehicles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {user.vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="bg-gray-50 p-3 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {vehicle.brand} {vehicle.model}
                              </p>
                              <p className="text-sm text-gray-600 font-mono">
                                {vehicle.plate}
                              </p>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getTypeColor(vehicle.type)}`}>
                                {vehicleTypes.find(t => t.value === vehicle.type)?.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Brak zarejestrowanych pojazdów</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDeleteUser(user.id)}
                className="text-gray-400 hover:text-red-600 p-2"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dodaj Nowego Użytkownika</h3>
            
            <div className="space-y-6">
              {/* User Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Dane osobowe</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imię i nazwisko *
                    </label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Vehicles */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Pojazdy</h4>
                
                {/* Add Vehicle Form */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Marka"
                      value={newVehicle.brand}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, brand: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Model"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Numer rejestracyjny"
                      value={newVehicle.plate}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, plate: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                      value={newVehicle.type}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, type: e.target.value as Vehicle['type'] }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {vehicleTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAddVehicle}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Dodaj Pojazd
                  </button>
                </div>

                {/* Vehicle List */}
                {newUser.vehicles.length > 0 && (
                  <div className="space-y-2">
                    {newUser.vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                        <div>
                          <span className="font-medium">{vehicle.brand} {vehicle.model}</span>
                          <span className="ml-2 text-gray-600 font-mono">{vehicle.plate}</span>
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(vehicle.type)}`}>
                            {vehicleTypes.find(t => t.value === vehicle.type)?.label}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveVehicle(vehicle.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddUser}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dodaj Użytkownika
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewUser({ name: '', email: '', phone: '', vehicles: [] });
                  setNewVehicle({ brand: '', model: '', plate: '', type: 'auto-osobowe' });
                }}
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

export default Users;