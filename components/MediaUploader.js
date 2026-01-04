'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MediaUploader = ({ onMediaUploadComplete, propertyId, existingMedia = [] }) => {
  const [media, setMedia] = useState(existingMedia);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const dragZoneRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const isAllowedFile = (file) => {
    return ALLOWED_IMAGE_TYPES.includes(file.type);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    await uploadFiles(files);
  };

  const stageFiles = (fileArray) => {
    const staged = fileArray.map((file, idx) => ({
      id: `temp-${Date.now()}-${idx}`,
      previewUrl: URL.createObjectURL(file),
      file,
      media_type: 'image'
    }));
    setMedia(prev => {
      const next = [...prev, ...staged];
      onMediaUploadComplete(next);
      return next;
    });
  };

  const uploadFiles = async (files) => {
    setError('');

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`Arquivo ${file.name} é muito grande (máx: 10MB)`);
        return;
      }
      if (!isAllowedFile(file)) {
        setError(`Tipo de arquivo não suportado: ${file.name}`);
        return;
      }
    }

    if (!propertyId) {
      stageFiles(fileArray);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);

    try {
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${propertyId}/media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Erro ao fazer upload');
        }

        const data = await response.json();
        setMedia(prev => {
          const next = [...prev, data];
          onMediaUploadComplete(next);
          return next;
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInput = (e) => {
    uploadFiles(e.target.files);
  };

  const handleRemoveMedia = async (mediaId) => {
    const target = media.find(m => m.id === mediaId);

    if (!propertyId || target?.file) {
      setMedia(prev => {
        const next = prev.filter(m => m.id !== mediaId);
        onMediaUploadComplete(next);
        return next;
      });
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${propertyId}/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao deletar');

      setMedia(prev => {
        const next = prev.filter(m => m.id !== mediaId);
        onMediaUploadComplete(next);
        return next;
      });
    } catch (err) {
      setError('Erro ao deletar mídia');
    }
  };

  const handleUpdateOrder = async (mediaId, newOrder) => {
    if (!propertyId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${propertyId}/media/${mediaId}/order`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ display_order: newOrder })
      });

      if (!response.ok) throw new Error('Erro ao atualizar ordem');

      setMedia(prev =>
        prev.map(m => m.id === mediaId ? { ...m, display_order: newOrder } : m).sort((a, b) => a.display_order - b.display_order)
      );
    } catch (err) {
      setError('Erro ao atualizar ordem');
    }
  };

  const moveUp = (index) => {
    if (!propertyId) return;
    if (index > 0) {
      handleUpdateOrder(media[index].id, media[index - 1].display_order - 1);
    }
  };

  const moveDown = (index) => {
    if (!propertyId) return;
    if (index < media.length - 1) {
      handleUpdateOrder(media[index].id, media[index + 1].display_order + 1);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDropReorder = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newMedia = [...media];
    const [draggedItem] = newMedia.splice(draggedIndex, 1);
    newMedia.splice(dropIndex, 0, draggedItem);

    setMedia(newMedia);
    onMediaUploadComplete(newMedia);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Atualizar ordem no backend se houver propertyId
    if (propertyId) {
      try {
        for (let i = 0; i < newMedia.length; i++) {
          if (newMedia[i].id && !newMedia[i].file) {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${propertyId}/media/${newMedia[i].id}/order`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ display_order: i })
            });
          }
        }
      } catch (err) {
        console.error('Erro ao atualizar ordem:', err);
        setError('Erro ao salvar nova ordem');
      }
    }
  };

  const handleContinue = () => {
    if (media.length === 0) {
      setError('Adicione pelo menos uma imagem');
      return;
    }
    onMediaUploadComplete(media);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        ref={dragZoneRef}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
          dragActive
            ? 'border-rd-blue bg-blue-50 scale-105'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />

        <motion.div
          className="flex flex-col items-center gap-3"
          animate={dragActive ? { scale: 1.05 } : { scale: 1 }}
        >
          <div className="w-12 h-12 bg-rd-blue bg-opacity-10 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-rd-blue" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Adicione Imagens
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              Arraste arquivos ou clique para selecionar
            </p>
            <p className="text-xs text-gray-500">
              Máx 10MB • JPEG, PNG, GIF, WebP
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-1.5 bg-rd-blue text-white text-sm rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {isUploading ? 'Enviando...' : 'Selecionar'}
          </button>
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 items-start"
        >
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {media.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Mídias Adicionadas ({media.length})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <AnimatePresence>
              {media.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`relative group cursor-move ${
                    dragOverIndex === index ? 'ring-2 ring-rd-blue' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDropReorder(e, index)}
                >
                  <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <>
                      <img
                        src={item.media_url || item.previewUrl}
                        alt={`Mídia ${index + 1}`}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white rounded px-2 py-1 flex items-center gap-1 text-xs">
                        <ImageIcon className="w-3 h-3" />
                        Imagem
                      </div>
                      
                      {/* Indicador de arrasto */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-black bg-opacity-60 rounded-full p-2">
                          <GripVertical className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </>

                    <button
                      onClick={() => handleRemoveMedia(item.id)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {media.length === 0 && !isUploading && (
        <p className="text-center text-gray-500 text-sm mt-6">
          Nenhuma mídia adicionada ainda. Comece fazendo upload de imagens ou vídeos do imóvel.
        </p>
      )}
    </div>
  );
};

export default MediaUploader;
