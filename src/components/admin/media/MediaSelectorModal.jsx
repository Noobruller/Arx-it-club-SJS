import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal.jsx';
import { Button } from '../../common/Button.jsx';
import { Badge } from '../../common/Badge.jsx';
import { api } from '../../../services/api.js';

import { ImageEditorModal } from './ImageEditorModal.jsx';
import {
  Upload,
  Search,
  Filter,
  CheckCircle,
  Image as ImageIcon,
  Check,
  FileImage,
  FolderOpen,
  Sparkles,
  Layers,
  ArrowRight } from
'lucide-react';










export const MediaSelectorModal = ({
  isOpen,
  onClose,
  onSelectImage,
  currentMediaId,
  defaultCategory = 'All',
  title = 'Select Media Image'
}) => {
  const [activeTab, setActiveTab] = useState('library');
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Upload & Editor state
  const [editorSource, setEditorSource] = useState(null);
  const [editorFilename, setEditorFilename] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const categories = [
  'All',
  'Branding',
  'Courses',
  'Projects',
  'Events',
  'Achievements',
  'Certificates',
  'About',
  'General'];


  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminMedia(selectedCategory, searchQuery);
      if (res.media) {
        setMediaList(res.media);
        if (currentMediaId) {
          const current = res.media.find((m) => m.id === currentMediaId || m.url === currentMediaId);
          if (current) setSelectedMedia(current);
        }
      }
    } catch (err) {
      console.error('Failed to load media library', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen, selectedCategory, searchQuery]);

  // Handle file chosen from disk
  const handleFileSelected = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setEditorSource(e.target.result);
        setEditorFilename(file.name);
        setIsEditorOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  // Handle Save from ImageEditorModal
  const handleEditorSave = async (processed) =>





  {
    setIsUploading(true);
    try {
      const res = await api.uploadAdminMedia({
        dataUrl: processed.dataUrl,
        filename: editorFilename,
        title: editorFilename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        category: selectedCategory !== 'All' ? selectedCategory : 'General',
        width: processed.width,
        height: processed.height
      });

      if (res.success && res.media) {
        // Automatically attach and select the uploaded media
        onSelectImage(res.media);
        onClose();
      }
    } catch (err) {
      alert(err.message || 'Failed to upload processed image.');
    } finally {
      setIsUploading(false);
      setIsEditorOpen(false);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedMedia) {
      onSelectImage(selectedMedia);
      onClose();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="5xl">
        <div className="space-y-5 text-[#282828] dark:text-[#F1F7F4]">
          {/* Top Switcher Tabs */}
          <div className="flex border-b border-[#282828]/15 dark:border-[#25473C]">
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'library' ?
              'border-[#FC6454] dark:border-[#6BB89E] text-[#FC6454] dark:text-[#6BB89E] bg-[#FC6454]/10 dark:bg-[#2F8068]/20' :
              'border-transparent text-[#282828]/60 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4] hover:bg-[#FAF4EE] dark:hover:bg-[#15362B]'}`
              }>
              
              <FolderOpen className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
              Choose Existing Image
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload' ?
              'border-[#FC6454] dark:border-[#6BB89E] text-[#FC6454] dark:text-[#6BB89E] bg-[#FC6454]/10 dark:bg-[#2F8068]/20' :
              'border-transparent text-[#282828]/60 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4] hover:bg-[#FAF4EE] dark:hover:bg-[#15362B]'}`
              }>
              
              <Upload className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
              Upload &amp; Edit New Image
            </button>
          </div>

          {activeTab === 'library' ? (
          /* TAB 1: MEDIA LIBRARY BROWSER */
          <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#282828]/40 dark:text-[#7F9990]" />
                  <input
                  type="text"
                  placeholder="Search by title, filename, tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/20 dark:border-[#294B40] text-xs text-[#282828] dark:text-[#F1F7F4] placeholder-[#282828]/40 dark:placeholder-[#7F9990] focus:outline-none focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-[#6BB89E]" />
                
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1">
                  {categories.map((cat) =>
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat ?
                  'bg-[#FC6454] dark:bg-[#2F8068] text-white dark:text-[#F1F7F4]' :
                  'bg-white dark:bg-[#0C241C] text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-white border border-[#282828]/15 dark:border-[#25473C]'}`
                  }>
                  
                      {cat}
                    </button>
                )}
                </div>
              </div>

              {/* Grid of Images */}
              {loading ?
            <div className="py-24 text-center text-[#282828]/50 dark:text-[#7F9990]">
                  <div className="animate-spin w-8 h-8 border-3 border-[#FC6454] dark:border-[#6BB89E] border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-xs">Loading media assets...</p>
                </div> :
            mediaList.length === 0 ?
            <div className="py-16 text-center bg-[#FAF4EE] dark:bg-[#102B22] rounded-xl border border-[#282828]/15 dark:border-[#25473C] p-8 space-y-3">
                  <ImageIcon className="w-10 h-10 text-[#282828]/40 dark:text-[#7F9990] mx-auto" />
                  <h4 className="text-sm font-bold text-[#282828] dark:text-[#F1F7F4]">No images found</h4>
                  <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
                    Try changing search terms or switch to the &quot;Upload New Image&quot; tab.
                  </p>
                  <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('upload')}
                className="mt-2 text-xs">
                
                    Upload an Image
                  </Button>
                </div> :

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {mediaList.map((media) => {
                const isSelected = selectedMedia?.id === media.id;
                return (
                  <div
                    key={media.id}
                    onClick={() => setSelectedMedia(media)}
                    className={`group relative rounded-xl border p-2 flex flex-col justify-between cursor-pointer transition-all duration-150 ${
                    isSelected ?
                    'bg-[#FC6454]/10 dark:bg-[#2F8068]/25 border-[#FC6454] dark:border-[#6BB89E] shadow-sm ring-2 ring-[#FC6454]/40 dark:ring-[#6BB89E]/40' :
                    'bg-white dark:bg-[#102B22] border-[#282828]/15 dark:border-[#25473C] hover:border-[#FC6454]/40 dark:hover:border-[#6BB89E]/50'}`
                    }>
                    
                        {/* Thumbnail */}
                        <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#FAF4EE] dark:bg-[#071A14] border border-[#282828]/10 dark:border-[#25473C] flex items-center justify-center relative mb-2">
                          <img
                        src={media.url}
                        alt={media.altText || media.title}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                        loading="lazy" />
                      
                          {isSelected &&
                      <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#FC6454] dark:bg-[#58B889] text-white flex items-center justify-center shadow-lg">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                      }
                          <span className="absolute bottom-1 left-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/90 dark:bg-[#071A14]/90 text-[#FC6454] dark:text-[#6BB89E] border border-[#282828]/15 dark:border-[#25473C]">
                            {media.category}
                          </span>
                        </div>

                        {/* Title and stats */}
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-[#282828] dark:text-[#F1F7F4] truncate" title={media.title}>
                            {media.title}
                          </p>
                          <p className="text-[10px] text-[#282828]/60 dark:text-[#B7C9C2] font-mono flex items-center justify-between">
                            <span>{media.width}&times;{media.height}</span>
                            <span>{media.formattedSize}</span>
                          </p>
                        </div>
                      </div>);

              })}
                </div>
            }

              {/* Bottom Actions for Library Tab */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#282828]/10 dark:border-[#25473C]">
                <div className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] flex items-center gap-2">
                  {selectedMedia ?
                <span className="text-[#FC6454] dark:text-[#6BB89E] font-medium">
                      Selected: <strong>{selectedMedia.title}</strong> ({selectedMedia.width}&times;{selectedMedia.height} px, {selectedMedia.formattedSize})
                    </span> :

                <span>Click any image above to select it.</span>
                }
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!selectedMedia}
                  onClick={handleConfirmSelect}>
                  
                    <Check className="w-4 h-4 mr-1" />
                    Attach Image
                  </Button>
                </div>
              </div>
            </div>) : (

          /* TAB 2: UPLOAD & EDIT WORKFLOW */
          <div className="space-y-6">
              {/* Drag and drop upload zone */}
              <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
              isDragOver ?
              'border-[#FC6454] bg-[#FC6454]/10 dark:border-[#6BB89E] dark:bg-[#2F8068]/20 scale-[0.99]' :
              'border-[#282828]/20 dark:border-[#25473C] bg-[#FAF4EE]/60 dark:bg-[#0C241C]/40 hover:border-[#FC6454]/40 dark:hover:border-[#366656]'}`
              }>
              
                <div className="w-16 h-16 rounded-2xl bg-[#FC6454]/15 dark:bg-[#2F8068]/30 text-[#FC6454] dark:text-[#6BB89E] border border-[#FC6454]/25 dark:border-[#25473C] flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4] mb-1">
                  Drag and drop an image here
                </h3>
                <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] mb-5 max-w-md mx-auto">
                  Supports JPG, PNG, and WebP up to 15MB. You will be able to crop, rotate, resize, and preview the image before saving.
                </p>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FC6454] hover:bg-[#E04D3E] dark:bg-[#2F8068] dark:hover:bg-[#3A9277] text-white dark:text-[#F1F7F4] text-xs font-bold cursor-pointer shadow-md transition-transform active:scale-95">
                  <FileImage className="w-4 h-4" />
                  <span>Choose File from Computer</span>
                  <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileSelected(e.target.files[0]);
                    }
                  }} />
                
                </label>
              </div>

              {/* Instructions Callout */}
              <div className="p-4 rounded-xl bg-[#FAF4EE] dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-xs text-[#282828]/70 dark:text-[#B7C9C2] space-y-1">
                <p className="font-semibold text-[#282828] dark:text-[#F1F7F4] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" /> Professional Media Workflow:
                </p>
                <p>
                  1. Choose an image &rarr; 2. Simple Image Editor opens with crop, zoom, and aspect ratios &rarr; 3. Compare Original vs Edited preview &rarr; 4. Save and auto-attach.
                </p>
              </div>
            </div>)
          }
        </div>
      </Modal>

      {/* Editor Modal nested */}
      {isEditorOpen && editorSource &&
      <ImageEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        imageSrc={editorSource}
        imageName={editorFilename}
        category={selectedCategory !== 'All' ? selectedCategory : 'General'}
        onSave={handleEditorSave} />

      }
    </>);

};