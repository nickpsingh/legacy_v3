import { supabase } from '../lib/supabase';

export interface UserProfile {
  id?: string;
  uid: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  dateOfBirth?: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  state: string;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Resolve auth uid to internal users.id (used by assets/liabilities tables) */
export const getInternalUserId = async (uid: string): Promise<string | null> => {
  try {
    let { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('uid', uid)
      .single();
    if (error && uid === 'ec540338-923f-400d-a185-6028c5d5f823') {
      const res = await supabase.from('users').select('id').eq('id', uid).single();
      data = res.data;
      error = res.error;
    }
    if (error || !data) return null;
    return data.id;
  } catch {
    return null;
  }
};

// Fetch user by UID or ID
export const fetchUserByUID = async (uid: string) => {
  try {
    // First try by UID
    let { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', uid)
      .single();

    // If not found by UID, try by ID (for demo user)
    if (error && uid === 'ec540338-923f-400d-a185-6028c5d5f823') {
      const result = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    // Convert database format to app format
    const user: UserProfile = {
      id: data.id,
      uid: data.uid || data.id,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      email: data.email || '',
      phone: data.phone || '',
      age: data.age || 0,
      dateOfBirth: data.date_of_birth || '',
      maritalStatus: data.marital_status || 'single',
      address: {
        street: data.street || data.address_street || '',
        city: data.city || data.address_city || '',
        state: data.state || data.address_state || '',
        zipCode: data.zip_code || data.address_zip || '',
        country: data.country || data.address_country || 'USA',
      },
      state: data.state || '',
      lastUpdated: data.updated_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return { success: true, data: user };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error };
  }
};

// Create a new user
export const createUser = async (userData: Omit<UserProfile, 'id' | 'lastUpdated' | 'createdAt' | 'updatedAt'>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        uid: userData.uid,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        age: userData.age || 0,
        date_of_birth: userData.dateOfBirth || null,
        marital_status: userData.maritalStatus || 'single',
        street: userData.address?.street || '',
        city: userData.address?.city || '',
        state: userData.address?.state || userData.state || '',
        zip_code: userData.address?.zipCode || '',
        country: userData.address?.country || 'USA'
      })
      .select()
      .single();

    if (error) throw error;

    // Convert back to app format using correct field names
    const newUser: UserProfile = {
      id: data.id,
      uid: data.uid,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      email: data.email || '',
      phone: data.phone || '',
      age: data.age || 0,
      dateOfBirth: data.date_of_birth || '',
      maritalStatus: data.marital_status || 'single',
      address: {
        street: data.street || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zip_code || '',
        country: data.country || '',
      },
      state: data.state || '',
      lastUpdated: data.updated_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return { success: true, data: newUser };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error };
  }
};

// Update a user
export const updateUser = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    console.log('Updating user with UID:', uid, 'Updates:', updates);
    
    const updateData: any = {};
    
    if (updates.firstName !== undefined) updateData.first_name = updates.firstName || '';
    if (updates.lastName !== undefined) updateData.last_name = updates.lastName || '';
    if (updates.firstName || updates.lastName) {
      updateData.name = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
    }
    if (updates.email !== undefined) updateData.email = updates.email || '';
    if (updates.phone !== undefined) updateData.phone = updates.phone || '';
    if (updates.age !== undefined) updateData.age = updates.age || 0;
    if (updates.dateOfBirth !== undefined) updateData.date_of_birth = updates.dateOfBirth || null;
    if (updates.maritalStatus !== undefined) updateData.marital_status = updates.maritalStatus || 'single';
    
    // Handle address updates using correct field names
    if (updates.address) {
      if (updates.address.street !== undefined) updateData.street = updates.address.street || '';
      if (updates.address.city !== undefined) updateData.city = updates.address.city || '';
      if (updates.address.state !== undefined) updateData.state = updates.address.state || '';
      if (updates.address.zipCode !== undefined) updateData.zip_code = updates.address.zipCode || '';
      if (updates.address.country !== undefined) updateData.country = updates.address.country || '';
    }
    
    console.log('Update data prepared:', updateData);

    // Try updating by UID first, then by ID if needed
    let { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('uid', uid)
      .select()
      .single();

    // If no rows affected and this is the demo user, try by ID
    if (error && uid === 'ec540338-923f-400d-a185-6028c5d5f823') {
      console.log('Trying update by ID...');
      const result = await supabase
        .from('users')
        .update(updateData)
        .eq('id', uid)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Update error:', error);
      throw error;
    }

    console.log('Update successful, data:', data);

    // Convert back to app format using correct field names
    const updatedUser: UserProfile = {
      id: data.id,
      uid: data.uid || data.id,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      email: data.email || '',
      phone: data.phone || '',
      age: data.age || 0,
      dateOfBirth: data.date_of_birth || '',
      maritalStatus: data.marital_status || 'single',
      address: {
        street: data.street || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zip_code || '',
        country: data.country || '',
      },
      state: data.state || '',
      lastUpdated: data.updated_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error };
  }
};

// Delete a user
export const deleteUser = async (uid: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('uid', uid);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error };
  }
};

// Fetch user with all related data (from existing supabase service)
export const fetchUserDataComplete = async (uid: string) => {
  try {
    // Get user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('uid', uid)
      .single();

    if (userError) throw userError;

    // Get people (family members)
    const { data: peopleData, error: peopleError } = await supabase
      .from('people')
      .select('*')
      .eq('user_id', userData.id);

    if (peopleError) throw peopleError;

    // Get assets
    const { data: assetsData, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userData.id);

    if (assetsError) throw assetsError;

    // Get liabilities
    const { data: liabilitiesData, error: liabilitiesError } = await supabase
      .from('liabilities')
      .select('*')
      .eq('user_id', userData.id);

    if (liabilitiesError) throw liabilitiesError;

    return {
      success: true,
      data: {
        user: userData,
        people: peopleData,
        assets: assetsData,
        liabilities: liabilitiesData
      }
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return { success: false, error };
  }
}; 