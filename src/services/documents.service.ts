import { supabase } from '../lib/supabase';

export interface DocumentData {
  id?: string;
  user_id: string;
  document_type: 'will' | 'living-trust' | 'living-will' | 'power-of-attorney';
  template_id?: string;
  title: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'completed' | 'rejected';
  content: any;
  step_data?: any;
  current_step: number;
  total_steps: number;
  progress_percentage: number;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
  completed_at?: string;
}

export interface DocumentTemplate {
  id: string;
  document_type: string;
  template_name: string;
  title: string;
  template_content: any;
  version: number;
  is_active: boolean;
}

export interface DocumentStep {
  id: string;
  document_type: string;
  step_number: number;
  step_title: string;
  step_description: string;
  required_fields: string[];
  validation_rules: any;
}

class DocumentsService {
  // Fetch all documents for a user
  async fetchDocuments(userId: string): Promise<DocumentData[]> {
    try {
      console.log('🔍 DocumentsService: Fetching documents for user:', userId);
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      console.log('📄 DocumentsService: Query result:', { data, error });
      console.log('📊 DocumentsService: Documents count:', data ? data.length : 0);

      if (error) {
        console.error('❌ DocumentsService: Error fetching documents:', error);
        return [];
      }

      if (data && data.length > 0) {
        console.log('✅ DocumentsService: Successfully fetched documents:', data);
      } else {
        console.log('⚠️ DocumentsService: No documents found for user');
      }

      return data || [];
    } catch (error) {
      console.error('❌ DocumentsService: Exception fetching documents:', error);
      return [];
    }
  }

  // Create a new document
  async createDocument(documentData: Omit<DocumentData, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentData | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([documentData])
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating document:', error);
      return null;
    }
  }

  // Update an existing document
  async updateDocument(documentId: string, updates: Partial<DocumentData>): Promise<DocumentData | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating document:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating document:', error);
      return null;
    }
  }

  // Delete a document
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Error deleting document:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  // Fetch document templates
  async fetchTemplates(): Promise<DocumentTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  // Fetch workflow steps for a document type
  async fetchWorkflowSteps(documentType: string): Promise<DocumentStep[]> {
    try {
      const { data, error } = await supabase
        .from('document_steps')
        .select('*')
        .eq('document_type', documentType)
        .eq('is_active', true)
        .order('step_number');

      if (error) {
        console.error('Error fetching workflow steps:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching workflow steps:', error);
      return [];
    }
  }

  // Submit a document
  async submitDocument(documentId: string, userId: string): Promise<boolean> {
    try {
      // Update document status to submitted
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          progress_percentage: 100
        })
        .eq('id', documentId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating document status:', updateError);
        return false;
      }

      // Create submission record
      const { error: submissionError } = await supabase
        .from('document_submissions')
        .insert([{
          document_id: documentId,
          submission_method: 'e-filing',
          external_reference_id: `EF-${Date.now()}`,
          submission_status: 'pending',
          submitted_by: userId,
          submission_notes: 'Document submitted via estate planner application'
        }]);

      if (submissionError) {
        console.error('Error creating submission record:', submissionError);
        // Don't return false here as the document was still updated
      }

      return true;
    } catch (error) {
      console.error('Error submitting document:', error);
      return false;
    }
  }

  // Get document by ID
  async getDocument(documentId: string): Promise<DocumentData | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) {
        console.error('Error fetching document:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching document:', error);
      return null;
    }
  }

  // Helper method to calculate progress
  calculateProgress(currentStep: number, totalSteps: number): number {
    if (totalSteps === 0) return 0;
    return Math.round((currentStep / totalSteps) * 100);
  }

  // Get document title based on type
  getDocumentTitle(type: string): string {
    const titles = {
      'will': 'Last Will and Testament',
      'living-trust': 'Living Trust',
      'living-will': 'Living Will',
      'power-of-attorney': 'Power of Attorney'
    };
    return titles[type as keyof typeof titles] || 'Document';
  }
}

export const documentsService = new DocumentsService(); 