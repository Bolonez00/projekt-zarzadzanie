import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ParkingSpace, User, Vehicle, Payment } from '../types';

export const useSupabaseData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funkcje do pobierania danych
  const fetchUsers = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) throw usersError;

      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*');

      if (vehiclesError) throw vehiclesError;

      // Połącz użytkowników z ich pojazdami
      const usersWithVehicles: User[] = (usersData || []).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        vehicles: (vehiclesData || [])
          .filter(vehicle => vehicle.user_id === user.id)
          .map(vehicle => ({
            id: vehicle.id,
            brand: vehicle.brand,
            model: vehicle.model,
            plate: vehicle.plate,
            type: vehicle.type
          }))
      }));

      setUsers(usersWithVehicles);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Błąd podczas pobierania użytkowników');
    }
  };

  const fetchParkingSpaces = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_spaces')
        .select('*')
        .order('number');

      if (error) throw error;

      const spaces: ParkingSpace[] = (data || []).map(space => ({
          id: space.id,
          number: space.number,
          type: space.type,
          isOccupied: space.is_occupied, // ← mapujemy snake_case → camelCase
          userId: space.user_id
        }));

      setParkingSpaces(spaces);
    } catch (err) {
      console.error('Error fetching parking spaces:', err);
      setError('Błąd podczas pobierania miejsc parkingowych');
    }
  };

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const paymentsData: Payment[] = (data || []).map(payment => ({
        id: payment.id ?? undefined, // ← ważne: id może być null w Supabase
        userId: payment.user_id || '',
        amount: payment.amount,
        date: payment.date,
        status: payment.status,
        description: payment.description
      }));

      setPayments(paymentsData);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Błąd podczas pobierania płatności');
    }
  };

  // Funkcje do zapisywania danych
  const addUser = async (userData: Omit<User, 'id'>) => {
    try {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || null
        })
        .select()
        .single();

      if (userError) throw userError;

      // Dodaj pojazdy
      if (userData.vehicles.length > 0) {
        const vehiclesData = userData.vehicles.map(vehicle => ({
          user_id: newUser.id,
          brand: vehicle.brand,
          model: vehicle.model,
          plate: vehicle.plate,
          type: vehicle.type
        }));

        const { error: vehiclesError } = await supabase
          .from('vehicles')
          .insert(vehiclesData);

        if (vehiclesError) throw vehiclesError;
      }

      await fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Błąd podczas dodawania użytkownika');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Błąd podczas usuwania użytkownika');
    }
  };

  const addParkingSpace = async (spaceData: Omit<ParkingSpace, 'id'>) => {
    try {
      const { error } = await supabase
        .from('parking_spaces')
        .insert({
          number: spaceData.number,
          type: spaceData.type,
          is_occupied: spaceData.isOccupied,
          user_id: spaceData.userId
        });

      if (error) throw error;
      await fetchParkingSpaces();
    } catch (err) {
      console.error('Error adding parking space:', err);
      setError('Błąd podczas dodawania miejsca parkingowego');
    }
  };

  const updateParkingSpace = async (spaceId: string, updates: Partial<ParkingSpace>) => {
    try {
      console.log('Updating parking space:', spaceId, updates);
      
      // Przygotuj dane do aktualizacji
      const updateData: any = {};
      
      if (updates.number !== undefined) {
        updateData.number = updates.number;
      }
      if (updates.type !== undefined) {
        updateData.type = updates.type;
      }
      if (updates.isOccupied !== undefined) {
        updateData.is_occupied = updates.isOccupied;
      }
      if (updates.userId !== undefined) {
        updateData.user_id = updates.userId;
      }
      
      console.log('Update data to send:', updateData);
      
      const { error } = await supabase
        .from('parking_spaces')
        .update(updateData)
        .eq('id', spaceId);

      if (error) throw error;
      console.log('Parking space updated successfully');
      await fetchParkingSpaces();
    } catch (err) {
      console.error('Error updating parking space:', err);
      setError('Błąd podczas aktualizacji miejsca parkingowego');
    }
  };

  const deleteParkingSpace = async (spaceId: string) => {
    try {
      const { error } = await supabase
        .from('parking_spaces')
        .delete()
        .eq('id', spaceId);

      if (error) throw error;
      await fetchParkingSpaces();
    } catch (err) {
      console.error('Error deleting parking space:', err);
      setError('Błąd podczas usuwania miejsca parkingowego');
    }
  };

  const addPayment = async (paymentData: Omit<Payment, 'id'>) => {
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          user_id: paymentData.userId,
          amount: paymentData.amount,
          date: paymentData.date,
          status: paymentData.status,
          description: paymentData.description
        });

      if (error) throw error;
      await fetchPayments();
    } catch (err) {
      console.error('Error adding payment:', err);
      setError('Błąd podczas dodawania płatności');
    }
  };

  const updatePayment = async (paymentId: string, updates: Partial<Payment>) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          ...(updates.userId && { user_id: updates.userId }),
          ...(updates.amount !== undefined && { amount: updates.amount }),
          ...(updates.date && { date: updates.date }),
          ...(updates.status && { status: updates.status }),
          ...(updates.description && { description: updates.description })
        })
        .eq('id', paymentId);

      if (error) throw error;
      await fetchPayments();
    } catch (err) {
      console.error('Error updating payment:', err);
      setError('Błąd podczas aktualizacji płatności');
    }
  };

  // Pobierz dane przy pierwszym załadowaniu
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchParkingSpaces(),
        fetchPayments()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Subskrypcje do real-time aktualizacji
  useEffect(() => {
    const usersSubscription = supabase
      .channel('users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
      })
      .subscribe();

    const vehiclesSubscription = supabase
      .channel('vehicles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        fetchUsers();
      })
      .subscribe();

    const spacesSubscription = supabase
      .channel('parking_spaces_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_spaces' }, () => {
        fetchParkingSpaces();
      })
      .subscribe();

    const paymentsSubscription = supabase
      .channel('payments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchPayments();
      })
      .subscribe();

    return () => {
      usersSubscription.unsubscribe();
      vehiclesSubscription.unsubscribe();
      spacesSubscription.unsubscribe();
      paymentsSubscription.unsubscribe();
    };
  }, []);

  return {
    users,
    parkingSpaces,
    payments,
    loading,
    error,
    // Funkcje CRUD
    addUser,
    deleteUser,
    addParkingSpace,
    updateParkingSpace,
    deleteParkingSpace,
    addPayment,
    updatePayment,
    // Funkcje odświeżania
    refreshUsers: fetchUsers,
    refreshParkingSpaces: fetchParkingSpaces,
    refreshPayments: fetchPayments
  };
};