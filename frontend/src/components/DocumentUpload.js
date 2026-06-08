import React from 'react';

const DocumentUpload = ({ onUpload, loading }) => {
  const [file, setFile] = React.useState(null);
  const fileInputRef = React.useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await onUpload(formData);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer bg-slate-900/20"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-2xl mb-3">📄</div>
        <p className="text-slate-100 font-medium">
          {file ? file.name : 'Click to upload or drag a PDF'}
        </p>
        <p className="text-sm text-slate-400">Maximum file size: 10MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {file && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-gradient-to-br from-blue-500 to-blue-700 text-white px-4 py-2 rounded-md"
        >
          {loading ? 'Uploading...' : 'Upload PDF'}
        </button>
      )}
    </div>
  );
};

export default DocumentUpload;
