import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, User, Car } from 'lucide-react';
import { ParkingSpace, User as UserType } from '../types';

interface ParkingSpacesProps {
  spaces: ParkingSpace[];
  users: UserType[];
  onAddSpace: (spaceData: Omit<ParkingSpace, 'id'>) => Promise<void>;
  onUpdateSpace: (spaceId: string, updates: Partial<ParkingSpace>) => Promise<void>;
  onDeleteSpace: (spaceId: string) => Promise<void>;
}

const ParkingSpaces: React.FC<ParkingSpacesProps> = ({ 
  spaces, 
  users, 
  onAddSpace, 
  onUpdateSpace, 
  onDeleteSpace 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [newSpace, setNewSpace] = useState({
    number: '',
    type: 'auto-osobowe' as ParkingSpace['type']
  });

  const spaceTypes = [
    { value: 'motor', label: 'Motor', color: 'bg-purple-100 text-purple-800' },
    { value: 'auto-osobowe', label: 'Auto osobowe', color: 'bg-blue-100 text-blue-800' },
    { value: 'dostawcze', label: 'Dostawcze', color: 'bg-orange-100 text-orange-800' },
    { value: 'inne', label: 'Inne', color: 'bg-gray-100 text-gray-800' }
  ];

  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || space.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddSpace = async () => {
    if (newSpace.number.trim()) {
      const spaceData: Omit<ParkingSpace, 'id'> = {
        number: newSpace.number.trim(),
        type: newSpace.type,
        isOccupied: false,
        userId: null
      };
      
      await onAddSpace(spaceData);
      setNewSpace({ number: '', type: 'auto-osobowe' });
      setShowAddModal(false);
    }
  };

  const handleDeleteSpace = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć to miejsce parkingowe?')) {
      await onDeleteSpace(id);
    }
  };

  const handleAssignUser = async (spaceId: string, userId: string | null) => {
    console.log('Assigning user:', userId, 'to space:', spaceId);
    
    // Konwertuj pusty string na null
    const actualUserId = userId === '' ? null : userId;
    
    const updates: Partial<ParkingSpace> = {
      isOccupied: actualUserId !== null,
      userId: actualUserId
    };
    
    console.log('Updates to apply:', updates);
    await onUpdateSpace(spaceId, updates);
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return null;
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Nieznany użytkownik';
  };

  const getTypeStyle = (type: string) => {
    const typeConfig = spaceTypes.find(t => t.value === type);
    return typeConfig?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Miejsca Parkingowe</h1>
          <p className="text-gray-600">Zarządzaj miejscami i przypisaniami</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Dodaj Miejsce</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj po numerze miejsca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Wszystkie typy</option>
            {spaceTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSpaces.map((space) => (
          <div key={space.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${space.isOccupied ? 'bg-red-100' : 'bg-green-100'}`}>
                  <Car className={`h-5 w-5 ${space.isOccupied ? 'text-red-600' : 'text-green-600'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{space.number}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeStyle(space.type)}`}>
                    {spaceTypes.find(t => t.value === space.type)?.label}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteSpace(space.id)}
                className="text-gray-400 hover:text-red-600 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${space.isOccupied ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <p className={`text-sm font-medium ${space.isOccupied ? 'text-red-700' : 'text-green-700'}`}>
                  {space.isOccupied ? 'Zajęte' : 'Wolne'}
                </p>
                {space.isOccupied && space.userId && (
                  <p className="text-xs text-red-600 mt-1">
                    {getUserName(space.userId)}
                  </p>
                )}
              </div>

              <select
                value={space.userId || ''}
                onChange={(e) => handleAssignUser(space.id, e.target.value || null)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Nie przypisane</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Add Space Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dodaj Nowe Miejsce</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numer miejsca
                </label>
                <input
                  type="text"
                  value={newSpace.number}
                  onChange={(e) => setNewSpace(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="np. A1, B5, M1..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ miejsca
                </label>
                <select
                  value={newSpace.type}
                  onChange={(e) => setNewSpace(prev => ({ ...prev, type: e.target.value as ParkingSpace['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {spaceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddSpace}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dodaj Miejsce
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

export default ParkingSpaces;