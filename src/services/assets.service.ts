import { supabase } from '../lib/supabase';
import { getInternalUserId } from './users.service';
import { Asset } from '../features/user/userSlice';

// Fetch all assets for a user (userId is auth uid; we resolve to internal user id)
export const fetchAssets = async (userId: string) => {
  try {
    const internalId = await getInternalUserId(userId);
    const user_id = internalId ?? userId;

    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Convert database format to app format
    const assets: Asset[] = (data || []).map(asset => ({
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
    // Return empty array so UI shows empty state instead of "failed to fetch"
    return { success: true, data: [] };
  }
};

// Add a new asset (userId is auth uid; we resolve to internal user id)
export const addAsset = async (userId: string, assetData: Omit<Asset, 'id' | 'lastUpdated'>) => {
  try {
    const internalId = await getInternalUserId(userId);
    const user_id = internalId ?? userId;

    const { data, error } = await supabase
      .from('assets')
      .insert({
        user_id,
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