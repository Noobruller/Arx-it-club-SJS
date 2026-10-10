import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api.js';

import { Card } from '../../common/Card.jsx';
import { Button } from '../../common/Button.jsx';
import { Badge } from '../../common/Badge.jsx';
import { ImageEditorModal } from './ImageEditorModal.jsx';
import { MediaMetadataModal } from './MediaMetadataModal.jsx';
import { MediaReplaceModal } from './MediaReplaceModal.jsx';
import { MediaDeleteModal } from './MediaDeleteModal.jsx';
import {
  Upload,
  Search,
  Filter,
  Image as ImageIcon,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  Crop,
  Layers,
  Sparkles,
  ExternalLink,
  Plus,
  FileImage,
  FolderOpen,
  ArrowUpDown,
  Tag,
  CheckCircle } from
'lucide-react';





export const MediaLibraryView = ({ onNotify }) => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Modals state
  const [activeMediaForDetails, setActiveMediaForDetails] = useState(null);
  const [activeMediaForReplace, setActiveMediaForReplace] = useState(null);
  const [activeMediaForDelete, setActiveMediaForDelete] = useState(null);
  const [activeMediaForEditImage, setActiveMediaForEditImage] = useState(null);
  const [previewModalMedia, setPreviewModalMedia] = useState(null);

  // Upload workflow state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorSource, setEditorSource] = useState(null);
  const [editorFilename, setEditorFilename] = useState('');
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
      }
    } catch (err) {
      console.error('Failed to load media items', err);
      if (onNotify) onNotify(err.message || 'Failed to load media library', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [selectedCategory, searchQuery]);

  // Handle file choice for new upload
  const handleFilePicked = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (JPG, PNG, WebP).');
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

  // Drag and drop handlers
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
      handleFilePicked(e.dataTransfer.files[0]);
    }
  };

  // Save new processed image
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

      if (res.success) {
        if (onNotify) onNotify('Image uploaded and optimized successfully!');
        loadMedia();
        setIsEditorOpen(false);
      }
    } catch (err) {
      alert(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  // Save edited version of an existing image
  const handleExistingImageCropSave = async (processed) =>





  {
    if (!activeMediaForEditImage) return;
    setIsUploading(true);
    try {
      await api.replaceAdminMedia(activeMediaForEditImage.id, {
        dataUrl: processed.dataUrl,
        filename: activeMediaForEditImage.filename,
        width: processed.width,
        height: processed.height,
        replaceEverywhere: true
      });

      if (onNotify) onNotify('Image cropped & saved everywhere successfully!');
      loadMedia();
      setActiveMediaForEditImage(null);
    } catch (err) {
      alert(err.message || 'Failed to update cropped image.');
    } finally {
      setIsUploading(false);
    }
  };

  // Sorting
  const sortedMedia = [...mediaList].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortOrder === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortOrder === 'name') {
      return a.title.localeCompare(b.title);
    }
    if (sortOrder === 'size') {
      return b.fileSize - a.fileSize;
    }
    return 0;
  });

  // Calculate quick stats
  const totalBytes = mediaList.reduce((acc, m) => acc + (m.fileSize || 0), 0);
  const formattedTotalSize =
  totalBytes > 1024 * 1024 ?
  `${(totalBytes / (1024 * 1024)).toFixed(1)} MB` :
  `${Math.round(totalBytes / 1024)} KB`;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#102B22] p-6 rounded-lg border border-[#282828]/15 dark:border-[#25473C] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#282828] dark:text-[#F1F7F4] flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[#FC6454] dark:text-[#6BB89E]" />
              Media Library &amp; Asset Management
            </h2>
            <Badge variant="cyan" size="sm">{mediaList.length} Assets</Badge>
          </div>
          <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
            Centrally manage, crop, optimize, and replace all images used across the ARX IT CLUB OF SJS website.
          </p>
        </div>

        {/* Quick Stats & Upload Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right text-xs pr-3 border-r border-[#282828]/15 dark:border-[#25473C]">
            <p className="text-[#282828]/50 dark:text-[#7F9990] font-mono text-[11px]">Total Storage</p>
            <p className="font-bold text-[#282828] dark:text-[#F1F7F4] font-mono">{formattedTotalSize}</p>
          </div>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#FC6454] hover:bg-[#E04D3E] dark:bg-[#2F8068] dark:hover:bg-[#3A9277] text-white dark:text-[#F1F7F4] text-xs font-semibold cursor-pointer transition-colors shadow-xs">
            <Plus className="w-4 h-4" />
            <span>Upload New Image</span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFilePicked(e.target.files[0]);
                }
              }} />
            
          </label>
        </div>
      </div>

      {/* Drag & Drop Upload Zone (Requirement 14) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all ${
        isDragOver ?
        'border-[#FC6454] bg-[#FC6454]/10 dark:border-[#6BB89E] dark:bg-[#2F8068]/20 scale-[0.99]' :
        'border-[#282828]/20 dark:border-[#25473C] bg-[#FAF4EE]/60 dark:bg-[#0C241C]/40 hover:border-[#FC6454]/50 dark:hover:border-[#366656]'}`
        }>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
          <div className="w-8 h-8 rounded-md bg-[#FC6454]/15 dark:bg-[#2F8068]/30 text-[#FC6454] dark:text-[#6BB89E] border border-[#FC6454]/25 dark:border-[#25473C] flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-[#282828] dark:text-[#F1F7F4]">Drag &amp; drop images anywhere to upload</span>
            <span className="hidden sm:inline"> · </span>
            <span>JPG, PNG, WebP supported with built-in crop &amp; aspect controls.</span>
          </div>
          <label className="text-xs font-semibold text-[#FC6454] dark:text-[#6BB89E] hover:underline cursor-pointer ml-1">
            Browse files
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFilePicked(e.target.files[0]);
                }
              }} />
            
          </label>
        </div>
      </div>

      {/* Filter, Search & Sort Bar (Requirement 1) */}
      <div className="bg-white dark:bg-[#102B22] p-4 rounded-lg border border-[#282828]/15 dark:border-[#25473C] flex flex-col md:flex-row items-center justify-between gap-4 text-xs shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#282828]/40 dark:text-[#7F9990]" />
          <input
            type="text"
            placeholder="Search images by name or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md bg-white dark:bg-[#0C241C] border border-[#282828]/20 dark:border-[#294B40] text-[#282828] dark:text-[#F1F7F4] placeholder-[#282828]/40 dark:placeholder-[#7F9990] focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30" />
          
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map((cat) =>
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            selectedCategory === cat ?
            'bg-[#282828] text-white dark:bg-[#2F8068] dark:text-[#F1F7F4] font-semibold shadow-xs' :
            'text-[#282828]/70 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-[#F1F7F4] bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C]'}`
            }>
            
              {cat}
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#282828]/40 dark:text-[#7F9990]" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0C241C] border border-[#282828]/20 dark:border-[#294B40] text-[#282828] dark:text-[#F1F7F4] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30">
            
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="size">File Size</option>
          </select>
        </div>
      </div>

      {/* Image Grid (Requirement 6, 18, 19) */}
      {loading ?
      <div className="py-24 text-center text-[#282828]/50 dark:text-[#7F9990]">
          <div className="animate-spin w-8 h-8 border-3 border-[#FC6454] dark:border-[#6BB89E] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs">Loading media assets...</p>
        </div> :
      sortedMedia.length === 0 ?
      <div className="py-20 text-center bg-white dark:bg-[#102B22] rounded-2xl border border-[#282828]/15 dark:border-[#25473C] p-8 space-y-3 shadow-xs">
          <ImageIcon className="w-12 h-12 text-[#282828]/40 dark:text-[#7F9990] mx-auto" />
          <h4 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4]">No images found</h4>
          <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All' ?
          'No media matches your search filter. Try clearing the query or selecting another category.' :
          'The media library is empty. Upload your first club image above.'}
          </p>
          {(searchQuery || selectedCategory !== 'All') &&
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
          className="text-xs mt-2">
          
              Reset Filters
            </Button>
        }
        </div> :

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedMedia.map((media) =>
        <div
          key={media.id}
          className="group bg-white dark:bg-[#102B22] rounded-xl border border-[#282828]/15 dark:border-[#25473C] hover:border-[#FC6454]/50 dark:hover:border-[#6BB89E]/60 p-3 flex flex-col justify-between transition-all hover:shadow-md shadow-xs relative">
          
              <div className="space-y-2.5">
                {/* Thumbnail Container */}
                <div className="w-full aspect-[16/10] rounded-lg overflow-hidden bg-[#FAF4EE] dark:bg-[#071A14] border border-[#282828]/10 dark:border-[#25473C] flex items-center justify-center relative">
                  <img
                src={media.url}
                alt={media.altText || media.title}
                className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                loading="lazy" />
              

                  {/* Category Pill on top left */}
                  <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/90 dark:bg-[#071A14]/90 backdrop-blur-xs text-[#FC6454] dark:text-[#6BB89E] border border-[#282828]/15 dark:border-[#25473C]">
                    {media.category}
                  </span>

                  {/* Full size preview click */}
                  <button
                type="button"
                onClick={() => setPreviewModalMedia(media)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-white/90 dark:bg-[#071A14]/90 text-[#282828] dark:text-[#F1F7F4] hover:text-[#FC6454] dark:hover:text-[#6BB89E] border border-[#282828]/15 dark:border-[#25473C] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="View Full Size">
                
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info Text */}
                <div className="space-y-1">
                  <h4 className="font-bold text-[#282828] dark:text-[#F1F7F4] text-xs truncate" title={media.title}>
                    {media.title}
                  </h4>
                  <p className="text-[11px] text-[#282828]/60 dark:text-[#B7C9C2] font-mono truncate" title={media.filename}>
                    {media.filename}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#282828]/50 dark:text-[#7F9990] font-mono pt-1 border-t border-[#282828]/10 dark:border-[#25473C]">
                    <span>{media.width} &times; {media.height} px</span>
                    <span>{media.formattedSize}</span>
                  </div>

                  {media.altText &&
              <p className="text-[10px] text-[#282828]/50 dark:text-[#7F9990] italic truncate" title={`Alt: ${media.altText}`}>
                      Alt: {media.altText}
                    </p>
              }
                </div>
              </div>

              {/* Action Buttons Toolbar (Requirement 6) */}
              <div className="grid grid-cols-4 gap-1 pt-3 mt-3 border-t border-[#282828]/10 dark:border-[#25473C]">
                {/* 1. Crop / Edit Image */}
                <button
              type="button"
              onClick={() => setActiveMediaForEditImage(media)}
              className="p-1.5 rounded-lg bg-[#FAF4EE] hover:bg-[#EFE6DE] text-[#282828] dark:bg-[#15362B] dark:hover:bg-[#1F4D3E] dark:text-[#F1F7F4] border border-[#282828]/15 dark:border-[#25473C] flex items-center justify-center transition-colors cursor-pointer"
              title="Crop / Edit Image">
              
                  <Crop className="w-3.5 h-3.5" />
                </button>

                {/* 2. Edit Details */}
                <button
              type="button"
              onClick={() => setActiveMediaForDetails(media)}
              className="p-1.5 rounded-lg bg-[#FAF4EE] hover:bg-[#EFE6DE] text-[#282828] dark:bg-[#15362B] dark:hover:bg-[#1F4D3E] dark:text-[#F1F7F4] border border-[#282828]/15 dark:border-[#25473C] flex items-center justify-center transition-colors cursor-pointer"
              title="Edit Information & Alt Text">
              
                  <Edit className="w-3.5 h-3.5" />
                </button>

                {/* 3. Replace Image */}
                <button
              type="button"
              onClick={() => setActiveMediaForReplace(media)}
              className="p-1.5 rounded-lg bg-[#FAF4EE] hover:bg-[#FC6454]/15 text-[#282828] hover:text-[#FC6454] dark:bg-[#15362B] dark:hover:bg-[#2F8068] dark:text-[#F1F7F4] border border-[#282828]/15 dark:border-[#25473C] flex items-center justify-center transition-colors cursor-pointer"
              title="Replace Image Everywhere">
              
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                {/* 4. Delete Image with protection */}
                <button
              type="button"
              onClick={() => setActiveMediaForDelete(media)}
              className="p-1.5 rounded-lg bg-[#FAF4EE] hover:bg-rose-100 text-rose-600 dark:bg-[#15362B] dark:hover:bg-rose-950/60 dark:text-rose-400 border border-[#282828]/15 dark:border-[#25473C] flex items-center justify-center transition-colors cursor-pointer"
              title="Delete Image">
              
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
        )}
        </div>
      }

      {/* Modal 1: Image Editor Modal for New Upload */}
      {isEditorOpen && editorSource &&
      <ImageEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        imageSrc={editorSource}
        imageName={editorFilename}
        category={selectedCategory !== 'All' ? selectedCategory : 'General'}
        onSave={handleEditorSave} />

      }

      {/* Modal 2: Crop/Edit Existing Media */}
      {activeMediaForEditImage &&
      <ImageEditorModal
        isOpen={!!activeMediaForEditImage}
        onClose={() => setActiveMediaForEditImage(null)}
        imageSrc={activeMediaForEditImage.url}
        imageName={activeMediaForEditImage.filename}
        category={activeMediaForEditImage.category}
        onSave={handleExistingImageCropSave} />

      }

      {/* Modal 3: Metadata Edit Modal */}
      {activeMediaForDetails &&
      <MediaMetadataModal
        isOpen={!!activeMediaForDetails}
        onClose={() => setActiveMediaForDetails(null)}
        media={activeMediaForDetails}
        onSaved={() => {
          if (onNotify) onNotify('Image metadata updated.');
          loadMedia();
        }} />

      }

      {/* Modal 4: Replace Modal with Usage Warning (Requirement 12) */}
      {activeMediaForReplace &&
      <MediaReplaceModal
        isOpen={!!activeMediaForReplace}
        onClose={() => setActiveMediaForReplace(null)}
        media={activeMediaForReplace}
        onReplaced={() => {
          if (onNotify) onNotify('Image replaced successfully!');
          loadMedia();
        }} />

      }

      {/* Modal 5: Delete Modal with Protection (Requirement 13) */}
      {activeMediaForDelete &&
      <MediaDeleteModal
        isOpen={!!activeMediaForDelete}
        onClose={() => setActiveMediaForDelete(null)}
        media={activeMediaForDelete}
        onDeleted={() => {
          if (onNotify) onNotify('Image removed from media library.');
          loadMedia();
        }} />

      }

      {/* Full Preview Modal */}
      {previewModalMedia &&
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        onClick={() => setPreviewModalMedia(null)}>
        
          <div
          className="bg-white dark:bg-[#102B22] border border-[#282828]/15 dark:border-[#25473C] rounded-2xl max-w-4xl w-full p-6 text-[#282828] dark:text-[#F1F7F4] space-y-4 shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}>
          
            <div className="flex items-center justify-between border-b border-[#282828]/10 dark:border-[#25473C] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4]">{previewModalMedia.title}</h3>
                <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] font-mono">{previewModalMedia.filename}</p>
              </div>
              <button
              type="button"
              onClick={() => setPreviewModalMedia(null)}
              className="text-[#282828]/60 hover:text-[#282828] dark:text-[#B7C9C2] dark:hover:text-white p-1 text-sm font-bold cursor-pointer">
              
                &times; Close
              </button>
            </div>

            <div className="max-h-[60vh] flex items-center justify-center overflow-hidden bg-[#FAF4EE] dark:bg-[#071A14] rounded-xl p-2 border border-[#282828]/10 dark:border-[#25473C]">
              <img
              src={previewModalMedia.url}
              alt={previewModalMedia.altText}
              className="max-h-[55vh] max-w-full object-contain rounded" />
            
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
              <div className="font-mono text-[#FC6454] dark:text-[#6BB89E] flex items-center gap-3">
                <span>{previewModalMedia.width} &times; {previewModalMedia.height} px</span>
                <span>&bull;</span>
                <span>{previewModalMedia.formattedSize}</span>
                <span>&bull;</span>
                <span>{previewModalMedia.category}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                type="button"
                variant="outline-dark"
                size="sm"
                onClick={() => {
                  const m = previewModalMedia;
                  setPreviewModalMedia(null);
                  setActiveMediaForEditImage(m);
                }}>
                
                  <Crop className="w-3.5 h-3.5 mr-1" />
                  Crop / Resize
                </Button>
                <a
                href={previewModalMedia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold">
                
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Direct Link
                </a>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);

};