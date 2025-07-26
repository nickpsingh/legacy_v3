import { supabase } from '../lib/supabase';

export interface Liability {
  id: string;
  name: string;
  type: 'mortgage' | 'loan' | 'credit_card' | 'other';
  amount: number;
  description: string;
  interestRate: number;
  lastUpdated: string;
}

// Fetch all liabilities for a user
export const fetchLiabilities = async (userId: string) => {
  try {
    // Directly fetch liabilities using the user's ID (no lookup needed)
    const { data, error } = await supabase
      .from('liabilities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Convert database format to app format
    const liabilities: Liability[] = data.map(liability => ({
      id: liability.id,
      name: liability.name,
      type: liability.type,
      amount: liability.amount,
      description: liability.description || '',
      interestRate: liability.interest_rate || 0,
      lastUpdated: liability.updated_at
    }));

    return { success: true, data: liabilities };
  } catch (error) {
    console.error('Error fetching liabilities:', error);
    return { success: false, error };
  }
};

// Add a new liability
export const addLiability = async (userId: string, liabilityData: Omit<Liability, 'id' | 'lastUpdated'>) => {
  try {
    const { data, error } = await supabase
      .from('liabilities')
      .insert({
        user_id: userId,
        name: liabilityData.name || '',
        type: liabilityData.type || 'other',
        amount: liabilityData.amount || 0,
        description: liabilityData.description || null,
        interest_rate: liabilityData.interestRate || 0
      })
      .select()
      .single();

    if (error) throw error;

    // Convert back to app format
    const newLiability: Liability = {
      id: data.id,
      name: data.name,
      type: data.type,
      amount: data.amount,
      description: data.description || '',
      interestRate: data.interest_rate || 0,
      lastUpdated: data.updated_at
    };

    return { success: true, data: newLiability };
  } catch (error) {
    console.error('Error adding liability:', error);
    return { success: false, error };
  }
};

// Update a liability
export const updateLiability = async (liabilityId: string, updates: Partial<Liability>) => {
  try {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name || '';
    if (updates.type !== undefined) updateData.type = updates.type || 'other';
    if (updates.amount !== undefined) updateData.amount = updates.amount || 0;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.interestRate !== undefined) updateData.interest_rate = updates.interestRate || 0;

    const { data, error } = await supabase
      .from('liabilities')
      .update(updateData)
      .eq('id', liabilityId)
      .select()
      .single();

    if (error) throw error;

    // Convert back to app format
    const updatedLiability: Liability = {
      id: data.id,
      name: data.name,
      type: data.type,
      amount: data.amount,
      description: data.description || '',
      interestRate: data.interest_rate || 0,
      lastUpdated: data.updated_at
    };

    return { success: true, data: updatedLiability };
  } catch (error) {
    console.error('Error updating liability:', error);
    return { success: false, error };
  }
};

// Delete a liability
export const deleteLiability = async (liabilityId: string) => {
  try {
    const { error } = await supabase
      .from('liabilities')
      .delete()
      .eq('id', liabilityId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting liability:', error);
    return { success: false, error };
  }
}; 