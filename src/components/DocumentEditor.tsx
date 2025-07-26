import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { createDocumentInDB, updateDocumentInDB } from '../features/documents/documentsSlice';
import { DocumentData } from '../services/documents.service';
import { generateDocument, getSuggestions } from '../services/ai.service';
import { Asset, Liability, UserProfile } from '../features/user/userSlice';

type DocumentType = 'will' | 'trust' | 'living-will' | 'power-of-attorney';

interface UserProfileData {
  name: string;
  state: string;
  assets: Asset[];
  liabilities: Liability[];
}

interface LocalDocumentData {
  userProfile: UserProfileData;
  content: string;
  type: DocumentType;
}

interface DocumentEditorProps {
  type: DocumentType;
  existingDocument?: DocumentData;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ type, existingDocument }) => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.user);
  const [documentData, setDocumentData] = useState<LocalDocumentData>({
    userProfile: {
      name: '',
      state: '',
      assets: [],
      liabilities: []
    },
    content: existingDocument?.content || '',
    type: type
  });
  const [title, setTitle] = useState(existingDocument?.title || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDocumentData({
        ...documentData,
        userProfile: {
          name: profile.name,
          state: profile.address.state,
          assets: profile.financialInfo?.assets ?? [],
          liabilities: profile.financialInfo?.liabilities ?? []
        }
      });
    }
  }, [profile]);

  useEffect(() => {
    if (documentData.content && profile) {
      const fetchSuggestions = async () => {
        try {
          const newSuggestions = await getSuggestions(documentData.type, profile, documentData.content);
          setSuggestions(newSuggestions);
        } catch (err) {
          console.error('Error fetching suggestions:', err);
        }
      };

      const debounce = setTimeout(fetchSuggestions, 1000);
      return () => clearTimeout(debounce);
    }
  }, [documentData.content, profile, documentData.type]);

  const handleGenerate = async () => {
    if (!profile) {
      setError('Please complete your profile first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateDocument(documentData);

      setDocumentData({
        ...documentData,
        content: response.content
      });
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }
    } catch (err) {
      setError('Failed to generate document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!title) {
      setError('Please enter a title for your document');
      return;
    }

    const DEMO_USER_UID = 'ec540338-923f-400d-a185-6028c5d5f823';
    
    const documentPayload: Omit<DocumentData, 'id' | 'created_at' | 'updated_at'> = {
      user_id: DEMO_USER_UID,
      document_type: documentData.type as any,
      title,
      status: 'draft',
      content: { raw_content: documentData.content },
      current_step: 0,
      total_steps: 5,
      progress_percentage: 20
    };

    if (existingDocument) {
      dispatch(updateDocumentInDB({ 
        documentId: existingDocument.id!, 
        updates: documentPayload 
      }) as any);
    } else {
      dispatch(createDocumentInDB(documentPayload) as any);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document Title"
          className="input-field text-xl font-bold"
        />
        <div className="space-x-4">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Generating...' : 'Generate with AI'}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary"
          >
            Save
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <textarea
            value={documentData.content}
            onChange={(e) => setDocumentData({ ...documentData, content: e.target.value })}
            className="input-field h-[600px] font-mono"
            placeholder="Start typing or generate content with AI..."
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">AI Suggestions</h3>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-4 bg-primary-50 rounded-md cursor-pointer hover:bg-primary-100"
              onClick={() => setDocumentData({ ...documentData, content: documentData.content + '\n' + suggestion })}
            >
              <p className="text-sm text-gray-700">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor; 