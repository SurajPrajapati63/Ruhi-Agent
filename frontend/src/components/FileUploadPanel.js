import React, { useEffect, useMemo, useState } from 'react';
import { useChatStore } from '../store/chatStore';
// import './FileUploadPanel.css';

const allowedFileTypes = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

const FileUploadPanel = () => {
  const {
    fileHistory,
    fileLoading,
    loadFileHistory,
    deleteFile,
    uploadFile,
    error,
  } = useChatStore();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const [fileNote, setFileNote] = useState('');

  useEffect(() => {
    loadFileHistory();
  }, [loadFileHistory]);

  const handleSelectFiles = (files) => {
    const validated = Array.from(files).filter((file) => allowedFileTypes.includes(file.type));
    setSelectedFiles(validated);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    handleSelectFiles(files);
  };

  const handleUpload = async () => {
    const note = fileNote.trim();
    for (const file of selectedFiles) {
      setProgress((prev) => ({ ...prev, [file.name]: 0 }));
      try {
        await uploadFile(file, note, (percent) => {
          setProgress((prev) => ({ ...prev, [file.name]: percent }));
        });
      } catch (err) {
        console.error(err);
      }
    }
    setSelectedFiles([]);
    setFileNote('');
    setProgress({});
    await loadFileHistory();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this uploaded file?')) {
      await deleteFile(id);
    }
  };

  const selectedCount = selectedFiles.length;

  return (
    <div className="w-full max-w-[420px] bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
      <div className="upload-panel-header">
        <h2 className="text-lg text-slate-100">Upload Documents & Images</h2>
        <p className="text-sm text-slate-400">Drop files here or select from disk. PDF, TXT, DOCX, PNG, JPG, and WEBP are supported.</p>
      </div>

      <div
        className="min-h-[170px] border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-center p-6 bg-slate-900/20 relative cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <p className="text-slate-400">Drag and drop files here</p>
        <input
          type="file"
          multiple
          accept={allowedFileTypes.join(',')}
          onChange={(e) => handleSelectFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {selectedCount > 0 && (
        <div className="mt-4">
          <h3 className="text-sm text-slate-100">{selectedCount} file{selectedCount > 1 ? 's' : ''} ready to upload</h3>
          {selectedFiles.map((file) => (
            <div key={file.name} className="flex justify-between items-center gap-4 py-2 border-b border-slate-700">
              <span className="text-sm text-slate-200">{file.name}</span>
              <span className="text-xs text-slate-400">{Math.round(file.size / 1024)} KB</span>
            </div>
          ))}
          <div className="mt-3 space-y-3">
            <input
              type="text"
              value={fileNote}
              onChange={(e) => setFileNote(e.target.value)}
              placeholder="Optional note to attach with selected files"
              className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleUpload} className="bg-gradient-to-br from-blue-500 to-blue-700 text-white px-3 py-2 rounded-md">Upload Files</button>
          </div>
        </div>
      )}

      {error && <div className="mt-3 text-sm text-red-400">{error}</div>}

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm text-slate-100">Uploaded Files</h3>
          <span className="text-xs text-slate-400">{fileHistory.length} items</span>
        </div>

        {fileLoading ? (
          <div className="text-sm text-slate-400">Loading upload history...</div>
        ) : fileHistory.length === 0 ? (
          <div className="text-sm text-slate-400">No uploaded files yet.</div>
        ) : (
          fileHistory.map((file) => (
            <div key={file._id} className="flex items-center justify-between gap-4 py-2 border-b border-slate-700">
              <div>
                <strong className="text-sm text-slate-100">{file.originalName}</strong>
                <p className="text-xs text-slate-400">{file.type === 'image' ? 'Image' : 'Document'} • {Math.round(file.size / 1024)} KB</p>
                {file.note && <p className="text-xs text-slate-400 italic">Note: {file.note}</p>}
              </div>
              <div className="flex items-center gap-3">
                {file.url && (
                  <a href={file.url} target="_blank" rel="noreferrer" className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md">View</a>
                )}
                <button onClick={() => handleDelete(file._id)} className="text-sm px-3 py-1 bg-red-500 text-white rounded-md">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Per-file progress slider hidden to simplify dashboard UI */}
    </div>
  );
};

export default FileUploadPanel;
