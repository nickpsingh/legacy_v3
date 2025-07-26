export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  documentId?: string;
  documentType?: string;
}

export interface DocumentData {
  id?: string;
  title?: string;
  document_type: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  progress_percentage?: number;
  content?: any;
}

export const generateNotificationsFromDocuments = (documents: DocumentData[]): Notification[] => {
  const notifications: Notification[] = [];
  const now = new Date();

  documents.forEach((doc) => {
    if (!doc.id || !doc.created_at || !doc.updated_at) return; // Skip documents without required fields
    
    const updatedDate = new Date(doc.updated_at);
    const createdDate = new Date(doc.created_at);
    const daysSinceUpdate = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    // Status-based notifications
    switch (doc.status) {
      case 'completed':
      case 'submitted':
        notifications.push({
          id: `${doc.id}-completed`,
          title: 'Document Completed',
          message: `Your ${getDocumentDisplayName(doc.document_type)} has been successfully ${doc.status}.`,
          type: 'success',
          timestamp: doc.updated_at,
          read: false,
          documentId: doc.id,
          documentType: doc.document_type
        });
        break;

      case 'in_progress':
        if (daysSinceUpdate > 7) {
          notifications.push({
            id: `${doc.id}-stale`,
            title: 'Document Needs Attention',
            message: `Your ${getDocumentDisplayName(doc.document_type)} hasn't been updated in ${daysSinceUpdate} days. Consider completing it soon.`,
            type: 'warning',
            timestamp: doc.updated_at,
            read: false,
            documentId: doc.id,
            documentType: doc.document_type
          });
        } else {
          notifications.push({
            id: `${doc.id}-progress`,
            title: 'Document In Progress',
            message: `Your ${getDocumentDisplayName(doc.document_type)} is ${doc.progress_percentage || 0}% complete.`,
            type: 'info',
            timestamp: doc.updated_at,
            read: false,
            documentId: doc.id,
            documentType: doc.document_type
          });
        }
        break;

      case 'draft':
        if (daysSinceCreation > 3) {
          notifications.push({
            id: `${doc.id}-draft-reminder`,
            title: 'Complete Your Document',
            message: `You started your ${getDocumentDisplayName(doc.document_type)} ${daysSinceCreation} days ago. Complete it to secure your family's future.`,
            type: 'info',
            timestamp: doc.created_at,
            read: false,
            documentId: doc.id,
            documentType: doc.document_type
          });
        }
        break;

      case 'review_required':
        notifications.push({
          id: `${doc.id}-review`,
          title: 'Document Requires Review',
          message: `Your ${getDocumentDisplayName(doc.document_type)} needs review before it can be finalized.`,
          type: 'warning',
          timestamp: doc.updated_at,
          read: false,
          documentId: doc.id,
          documentType: doc.document_type
        });
        break;
    }

    // Recent updates notification
    if (daysSinceUpdate <= 1 && doc.status !== 'draft') {
      notifications.push({
        id: `${doc.id}-recent-update`,
        title: 'Recent Document Update',
        message: `Your ${getDocumentDisplayName(doc.document_type)} was updated recently.`,
        type: 'info',
        timestamp: doc.updated_at,
        read: false,
        documentId: doc.id,
        documentType: doc.document_type
      });
    }
  });

  // Sort notifications by timestamp (most recent first)
  return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getDocumentDisplayName = (documentType: string): string => {
  const displayNames: { [key: string]: string } = {
    'will': 'Last Will and Testament',
    'living-trust': 'Living Trust',
    'power-of-attorney': 'Power of Attorney',
    'living-will': 'Living Will',
    'trust': 'Trust',
    'poa': 'Power of Attorney'
  };
  
  return displayNames[documentType] || documentType.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getNotificationColor = (type: Notification['type']): string => {
  switch (type) {
    case 'success':
      return 'bg-green-500/10 text-green-500';
    case 'error':
      return 'bg-red-500/10 text-red-500';
    case 'warning':
      return 'bg-yellow-500/10 text-yellow-500';
    default:
      return 'bg-blue-500/10 text-blue-500';
  }
};

export const formatNotificationDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}; 