import React from 'react';
import { Link } from 'react-router-dom';

const DocumentDrafts: React.FC = () => {
  // This would typically fetch from your state management
  const draftDocuments = [
    {
      id: 1,
      type: 'Will',
      title: 'Last Will and Testament',
      lastEdited: '2024-03-20',
      progress: 60
    },
    {
      id: 2,
      type: 'Trust',
      title: 'Living Trust',
      lastEdited: '2024-03-19',
      progress: 30
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-2">In Progress Documents</h1>
        <p className="text-[#989AA1]">Continue working on your draft documents</p>
      </div>

      {draftDocuments.length === 0 ? (
        <div className="text-center py-12 bg-[#101113] rounded-lg">
          <p className="text-[#989AA1] mb-4">No documents in progress</p>
          <Link
            to="/documents"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Create New Document
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {draftDocuments.map((doc) => (
            <div key={doc.id} className="bg-[#101113] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium">{doc.title}</h3>
                  <p className="text-[#989AA1] text-sm">Last edited: {doc.lastEdited}</p>
                </div>
                <span className="text-[#989AA1] text-sm">{doc.type}</span>
              </div>
              
              <div className="mb-4">
                <div className="w-full bg-[#1D1F23] rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${doc.progress}%` }}
                  />
                </div>
                <p className="text-[#989AA1] text-sm mt-2">{doc.progress}% complete</p>
              </div>

              <div className="flex justify-end space-x-4">
                <button className="text-[#989AA1] hover:text-white transition-colors">
                  Delete
                </button>
                <Link
                  to={`/${doc.type.toLowerCase()}/create`}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Continue
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentDrafts; 