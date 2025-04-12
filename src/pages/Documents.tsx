import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Document {
  id: number;
  type: string;
  title: string;
  status: 'Draft' | 'In Review' | 'Completed' | 'Signed';
  lastModified: string;
  progress?: number;
}

const Documents: React.FC = () => {
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  const documents: Document[] = [
    {
      id: 1,
      type: 'Will',
      title: 'Last Will and Testament',
      status: 'Draft',
      lastModified: '2024-03-20',
      progress: 60
    },
    {
      id: 2,
      type: 'Trust',
      title: 'Living Trust',
      status: 'In Review',
      lastModified: '2024-03-19',
      progress: 90
    },
    {
      id: 3,
      type: 'Power of Attorney',
      title: 'Durable Power of Attorney',
      status: 'Completed',
      lastModified: '2024-03-15'
    },
    {
      id: 4,
      type: 'Living Will',
      title: 'Living Will',
      status: 'Signed',
      lastModified: '2024-03-10'
    }
  ];

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'Draft':
        return 'bg-yellow-500';
      case 'In Review':
        return 'bg-blue-500';
      case 'Completed':
        return 'bg-green-500';
      case 'Signed':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const documentTypes = [
    { name: 'Last Will and Testament', path: '/will/create' },
    { name: 'Living Trust', path: '/trust/create' },
    { name: 'Power of Attorney', path: '/poa/create' },
    { name: 'Living Will', path: '/living-will/create' }
  ];

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
            <div className="absolute right-0 mt-2 w-64 bg-[#1A1B1E] rounded-md shadow-lg z-10">
              {documentTypes.map((docType) => (
                <Link
                  key={docType.path}
                  to={docType.path}
                  className="block px-4 py-2 text-sm text-[#989AA1] hover:bg-[#2D2F34] hover:text-white transition-colors"
                >
                  {docType.name}
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
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(doc.status)} mr-2`} />
                    <span className="text-[#989AA1]">{doc.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-[#989AA1]">{doc.lastModified}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end space-x-4">
                    <button className="text-[#989AA1] hover:text-white transition-colors">
                      View
                    </button>
                    {doc.status !== 'Signed' && (
                      <button className="text-[#989AA1] hover:text-white transition-colors">
                        Edit
                      </button>
                    )}
                    <button className="text-[#989AA1] hover:text-white transition-colors">
                      Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Documents; 