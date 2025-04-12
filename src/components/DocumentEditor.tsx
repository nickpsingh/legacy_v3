import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addDocument, updateDocument } from '../features/documents/documentsSlice';
import { generateDocument, getSuggestions } from '../services/ai.service';

interface DocumentEditorProps {
  type: 'will' | 'trust' | 'power-of-attorney' | 'living-will';
  existingDocument?: {
    id: string;
    content: string;
    title: string;
    createdAt: string;
  };
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ type, existingDocument }) => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.user);
  const [content, setContent] = useState(existingDocument?.content || '');
  const [title, setTitle] = useState(existingDocument?.title || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (content && profile) {
      const fetchSuggestions = async () => {
        try {
          const newSuggestions = await getSuggestions(type, profile, content);
          setSuggestions(newSuggestions);
        } catch (err) {
          console.error('Error fetching suggestions:', err);
        }
      };

      const debounce = setTimeout(fetchSuggestions, 1000);
      return () => clearTimeout(debounce);
    }
  }, [content, profile, type]);

  const handleGenerate = async () => {
    if (!profile) {
      setError('Please complete your profile first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateDocument({
        type,
        userProfile: {
          name: profile.name,
          state: profile.state,
          assets: profile.financialInfo.assets,
          liabilities: profile.financialInfo.liabilities
        }
      });

      setContent(response.content);
      setSuggestions(response.suggestions);
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

    const document = {
      id: existingDocument?.id || Date.now().toString(),
      title,
      type,
      content,
      createdAt: existingDocument?.id ? existingDocument.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingDocument) {
      dispatch(updateDocument(document));
    } else {
      dispatch(addDocument(document));
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
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
              onClick={() => setContent(content + '\n' + suggestion)}
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