import React from 'react';
import { Link } from 'react-router-dom';

const CompletedDocuments: React.FC = () => {
  // This would typically fetch from your state management
  const completedDocuments = [
    {
      id: 1,
      type: 'Will',
      title: 'Last Will and Testament',
      completedDate: '2024-03-15',
      status: 'Signed',
      reviewedByLawyer: true
    },
    {
      id: 2,
      type: 'Power of Attorney',
      title: 'Durable Power of Attorney',
      completedDate: '2024-03-10',
      status: 'Pending Signature',
      reviewedByLawyer: true
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-2">Completed Documents</h1>
        <p className="text-[#989AA1]">View and manage your completed documents</p>
      </div>

      {completedDocuments.length === 0 ? (
        <div className="text-center py-12 bg-[#101113] rounded-lg">
          <p className="text-[#989AA1] mb-4">No completed documents</p>
          <Link
            to="/documents"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Create New Document
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {completedDocuments.map((doc) => (
            <div key={doc.id} className="bg-[#101113] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium">{doc.title}</h3>
                  <p className="text-[#989AA1] text-sm">Completed: {doc.completedDate}</p>
                </div>
                <div className="text-right">
                  <span className="text-[#989AA1] text-sm">{doc.type}</span>
                  <div className="mt-1">
                    {doc.reviewedByLawyer && (
                      <span className="inline-flex items-center text-xs bg-[#1D1F23] text-[#989AA1] px-2 py-1 rounded">
                        👨‍⚖️ Lawyer Reviewed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    doc.status === 'Signed' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-[#989AA1] text-sm">{doc.status}</span>
                </div>

                <div className="flex space-x-4">
                  <button className="text-[#989AA1] hover:text-white transition-colors">
                    Download PDF
                  </button>
                  <button className="text-[#989AA1] hover:text-white transition-colors">
                    Share
                  </button>
                  {doc.status !== 'Signed' && (
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                      Sign Document
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedDocuments; 