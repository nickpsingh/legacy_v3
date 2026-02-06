import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUserFromDB } from '../features/user/userSlice';
import { fetchAssetsFromDB } from '../features/assets/assetsSlice';
import { fetchLiabilitiesFromDB } from '../features/liabilities/liabilitiesSlice';
import { fetchPeopleFromDB } from '../features/people/peopleSlice';
import { fetchDocumentsFromDB } from '../features/documents/documentsSlice';
import DocumentViewer from '../components/DocumentViewer';
import { generateNotificationsFromDocuments } from '../services/notifications.service';
import { FiArrowRight } from 'react-icons/fi';

// Create a properly typed arrow icon component
const ArrowIcon = () => {
  const Icon = FiArrowRight as React.ComponentType<{ size?: number }>;
  return <Icon size={18} />;
};

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile } = useSelector((state: RootState) => state.user);
  const { assets } = useSelector((state: RootState) => state.assets);
  const { liabilities } = useSelector((state: RootState) => state.liabilities);
  const { documents } = useSelector((state: RootState) => state.documents);
  const [documentToView, setDocumentToView] = useState<any | null>(null);

  const DEMO_USER_UID = 'ec540338-923f-400d-a185-6028c5d5f823';

  // Load user first so we have profile.id (internal user id) for other fetches
  useEffect(() => {
    dispatch(fetchUserFromDB(DEMO_USER_UID) as any);
  }, [dispatch]);

  // Once we have the user (and thus internal id), load assets, liabilities, people, documents
  useEffect(() => {
    const userId = profile?.id ?? DEMO_USER_UID;
    if (!profile) return;
    dispatch(fetchAssetsFromDB(userId) as any);
    dispatch(fetchLiabilitiesFromDB(userId) as any);
    dispatch(fetchPeopleFromDB(userId) as any);
    dispatch(fetchDocumentsFromDB(userId) as any);
  }, [dispatch, profile?.id]);

  // Calculate financial summary from database data
  const totalAssets = [...assets].reduce((sum, asset) => sum + (asset.value || asset.amount || 0), 0);
  const totalLiabilities = [...liabilities].reduce((sum, liability) => sum + liability.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Generate notifications from actual documents
  const notifications = documents ? generateNotificationsFromDocuments(documents) : [];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Welcome back, {profile?.firstName || 'Guest'}</h1>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2 space-y-8">
            {/* Recent Activity */}
            <div className="bg-[#111] rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Recent Activity</h2>
                <button 
                  onClick={() => navigate('/notifications')}
                  className="text-blue-500 hover:text-blue-400 flex items-center gap-2"
                >
                  View All <ArrowIcon />
                </button>
              </div>
              <div className="space-y-4">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="bg-[#1A1A1A] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-200">{notification.message}</span>
                      <span className="text-gray-400 text-sm">{formatDate(notification.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Documents */}
            <div className="bg-[#111] rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">My Documents</h2>
                <button
                  onClick={() => navigate('/documents')}
                  className="text-blue-500 hover:text-blue-400 flex items-center gap-2"
                >
                  View All <ArrowIcon />
                </button>
              </div>
              <div className="space-y-4">
                {documents && documents.length > 0 ? (
                  documents.slice(0, 3).map((doc, index) => (
                    <div 
                      key={doc.id || index} 
                      className="bg-[#1A1A1A] rounded-lg p-4 cursor-pointer hover:bg-[#222] transition-colors"
                      onClick={() => setDocumentToView(doc)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-200">{doc.title || 'Untitled Document'}</span>
                        <span className={`px-2 py-1 rounded text-sm ${
                          doc.status === 'submitted' || doc.status === 'completed'
                            ? 'bg-green-900 text-green-200' 
                            : doc.status === 'in_progress'
                            ? 'bg-blue-900 text-blue-200'
                            : 'bg-yellow-900 text-yellow-200'
                        }`}>
                          {doc.status === 'submitted' ? 'Submitted' : 
                           doc.status === 'completed' ? 'Completed' :
                           doc.status === 'in_progress' ? 'In Progress' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                          Last updated {formatDate(doc.updated_at || doc.created_at || new Date().toISOString())}
                        </p>
                        <div className="text-xs text-gray-500">
                          {doc.progress_percentage || 0}% complete
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#1A1A1A] rounded-lg p-4 text-center">
                    <p className="text-gray-400 mb-2">No documents yet</p>
                    <Link to="/documents" className="text-blue-500 hover:text-blue-400 text-sm">
                      Create your first document →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Net Worth */}
          <div className="bg-[#111] rounded-xl p-4">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-1">Net Worth</h2>
              <p className="text-3xl font-bold">${netWorth.toLocaleString()}</p>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-400">Total Assets</p>
                  <Link to="/assets" className="text-blue-500 hover:text-blue-400 text-sm">View →</Link>
                </div>
                <p className="text-xl font-bold text-green-500">${totalAssets.toLocaleString()}</p>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-400">Total Liabilities</p>
                  <Link to="/liabilities" className="text-blue-500 hover:text-blue-400 text-sm">View →</Link>
                </div>
                <p className="text-xl font-bold text-red-500">${totalLiabilities.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={!!documentToView}
        onClose={() => setDocumentToView(null)}
        document={documentToView}
      />
    </div>
  );
};

export default Dashboard; 