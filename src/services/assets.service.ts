import { supabase } from '../lib/supabase';
import { Asset } from '../features/user/userSlice';

// Fetch all assets for a user
export const fetchAssets = async (userId: string) => {
  try {
    // Directly fetch assets using the user's ID (no lookup needed)
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Convert database format to app format
    const assets: Asset[] = data.map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      value: asset.value,
      amount: asset.value,
      description: asset.description || '',
      lastUpdated: asset.updated_at
    }));

    return { success: true, data: assets };
  } catch (error) {
    console.error('Error fetching assets:', error);
    return { success: false, error };
  }
};

// Add a new asset
export const addAsset = async (userId: string, assetData: Omit<Asset, 'id' | 'lastUpdated'>) => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .insert({
        user_id: userId,
        name: assetData.name || '',
        type: assetData.type || 'other',
        value: assetData.value || 0,
        description: assetData.description || null
      })
      .select()
      .single();

    if (error) throw error;

    // Convert back to app format
    const newAsset: Asset = {
      id: data.id,
      name: data.name,
      type: data.type,
      value: data.value,
      amount: data.value,
      description: data.description,
      lastUpdated: data.updated_at
    };

    return { success: true, data: newAsset };
  } catch (error) {
    console.error('Error adding asset:', error);
    return { success: false, error };
  }
};

// Update an asset
export const updateAsset = async (assetId: string, updates: Partial<Asset>) => {
  try {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name || '';
    if (updates.type !== undefined) updateData.type = updates.type || 'other';
    if (updates.value !== undefined) updateData.value = updates.value || 0;
    if (updates.description !== undefined) updateData.description = updates.description || null;

    const { data, error } = await supabase
      .from('assets')
      .update(updateData)
      .eq('id', assetId)
      .select()
      .single();

    if (error) throw error;

    // Convert back to app format
    const updatedAsset: Asset = {
      id: data.id,
      name: data.name,
      type: data.type,
      value: data.value,
      amount: data.value,
      description: data.description,
      lastUpdated: data.updated_at
    };

    return { success: true, data: updatedAsset };
  } catch (error) {
    console.error('Error updating asset:', error);
    return { success: false, error };
  }
};

// Delete an asset
export const deleteAsset = async (assetId: string) => {
  try {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting asset:', error);
    return { success: false, error };
  }
}; 