import { supabase } from '../lib/supabase';

// Test the connection and fetch all users
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error };
    }
    
    console.log('Connected successfully! Users:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Connection failed:', error);
    return { success: false, error };
  }
};

// Fetch user with all related data
export const fetchUserData = async (uid: string) => {
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