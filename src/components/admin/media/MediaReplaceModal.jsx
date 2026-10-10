import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal.jsx';
import { Button } from '../../common/Button.jsx';
import { Badge } from '../../common/Badge.jsx';

import { ImageEditorModal } from './ImageEditorModal.jsx';
import { MediaSelectorModal } from './MediaSelectorModal.jsx';
import { api } from '../../../services/api.js';
import {
  RefreshCw,
  AlertTriangle,
  Upload,
  FolderOpen,
  CheckCircle,
  Check,
  Layers } from
'lucide-react';








export const MediaReplaceModal = ({
  isOpen,
  onClose,
  media,
  onReplaced
}) => {
  const [usage, setUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [replaceScope, setReplaceScope] = useState('everywhere');

  // Sub-modal states
  const [editorSource, setEditorSource] = useState(null);
  const [editorFilename, setEditorFilename] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (media) {
      setLoadingUsage(true);
      api.
      getAdminMediaUsage(media.id).
      then((res) => setUsage(res)).
      catch(() => setUsage(null)).
      finally(() => setLoadingUsage(false));
    }
  }, [media]);

  if (!media) return null;

  const handleUploadFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
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

  const handleEditorSave = async (processed) =>





  {
    setIsSubmitting(true);
    try {
      if (replaceScope === 'everywhere') {
        await api.replaceAdminMedia(media.id, {
          dataUrl: processed.dataUrl,
          filename: editorFilename,
          width: processed.width,
          height: processed.height,
          replaceEverywhere: true
        });
      } else {
        // Upload as a brand new image
        await api.uploadAdminMedia({
          dataUrl: processed.dataUrl,
          filename: editorFilename,
          title: editorFilename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
          category: media.category,
          width: processed.width,
          height: processed.height
        });
      }

      onReplaced();
      setIsEditorOpen(false);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to replace image.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExistingSelected = async (existing) => {
    setIsSubmitting(true);
    try {
      if (replaceScope === 'everywhere') {
        // Replace this media's references everywhere with the selected image
        await api.replaceAdminMedia(media.id, {
          dataUrl: undefined,
          replaceEverywhere: true
        });
      }
      onReplaced();
      setIsSelectorOpen(false);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to swap image.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Replace Image" maxWidth="2xl">
        <div className="space-y-6 text-[#282828] dark:text-[#F1F7F4] text-xs">
          {/* Current Image Details */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-[#FAF4EE] dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C]">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white dark:bg-[#071A14] border border-[#282828]/15 dark:border-[#25473C] flex items-center justify-center shrink-0">
              <img src={media.url} alt={media.title} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="font-bold text-[#282828] dark:text-[#F1F7F4] text-sm truncate">{media.title}</h4>
              <p className="font-mono text-[#282828]/60 dark:text-[#B7C9C2] text-[11px]">
                {media.filename} &bull; {media.width}&times;{media.height} px ({media.formattedSize})
              </p>
            </div>
          </div>

          {/* Requirement 12 Warning: If currently used in multiple places */}
          {usage && usage.count > 0 ?
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-3">
              <div className="flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                    This image is currently used in {usage.count} location{usage.count > 1 ? 's' : ''}
                  </h4>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                    Changing this image will affect live pages. Choose whether to update it everywhere or create a separate copy.
                  </p>
                </div>
              </div>

              {/* List of locations */}
              <div className="space-y-1 pl-7 max-h-36 overflow-y-auto">
                {usage.locations.map((loc, idx) =>
              <div key={idx} className="text-[11px] text-[#282828] dark:text-[#B7C9C2] flex items-center justify-between py-0.5">
                    <span>
                      <strong className="text-amber-700 dark:text-amber-400">{loc.type}:</strong> {loc.name}
                    </span>
                    <span className="font-mono text-[#282828]/50 dark:text-[#7F9990] text-[10px]">{loc.field}</span>
                  </div>
              )}
              </div>

              {/* Replacement Choice */}
              <div className="pt-2 border-t border-amber-200 dark:border-amber-900/60 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-[#282828] dark:text-[#F1F7F4]">
                  <input
                  type="radio"
                  name="replace_choice"
                  value="everywhere"
                  checked={replaceScope === 'everywhere'}
                  onChange={() => setReplaceScope('everywhere')}
                  className="accent-[#FC6454] dark:accent-[#6BB89E]" />
                
                  <span>
                    <strong>Replace image everywhere</strong> (Recommended: all {usage.count} locations will update automatically)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#282828] dark:text-[#F1F7F4]">
                  <input
                  type="radio"
                  name="replace_choice"
                  value="new_copy"
                  checked={replaceScope === 'new_copy'}
                  onChange={() => setReplaceScope('new_copy')}
                  className="accent-[#FC6454] dark:accent-[#6BB89E]" />
                
                  <span>
                    <strong>Upload as a separate new image</strong> (Keep original image untouched for other items)
                  </span>
                </label>
              </div>
            </div> :

          <div className="p-3 rounded-xl bg-[#FAF4EE] dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] text-[#282828]/70 dark:text-[#B7C9C2] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-[#58B889]" />
              <span>This image is not currently attached to any active page elements. Safe to replace.</span>
            </div>
          }

          {/* Action Choice: Upload New Image OR Choose Existing Image */}
          <div className="space-y-3 pt-1">
            <p className="font-bold text-[#282828] dark:text-[#F1F7F4]">Choose replacement source:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Upload New Image */}
              <label className="flex flex-col items-center justify-center p-6 rounded-xl border border-[#282828]/20 dark:border-[#25473C] bg-white dark:bg-[#0C241C] hover:bg-[#FAF4EE] dark:hover:bg-[#15362B] hover:border-[#FC6454] dark:hover:border-[#6BB89E] text-center cursor-pointer transition-colors group">
                <Upload className="w-8 h-8 text-[#FC6454] dark:text-[#6BB89E] mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-[#282828] dark:text-[#F1F7F4]">Upload New Image</span>
                <span className="text-[11px] text-[#282828]/60 dark:text-[#B7C9C2] mt-1">
                  Crop, rotate, &amp; preview before replacing
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleUploadFile(e.target.files[0]);
                    }
                  }} />
                
              </label>

              {/* Option B: Choose Existing Image */}
              <button
                type="button"
                onClick={() => setIsSelectorOpen(true)}
                className="flex flex-col items-center justify-center p-6 rounded-xl border border-[#282828]/20 dark:border-[#25473C] bg-white dark:bg-[#0C241C] hover:bg-[#FAF4EE] dark:hover:bg-[#15362B] hover:border-[#FC6454] dark:hover:border-[#6BB89E] text-center cursor-pointer transition-colors group">
                
                <FolderOpen className="w-8 h-8 text-[#FC6454] dark:text-[#6BB89E] mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-[#282828] dark:text-[#F1F7F4]">Choose Existing Image</span>
                <span className="text-[11px] text-[#282828]/60 dark:text-[#B7C9C2] mt-1">
                  Select another image already in Media Library
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#282828]/10 dark:border-[#25473C]">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Nested Editor Modal */}
      {isEditorOpen && editorSource &&
      <ImageEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        imageSrc={editorSource}
        imageName={editorFilename}
        category={media.category}
        onSave={handleEditorSave} />

      }

      {/* Nested Media Selector Modal */}
      {isSelectorOpen &&
      <MediaSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        title="Select Replacement Image"
        defaultCategory={media.category}
        onSelectImage={handleExistingSelected} />

      }
    </>);

};