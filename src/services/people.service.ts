import { supabase } from '../lib/supabase';
import { Person } from '../features/people/peopleSlice';

// Fetch all people for a user
export const fetchPeople = async (userId: string) => {
  try {
    // Directly fetch people using the user's ID (no lookup needed)
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Convert database format to app format
    const people: Person[] = data.map(person => ({
      id: person.id,
      firstName: person.first_name,
      lastName: person.last_name,
      relationship: person.relationship,
      dateOfBirth: person.date_of_birth,
      contact: {
        email: person.email,
        phone: person.phone,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        }
      },
      roles: {
        isExecutor: person.is_executor,
        isTrustee: person.is_trustee,
        isBeneficiary: person.is_beneficiary,
        isHealthcareAgent: person.is_healthcare_agent,
        isPowerOfAttorney: person.is_power_of_attorney,
      },
      notes: person.notes || '',
      createdAt: person.created_at,
      updatedAt: person.updated_at
    }));

    return { success: true, data: people };
  } catch (error) {
    console.error('Error fetching people:', error);
    return { success: false, error };
  }
};

// Add a new person
export const addPerson = async (userId: string, personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Prepare insert data (only fields that exist in our simplified schema)
    const insertData = {
      user_id: userId,
      first_name: personData.firstName || '',
      last_name: personData.lastName || '',
      relationship: personData.relationship || '',
      date_of_birth: personData.dateOfBirth || null,
      email: personData.contact?.email || null,
      phone: personData.contact?.phone || null,
      is_executor: personData.roles?.isExecutor || false,
      is_trustee: personData.roles?.isTrustee || false,
      is_beneficiary: personData.roles?.isBeneficiary || false,
      is_healthcare_agent: personData.roles?.isHealthcareAgent || false,
      is_power_of_attorney: personData.roles?.isPowerOfAttorney || false,
      notes: personData.notes || null
    };

    const { data, error } = await supabase
      .from('people')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    // Convert back to app format
    const newPerson: Person = {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      relationship: data.relationship,
      dateOfBirth: data.date_of_birth,
      contact: {
        email: data.email,
        phone: data.phone,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        }
      },
      roles: {
        isExecutor: data.is_executor,
        isTrustee: data.is_trustee,
        isBeneficiary: data.is_beneficiary,
        isHealthcareAgent: data.is_healthcare_agent,
        isPowerOfAttorney: data.is_power_of_attorney,
      },
      notes: data.notes || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return { success: true, data: newPerson };
  } catch (error) {
    console.error('Error adding person:', error);
    return { success: false, error };
  }
};

// Update a person
export const updatePerson = async (personId: string, updates: Partial<Person>) => {
  try {
    const updateData: any = {};
    
    if (updates.firstName) updateData.first_name = updates.firstName;
    if (updates.lastName) updateData.last_name = updates.lastName;
    if (updates.relationship) updateData.relationship = updates.relationship;
    if (updates.dateOfBirth !== undefined) updateData.date_of_birth = updates.dateOfBirth || null;
    if (updates.contact?.email !== undefined) updateData.email = updates.contact.email || null;
    if (updates.contact?.phone !== undefined) updateData.phone = updates.contact.phone || null;
    if (updates.roles?.isExecutor !== undefined) updateData.is_executor = updates.roles.isExecutor;
    if (updates.roles?.isTrustee !== undefined) updateData.is_trustee = updates.roles.isTrustee;
    if (updates.roles?.isBeneficiary !== undefined) updateData.is_beneficiary = updates.roles.isBeneficiary;
    if (updates.roles?.isHealthcareAgent !== undefined) updateData.is_healthcare_agent = updates.roles.isHealthcareAgent;
    if (updates.roles?.isPowerOfAttorney !== undefined) updateData.is_power_of_attorney = updates.roles.isPowerOfAttorney;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;

    const { data, error } = await supabase
      .from('people')
      .update(updateData)
      .eq('id', personId)
      .select()
      .single();

    if (error) throw error;

    // Convert back to app format
    const updatedPerson: Person = {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      relationship: data.relationship,
      dateOfBirth: data.date_of_birth,
      contact: {
        email: data.email,
        phone: data.phone,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        }
      },
      roles: {
        isExecutor: data.is_executor,
        isTrustee: data.is_trustee,
        isBeneficiary: data.is_beneficiary,
        isHealthcareAgent: data.is_healthcare_agent,
        isPowerOfAttorney: data.is_power_of_attorney,
      },
      notes: data.notes || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return { success: true, data: updatedPerson };
  } catch (error) {
    console.error('Error updating person:', error);
    return { success: false, error };
  }
};

// Delete a person
export const deletePerson = async (personId: string) => {
  try {
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', personId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting person:', error);
    return { success: false, error };
  }
}; 