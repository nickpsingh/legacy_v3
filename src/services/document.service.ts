import { jsPDF } from 'jspdf';
import { UserProfile } from '../features/user/userSlice';

export interface DocumentData {
  type: 'will' | 'living-trust' | 'living-will' | 'power-of-attorney';
  content: any;
  metadata: {
    createdAt: string;
    updatedAt: string;
    status: 'draft' | 'completed' | 'submitted';
    documentId: string;
  };
}

export interface DocumentTemplate {
  title: string;
  sections: {
    title: string;
    content: string;
  }[];
}

class DocumentService {
  private templates: Record<DocumentData['type'], DocumentTemplate> = {
    'will': {
      title: 'Last Will and Testament',
      sections: [
        { title: 'Declaration', content: 'I, {full_name}, being of sound mind...' },
        { title: 'Executor', content: 'I hereby appoint {executor_name} as executor of my will...' },
        { title: 'Beneficiaries', content: 'I hereby give, devise, and bequeath my property as follows...' },
      ],
    },
    'living-trust': {
      title: 'Living Trust',
      sections: [
        { title: 'Declaration', content: 'This Living Trust is made on {date} by {grantor_name}...' },
        { title: 'Trust Property', content: 'The Grantor hereby transfers and assigns to the Trustee...' },
        { title: 'Distribution', content: 'Upon the death of the Grantor, the Trustee shall...' },
      ],
    },
    'living-will': {
      title: 'Living Will',
      sections: [
        { title: 'Declaration', content: 'I, {full_name}, being of sound mind...' },
        { title: 'Life-Sustaining Treatment', content: 'If I should have an incurable condition...' },
        { title: 'Healthcare Agent', content: 'I hereby appoint {agent_name} as my healthcare agent...' },
      ],
    },
    'power-of-attorney': {
      title: 'Power of Attorney',
      sections: [
        { title: 'Appointment', content: 'I, {principal_name}, hereby appoint {agent_name}...' },
        { title: 'Powers Granted', content: 'I grant my agent the following powers...' },
        { title: 'Effective Date', content: 'This Power of Attorney shall become effective...' },
      ],
    },
  };

  generateDocument(type: DocumentData['type'], data: any, profile: UserProfile): DocumentData {
    const template = this.templates[type];
    const documentId = this.generateDocumentId();
    
    const content = template.sections.map(section => ({
      ...section,
      content: this.replacePlaceholders(section.content, { ...data, ...profile }),
    }));

    return {
      type,
      content,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        documentId,
      },
    };
  }

  async generatePDF(document: DocumentData): Promise<Blob> {
    const pdf = new jsPDF();
    let yOffset = 20;

    // Add title
    pdf.setFontSize(24);
    pdf.text(this.templates[document.type].title, 20, yOffset);
    yOffset += 20;

    // Add content
    pdf.setFontSize(12);
    document.content.forEach((section: any) => {
      pdf.setFontSize(16);
      pdf.text(section.title, 20, yOffset);
      yOffset += 10;

      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(section.content, 170);
      lines.forEach((line: string) => {
        if (yOffset > 280) {
          pdf.addPage();
          yOffset = 20;
        }
        pdf.text(line, 20, yOffset);
        yOffset += 7;
      });
      yOffset += 10;
    });

    return pdf.output('blob');
  }

  async submitDocument(document: DocumentData): Promise<{ success: boolean; message: string }> {
    try {
      // Update document status to submitted
      const updatedDocument = {
        ...document,
        metadata: {
          ...document.metadata,
          status: 'submitted',
          updatedAt: new Date().toISOString()
        }
      };

      // Save the updated document
      const drafts = JSON.parse(localStorage.getItem('documentDrafts') || '{}');
      drafts[document.metadata.documentId] = updatedDocument;
      localStorage.setItem('documentDrafts', JSON.stringify(drafts));

      // Here we would integrate with an e-filing service API
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        message: 'Document submitted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit document'
      };
    }
  }

  private generateDocumentId(): string {
    return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private replacePlaceholders(content: string, data: any): string {
    return content.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  async saveDocumentDraft(document: DocumentData): Promise<void> {
    try {
      // Here we would typically save to a backend service
      // For now, we'll save to localStorage
      const drafts = JSON.parse(localStorage.getItem('documentDrafts') || '{}');
      drafts[document.metadata.documentId] = document;
      localStorage.setItem('documentDrafts', JSON.stringify(drafts));
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw error;
    }
  }

  async getDraft(documentId: string): Promise<DocumentData | null> {
    try {
      const drafts = JSON.parse(localStorage.getItem('documentDrafts') || '{}');
      return drafts[documentId] || null;
    } catch (error) {
      console.error('Failed to get draft:', error);
      return null;
    }
  }

  async getAllDrafts(): Promise<DocumentData[]> {
    try {
      const drafts = JSON.parse(localStorage.getItem('documentDrafts') || '{}');
      return Object.values(drafts);
    } catch (error) {
      console.error('Failed to get drafts:', error);
      return [];
    }
  }

  getDocumentTitle(type: DocumentData['type']): string {
    return this.templates[type].title;
  }

  async deleteDraft(documentId: string): Promise<void> {
    try {
      const drafts = JSON.parse(localStorage.getItem('documentDrafts') || '{}');
      delete drafts[documentId];
      localStorage.setItem('documentDrafts', JSON.stringify(drafts));
    } catch (error) {
      console.error('Failed to delete draft:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService(); 