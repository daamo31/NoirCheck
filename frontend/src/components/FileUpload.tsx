/**
 * File Upload Component
 * 
 * A comprehensive file upload component that handles both content registration
 * and verification workflows. Supports drag-and-drop, file preview, progress
 * tracking, and detailed result display.
 * 
 * Features:
 * - Dual mode: Registration and Verification
 * - Drag-and-drop file upload
 * - Real-time file preview for images
 * - Upload progress tracking
 * - Detailed verification results
 * - Error handling and validation
 * - Responsive design with modern UI
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, FileCheck, Shield, AlertTriangle } from 'lucide-react';
import { apiService } from '@/services/api';
import type { ContentRegistration, ContentVerification, UploadProgress } from '@/types';

interface FileUploadProps {
  mode: 'register' | 'verify';
}

export function FileUpload({ mode }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [description, setDescription] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [result, setResult] = useState<ContentRegistration | ContentVerification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateFilePreview = useCallback((selectedFile: File) => {
    // Clean previous preview
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }

    if (selectedFile.type.startsWith('image/')) {
      // For images, create an object URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setFilePreview(objectUrl);
    } else {
      // For other file types, don't show preview
      setFilePreview(null);
    }
  }, [filePreview]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      generateFilePreview(selectedFile);
      setResult(null);
      setError(null);
    }
  }, [generateFilePreview]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      generateFilePreview(droppedFile);
      setResult(null);
      setError(null);
    }
  }, [generateFilePreview]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  // Clean preview when component unmounts
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const processFile = async () => {
    if (!file) return;
    
    try {
      setError(null);
      setResult(null);
      
      // Initialize progress tracking
      setProgress({
        percentage: 10,
        status: 'uploading',
        message: 'Uploading file...',
      });

      // Branch processing based on operation mode
      if (mode === 'register') {
        // REGISTRATION FLOW
        // Step 1: Update progress to show blockchain registration starting
        setProgress({
          percentage: 50,
          status: 'processing',
          message: 'Registering on XION blockchain...',
        });
        
        // Step 2: Call backend API to register content with XION integration
        // This will: calculate hash, store file, register on blockchain, create DB record
        const registration = await apiService.registerContent(file, description, creatorId);
        
        // Step 3: Complete registration and show success
        setProgress({
          percentage: 100,
          status: 'complete',
          message: 'Content registered on XION blockchain',
        });
        
        setResult(registration);
      } else {
        // VERIFICATION FLOW
        // Step 1: Update progress to show verification starting
        setProgress({
          percentage: 50,
          status: 'verifying',
          message: 'Verifying with XION...',
        });
        
        // Step 2: Call backend API to verify content authenticity
        // This will: calculate hash, check blockchain, analyze modifications, verify source
        const verification = await apiService.verifyContent(file, sourceUrl || undefined);
        
        // Step 3: Complete verification and show results
        setProgress({
          percentage: 100,
          status: 'complete',
          message: verification.blockchain_verified 
            ? 'Verified on XION blockchain' 
            : 'Verification completed',
        });
        
        setResult(verification);
      }
    } catch (err) {
      // Error handling: log error and update UI state
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProgress({
        percentage: 0,
        status: 'error',
        message: 'Processing error',
      });
    }
  };

  const isRegistration = mode === 'register';
  const isVerification = mode === 'verify';

  return (
    <div className="w-full space-y-6">
      {/* File upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
      >
        <input
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          {file && filePreview ? (
            // Image preview display
            <div className="space-y-4">
              <div className="relative mx-auto w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={filePreview}
                  alt="File preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-700 dark:text-gray-300">📎 {file.name}</p>
                <p className="text-gray-500 dark:text-gray-400">
                  {file.type || 'Unknown file type'}
                </p>
              </div>
            </div>
          ) : file ? (
            // Non-image file preview
            <div className="space-y-4">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                {file.type.includes('pdf') ? (
                  <span className="text-red-500 text-2xl">📄</span>
                ) : file.type.includes('video') ? (
                  <span className="text-blue-500 text-2xl">🎥</span>
                ) : file.type.includes('document') || file.type.includes('text') ? (
                  <span className="text-green-500 text-2xl">📝</span>
                ) : (
                  <span className="text-gray-500 text-2xl">📎</span>
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-700 dark:text-gray-300">📎 {file.name}</p>
                <p className="text-gray-500 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}
                </p>
              </div>
            </div>        ) : (
          // Initial state - no file selected
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">
              {isRegistration ? '📤 Register Content' : '🔍 Verify Content'}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Drag and drop a file here, or click to select
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Supports: Images, Videos, PDFs, Documents
            </p>
          </div>
        )}
      </label>
    </div>

    {/* File change button */}
    {file && (
      <div className="text-center">
        <button
          onClick={() => {
            setFile(null);
            setFilePreview(null);
            setResult(null);
            setError(null);
            // Reset file input
            const input = document.getElementById('file-input') as HTMLInputElement;
            if (input) input.value = '';
          }}
          className="inline-flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          🗑️ Change file
        </button>
      </div>
    )}

    {/* Registration fields */}
    {isRegistration && (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📝 Content description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your original content..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            👤 Creator ID
          </label>
          <input
            type="text"
            value={creatorId}
            onChange={(e) => setCreatorId(e.target.value)}
            placeholder="your-username-or-email"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Unique identifier to register authorship on XION
          </p>
        </div>
      </div>
    )}

    {/* Source URL field (verification only) */}
    {isVerification && (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          🌐 Source URL (optional)
        </label>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://example.com/article"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          To verify web source with zkTLS
        </p>
      </div>
    )}

    {/* Action button */}
    <button
      onClick={processFile}
      disabled={
        !file || 
        (isRegistration && (!description.trim() || !creatorId.trim())) ||
        progress?.status === 'uploading' || 
        progress?.status === 'processing' || 
        progress?.status === 'verifying'
      }
      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
    >
      {progress?.status === 'uploading' || progress?.status === 'processing' || progress?.status === 'verifying' ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {progress.message}
        </>
      ) : (
        <>
          {isRegistration ? <Shield className="h-4 w-4 mr-2" /> : <FileCheck className="h-4 w-4 mr-2" />}
          {isRegistration ? 'Register on XION' : 'Verify with XION'}
        </>
      )}
    </button>

      {/* Progress bar */}
      {progress && (
        <div className="w-full">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>{progress.message}</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progress.status === 'error' ? 'bg-red-500' : 
                progress.status === 'complete' ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Display Results Section */}
      {/* Shows either registration success or verification results */}
      {result && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          {isRegistration ? (
            // Registration Success: Show blockchain transaction details
            <RegistrationResult result={result as ContentRegistration} />
          ) : (
            // Verification Results: Show authenticity analysis
            <VerificationResult result={result as ContentVerification} />
          )}
        </div>
      )}

      {/* Error Display Section */}
      {/* Shows any errors that occurred during processing */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">Error: {error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function RegistrationResult({ result }: { result: ContentRegistration }) {
  return (
    <div>
      <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
        ✅ Content registered on XION blockchain
      </h3>
      <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
        <p>🔗 <strong>Transaction hash:</strong> {result.blockchain_tx}</p>
        <p>📅 <strong>Registered:</strong> {new Date(result.timestamp).toLocaleString()}</p>
        <p>🔐 <strong>File hash:</strong> {result.hash}</p>
        <p>📄 <strong>File:</strong> {result.filename} ({(result.file_size / 1024 / 1024).toFixed(2)} MB)</p>
      </div>
    </div>
  );
}

function VerificationResult({ result }: { result: ContentVerification }) {
  const confidenceColor = result.confidence >= 0.8 ? 'text-green-600' : 
                          result.confidence >= 0.5 ? 'text-yellow-600' : 'text-red-600';

  // Determine the appropriate status and message
  const getVerificationStatus = () => {
    if (result.blockchain_verified && result.confidence >= 0.8) {
      return {
        icon: '✅',
        status: 'Authentic content verified',
        description: 'This content is registered on XION blockchain',
        color: 'text-green-700 dark:text-green-300'
      };
    } else if (result.confidence === 0.0) {
      return {
        icon: '❌',
        status: 'Content not registered',
        description: 'This content is not found on the blockchain or may have been modified',
        color: 'text-red-700 dark:text-red-300'
      };
    } else {
      return {
        icon: '⚠️',
        status: 'Partial verification',
        description: 'Partial matches found, content may have been modified',
        color: 'text-yellow-700 dark:text-yellow-300'
      };
    }
  };

  const status = getVerificationStatus();

  return (
    <div>
      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
        🔍 Verification Result
      </h3>
      <div className="space-y-3 text-sm">
        {/* Main status */}
        <div className="p-3 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-800/50" 
             style={{ borderLeftColor: result.blockchain_verified ? '#10B981' : '#EF4444' }}>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{status.icon}</span>
            <span className={`font-semibold ${status.color}`}>
              {status.status}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">
            {status.description}
          </p>
        </div>

        {/* Technical details */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span>📊</span>
            <span className={confidenceColor}>
              <strong>Confidence level:</strong> {(result.confidence * 100).toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span>🔗</span>
            <span className="text-gray-700 dark:text-gray-300">
              <strong>File hash:</strong> 
              <code className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                {result.hash?.substring(0, 16)}...
              </code>
            </span>
          </div>
        </div>

        {result.blockchain_tx && (
          <p className="text-gray-700 dark:text-gray-300">
            🔗 <strong>Transaction hash:</strong> {result.blockchain_tx}
          </p>
        )}

        {result.registration_date && (
          <p className="text-gray-700 dark:text-gray-300">
            📅 <strong>Registration date:</strong> {new Date(result.registration_date).toLocaleString()}
          </p>
        )}

        {result.creator_id && (
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-blue-700 dark:text-blue-300">
              👤 <strong>Registered by:</strong> {result.creator_id}
            </p>
            {result.description && (
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                📝 <strong>Description:</strong> {result.description}
              </p>
            )}
            {result.filename && (
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                📄 <strong>Original file:</strong> {result.filename}
              </p>
            )}
          </div>
        )}

        {result.source_verification && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-blue-700 dark:text-blue-300">
              🌐 <strong>Source verification:</strong> {result.source_verification.verified ? '✅ Verified' : '❌ Not verified'}
            </p>
            {result.source_verification.url && (
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                URL: {result.source_verification.url}
              </p>
            )}
          </div>
        )}

        {result.modifications && result.modifications.length > 0 && (
          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-700 dark:text-yellow-300">
              ⚠️ <strong>Detected modifications:</strong>
            </p>
            <ul className="text-yellow-600 dark:text-yellow-400 text-xs mt-1 ml-4">
              {result.modifications.map((mod, index) => (
                <li key={index}>• {mod}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Explanatory message for content not found */}
        {!result.blockchain_verified && result.confidence === 0.0 && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-blue-700 dark:text-blue-300 text-xs">
              💡 <strong>What does this mean?</strong><br/>
              • The file is not registered in NoirCheck<br/>
              • It may be original unregistered content<br/>
              • Or it may have been modified after registration<br/>
              • To verify authenticity, the creator must register the original content
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
