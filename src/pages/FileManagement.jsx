import { useState, useEffect } from 'react';
import { fileService } from '../services/FileService';

export default function FilesManagement({ projectId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('other');

  useEffect(() => {
    if (projectId) {
      loadFiles();
    }
  }, [projectId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await fileService.getProjectFiles(projectId);
      setFiles(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await fileService.uploadFile(projectId, selectedFile, fileType);
      setSelectedFile(null);
      setFileType('other');
      loadFiles();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('¿Eliminar este archivo?')) return;

    try {
      await fileService.deleteFile(projectId, fileId);
      loadFiles();
    } catch (err) {
      setError(err.message);
    }
  };

  const getFileIcon = (type) => {
    const icons = {
      log: '📄',
      report: '📊',
      credentials: '🔑',
      screenshot: '📸',
      exploit: '💣',
      other: '📁'
    };
    return icons[type] || '📁';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) {
    return <div className="text-cyan-400">Cargando archivos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">Subir Archivo</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Seleccionar archivo</label>
            <input
              type="file"
              onChange={handleFileSelect}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Tipo de archivo</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="log">Log</option>
              <option value="report">Reporte</option>
              <option value="credentials">Credenciales</option>
              <option value="screenshot">Captura de pantalla</option>
              <option value="exploit">Exploit</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {uploading ? 'Subiendo...' : 'Subir Archivo'}
          </button>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">
          Archivos del Proyecto ({files.length})
        </h3>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {files.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No hay archivos en este proyecto
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-cyan-500 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-3xl">{getFileIcon(file.file_type)}</span>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{file.original_filename}</p>
                    <p className="text-gray-400 text-sm">
                      {formatFileSize(file.file_size)} • {file.file_type} • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`/api/projects/${projectId}/files/${file.id}/download`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Descargar
                  </a>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
