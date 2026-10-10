import React, { useState } from 'react';

import { MediaSelectorModal } from './MediaSelectorModal.jsx';
import { ImageEditorModal } from './ImageEditorModal.jsx';
import { Button } from '../../common/Button.jsx';
import { api } from '../../../services/api.js';
import {
  Upload,
  FolderOpen,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  ExternalLink } from
'lucide-react';











export const ImageFieldInput = ({
  label,
  description,
  value,
  mediaId,
  onChange,
  category = 'General',
  aspectRatioHint = 'Recommended: 16:9 or 4:3 landscape'
}) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSource, setEditorSource] = useState(null);
  const [editorFilename, setEditorFilename] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // When user clicks "Upload New Image" directly
  const handleDirectFileSelect = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setEditorSource(e.target.result);
        setEditorFilename(file.name);
        setEditorOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditorSave = async (processed) =>





  {
    setIsUploading(true);
    try {
      const res = await api.uploadAdminMedia({
        dataUrl: processed.dataUrl,
        filename: editorFilename,
        title: editorFilename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        category,
        width: processed.width,
        height: processed.height
      });

      if (res.success && res.media) {
        onChange(res.media.url, res.media.id);
      }
    } catch (err) {
      alert(err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
      setEditorOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] text-xs">{label}</label>
        {aspectRatioHint &&
        <span className="text-[10px] text-[#282828]/50 dark:text-[#7F9990] font-mono">{aspectRatioHint}</span>
        }
      </div>

      {description && <p className="text-[11px] text-[#282828]/60 dark:text-[#7F9990] -mt-1">{description}</p>}

      {value ? (
      /* Image is currently set */
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-[#FAF4EE] dark:bg-[#0C241C] rounded-xl border border-[#282828]/15 dark:border-[#25473C]">
          {/* Thumbnail preview */}
          <div className="w-24 h-20 rounded-lg overflow-hidden bg-white dark:bg-[#071A14] border border-[#282828]/15 dark:border-[#25473C] shrink-0 flex items-center justify-center relative group">
            <img
            src={value}
            alt="Preview"
            className="max-h-full max-w-full object-contain" />
          
            <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
            title="Open full size">
            
              <ExternalLink className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
            </a>
          </div>

          {/* Details & Actions */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="space-y-0.5">
              <p className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] truncate" title={value}>
                {value.split('/').pop()}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-[#58B889] flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3 h-3" /> Image attached from Media Library
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Option 1: Choose Existing Image */}
              <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectorOpen(true)}
              className="text-xs">
              
                <FolderOpen className="w-3.5 h-3.5 mr-1 text-[#FC6454] dark:text-[#6BB89E]" />
                Choose Existing
              </Button>

              {/* Option 2: Upload New Image */}
              <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#15362B] border border-[#282828]/15 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] hover:bg-[#EFE6DE] dark:hover:bg-[#1C4436] cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
                <span>Upload New</span>
                <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleDirectFileSelect(e.target.files[0]);
                  }
                }} />
              
              </label>

              {/* Remove Image */}
              <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange('', undefined)}
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300">
              
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </div>) : (

      /* Empty State: Two clear options [Upload New Image] OR [Choose Existing Image] */
      <div className="p-4 rounded-xl border border-dashed border-[#282828]/20 dark:border-[#25473C] bg-[#FAF4EE]/60 dark:bg-[#0C241C]/40 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#15362B] border border-[#282828]/15 dark:border-[#25473C] text-[#282828]/40 dark:text-[#7F9990] flex items-center justify-center mx-auto">
            <ImageIcon className="w-5 h-5 text-[#282828]/40 dark:text-[#7F9990]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#282828] dark:text-[#F1F7F4]">No image attached</p>
            <p className="text-[11px] text-[#282828]/60 dark:text-[#B7C9C2] mt-0.5">
              Upload a new image with crop tools, or reuse an existing image from the Media Library.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {/* Upload New Image */}
            <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#FC6454] hover:bg-[#E04D3E] dark:bg-[#2F8068] dark:hover:bg-[#3A9277] text-white dark:text-[#F1F7F4] shadow-xs cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Image</span>
              <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleDirectFileSelect(e.target.files[0]);
                }
              }} />
            
            </label>

            <span className="text-xs text-[#282828]/40 dark:text-[#7F9990] font-bold uppercase">or</span>

            {/* Choose Existing Image */}
            <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSelectorOpen(true)}
            className="text-xs">
            
              <FolderOpen className="w-3.5 h-3.5 mr-1 text-[#FC6454] dark:text-[#6BB89E]" />
              Choose Existing Image
            </Button>
          </div>
        </div>)
      }

      {/* Media Selector Modal */}
      {selectorOpen &&
      <MediaSelectorModal
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        defaultCategory={category}
        currentMediaId={mediaId || value}
        onSelectImage={(media) => {
          onChange(media.url, media.id);
        }} />

      }

      {/* Editor Modal for Direct Upload */}
      {editorOpen && editorSource &&
      <ImageEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        imageSrc={editorSource}
        imageName={editorFilename}
        category={category}
        onSave={handleEditorSave} />

      }
    </div>);

};