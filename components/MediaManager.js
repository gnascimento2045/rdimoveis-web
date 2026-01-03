'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Video, AlertCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MediaManager = ({ onMediaChange, propertyId, existingMedia = [], isEditing = false }) => {
  const [media, setMedia] = useState(existingMedia);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRef = useRef(null);
  const dragZoneRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // Escutar mudanças em existingMedia (quando carrega do banco)
  useEffect(() => {
    if (existingMedia && existingMedia.length > 0) {
      console.log('Atualizando media com existingMedia:', existingMedia);
      setMedia(existingMedia);
    }
  }, [existingMedia]);

  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matrosvideo'];

  const isAllowedFile = (file) => {
    return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].includes(file.type);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDragDropUpload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    setError('');
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`Arquivo ${file.name} é muito grande (máx: 50MB)`);
        return;
      }
      if (!isAllowedFile(file)) {
        setError(`Tipo de arquivo não suportado: ${file.name}`);
        return;
      }
    }

    setIsUploading(true);

    try {
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`http://localhost:8000/api/properties/${propertyId}/media`, {
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
        setMedia(prev => [...prev, data]);
      }
      // Notificar pai sobre mudanças
      onMediaChange([...media]);
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
    try {
      const response = await fetch(`http://localhost:8000/api/properties/${propertyId}/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao deletar');

      const updated = media.filter(m => m.id !== mediaId);
      setMedia(updated);
      onMediaChange(updated);
    } catch (err) {
      setError('Erro ao deletar mídia');
    }
  };

  const handleUpdateOrder = async (mediaId, newOrder) => {
    try {
      const response = await fetch(`http://localhost:8000/api/properties/${propertyId}/media/${mediaId}/order`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ display_order: newOrder })
      });

      if (!response.ok) throw new Error('Erro ao atualizar ordem');

      const updated = media
        .map(m => m.id === mediaId ? { ...m, display_order: newOrder } : m)
        .sort((a, b) => a.display_order - b.display_order);
      
      setMedia(updated);
      onMediaChange(updated);
    } catch (err) {
      setError('Erro ao atualizar ordem');
    }
  };

  const moveUp = (index) => {
    if (index > 0) {
      handleUpdateOrder(media[index].id, media[index - 1].display_order - 1);
    }
  };

  const moveDown = (index) => {
    if (index < media.length - 1) {
      handleUpdateOrder(media[index].id, media[index + 1].display_order + 1);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedItem === null || draggedItem === dropIndex) return;

    // Criar novo array com mídias reordenadas
    const newMedia = [...media];
    const draggedMedia = newMedia[draggedItem];
    
    // Remove o item do índice original
    newMedia.splice(draggedItem, 1);
    // Insere no novo índice
    newMedia.splice(dropIndex, 0, draggedMedia);

    // Atualizar display_order para cada item
    const updatedMedia = newMedia.map((item, idx) => ({
      ...item,
      display_order: idx
    }));

    // Atualizar estado localmente (feedback imediato)
    setMedia(updatedMedia);
    onMediaChange(updatedMedia);

    // Atualizar no servidor
    try {
      for (let i = 0; i < updatedMedia.length; i++) {
        await fetch(
          `http://localhost:8000/api/properties/${propertyId}/media/${updatedMedia[i].id}/order`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ display_order: i })
          }
        );
      }
    } catch (err) {
      console.error('Erro ao atualizar ordem:', err);
    }

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <div className="w-full">
      {/* Upload Zone */}
      <div
        ref={dragZoneRef}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDragDropUpload}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-rd-blue bg-blue-50 scale-105'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />

        <motion.div
          className="flex flex-col items-center gap-3"
          animate={dragActive ? { scale: 1.05 } : { scale: 1 }}
        >
          <div className="w-12 h-12 bg-rd-blue bg-opacity-10 rounded-full flex items-center justify-center">
            <Plus className="w-6 h-6 text-rd-blue" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Adicionar Imagens ou Vídeos
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Arraste arquivos ou clique para selecionar
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-rd-blue text-white rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 text-sm"
          >
            {isUploading ? 'Enviando...' : 'Selecionar Arquivos'}
          </button>
        </motion.div>
      </div>

      {/* Error Message */}
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

      {/* Media Grid */}
      {media.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Mídias ({media.length})
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
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative group cursor-move transition-all ${
                    draggedItem === index ? 'opacity-50' : ''
                  } ${dragOverIndex === index ? 'border-2 border-rd-blue bg-blue-50 rounded-lg' : ''}`}
                >
                  <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {item.media_type === 'image' ? (
                      <>
                        <img
                          src={item.media_url}
                          alt={`Mídia ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white rounded px-2 py-1 flex items-center gap-1 text-xs">
                          <ImageIcon className="w-3 h-3" />
                          Imagem
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-900 flex items-center justify-center relative">
                        <Video className="w-12 h-12 text-white opacity-50" />
                        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white rounded px-2 py-1 flex items-center gap-1 text-xs">
                          <Video className="w-3 h-3" />
                          Vídeo
                        </div>
                      </div>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => handleRemoveMedia(item.id)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Order Indicator */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                  </div>

                  {/* Order Controls */}
                  {media.length > 1 && (
                    <div className="flex gap-1 mt-2 justify-center">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === media.length - 1}
                        className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        ↓
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Empty State Message */}
      {media.length === 0 && !isUploading && (
        <p className="text-center text-gray-500 text-sm mt-4">
          Nenhuma mídia adicionada ainda.
        </p>
      )}
    </div>
  );
};

export default MediaManager;
