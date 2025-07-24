import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { documentService, DocumentData } from '../services/document.service';
import ConfirmationModal from '../components/ConfirmationModal';
import { useSnackbar } from 'notistack';

interface Document extends DocumentData {
  id: string;
  title: string;
  progress?: number;
}

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const drafts = await documentService.getAllDrafts();
      const formattedDocs = drafts.map(doc => ({
        ...doc,
        id: doc.metadata.documentId,
        title: documentService.getDocumentTitle(doc.type),
        progress: calculateProgress(doc)
      }));
      setDocuments(formattedDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const calculateProgress = (doc: DocumentData): number => {
    // Simple progress calculation based on content completeness
    if (!doc.content) return 0;
    const totalFields = Object.keys(doc.content).length;
    const completedFields = Object.values(doc.content).filter(value => value !== undefined && value !== '').length;
    return Math.round((completedFields / totalFields) * 100);
  };

  const handleView = async (doc: Document) => {
    try {
      const blob = await documentService.generatePDF(doc);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error viewing document:', error);
    }
  };

  const handleEdit = (doc: Document) => {
    // Map document types to their correct edit routes
    const routeMap = {
      'will': '/will/create',
      'living-trust': '/trust/create',
      'power-of-attorney': '/poa/create',
      'living-will': '/living-will/create'
    };
    navigate(`${routeMap[doc.type]}?id=${doc.id}`);
  };

  const handleDownload = async (doc: Document) => {
    try {
      const blob = await documentService.generatePDF(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleDelete = async (doc: Document) => {
    setDocumentToDelete(doc);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await documentService.deleteDraft(documentToDelete.id);
      setDocuments(documents.filter(doc => doc.id !== documentToDelete.id));
      enqueueSnackbar('Document deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting document:', error);
      enqueueSnackbar('Failed to delete document', { variant: 'error' });
    } finally {
      setDocumentToDelete(null);
    }
  };

  const getStatusColor = (status: DocumentData['metadata']['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'submitted':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusDisplay = (status: DocumentData['metadata']['status']): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const documentTypes = [
    { 
      name: 'Last Will and Testament', 
      path: '/will/create',
      description: 'Distribute your assets and name guardians for minor children'
    },
    { 
      name: 'Living Trust', 
      path: '/trust/create',
      description: 'Avoid probate and manage assets during your lifetime and after death'
    },
    { 
      name: 'Power of Attorney', 
      path: '/poa/create',
      description: 'Authorize someone to make financial and legal decisions on your behalf'
    },
    { 
      name: 'Living Will', 
      path: '/living-will/create',
      description: 'Document your medical treatment preferences if you cannot communicate'
    }
  ];

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-2">My Documents</h1>
          <p className="text-[#989AA1]">Manage your estate planning documents</p>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Create New Document
          </button>
          
          {isCreateMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1A1B1E] rounded-md shadow-lg z-10">
              {documentTypes.map((docType) => (
                <Link
                  key={docType.path}
                  to={docType.path}
                  className="block px-4 py-3 text-sm hover:bg-[#2D2F34] transition-colors border-b border-[#2D2F34] last:border-0"
                >
                  <div className="text-white font-medium">{docType.name}</div>
                  <div className="text-[#989AA1] text-xs mt-1 leading-relaxed">{docType.description}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#101113] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1D1F23]">
              <th className="text-left px-6 py-4 text-sm font-medium text-[#989AA1]">Document</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#989AA1]">Type</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#989AA1]">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#989AA1]">Last Modified</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-[#989AA1]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-[#1D1F23] last:border-0">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-white font-medium">{doc.title}</div>
                    {doc.progress !== undefined && (
                      <div className="mt-1 w-32">
                        <div className="w-full bg-[#1D1F23] rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ width: `${doc.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-[#989AA1]">{doc.type}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(doc.metadata.status)} mr-2`} />
                    <span className="text-[#989AA1]">{getStatusDisplay(doc.metadata.status)}</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-[#989AA1]">
                  <span title={new Date(doc.metadata.updatedAt).toLocaleString()}>
                    {formatDate(doc.metadata.updatedAt)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center space-x-3">
                    <button
                      onClick={() => handleView(doc)}
                      className="text-[#989AA1] hover:text-white transition-colors"
                      title="View"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEdit(doc)}
                      className="text-[#989AA1] hover:text-white transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="text-[#989AA1] hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Documents; 