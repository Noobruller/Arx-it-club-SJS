import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal.jsx';
import { Button } from '../../common/Button.jsx';
import { Badge } from '../../common/Badge.jsx';

import { api } from '../../../services/api.js';
import { Check, Tag, Info, AlertTriangle, Layers, Calendar, ExternalLink } from 'lucide-react';








export const MediaMetadataModal = ({
  isOpen,
  onClose,
  media,
  onSaved
}) => {
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [tagsInput, setTagsInput] = useState('');
  const [usage, setUsage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (media) {
      setTitle(media.title || '');
      setAltText(media.altText || '');
      setDescription(media.description || '');
      setCategory(media.category || 'General');
      setTagsInput(media.tags ? media.tags.join(', ') : '');

      // Load usage
      api.getAdminMediaUsage(media.id).then((res) => {
        setUsage(res);
      }).catch(() => {
        setUsage(null);
      });
    }
  }, [media]);

  if (!media) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tagsArray = tagsInput.
      split(',').
      map((t) => t.trim()).
      filter(Boolean);

      await api.updateAdminMediaMetadata(media.id, {
        title,
        altText,
        description,
        category,
        tags: tagsArray
      });

      onSaved();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to update image details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Image Details &amp; Metadata" maxWidth="3xl">
      <form onSubmit={handleSubmit} className="space-y-6 text-[#282828] dark:text-[#F1F7F4]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Image Preview & File Stats */}
          <div className="md:col-span-5 space-y-4">
            <div className="rounded-xl overflow-hidden bg-[#FAF4EE] dark:bg-[#071A14] border border-[#282828]/15 dark:border-[#25473C] p-2 flex items-center justify-center min-h-[180px]">
              <img
                src={media.url}
                alt={media.altText || media.title}
                className="max-h-[220px] max-w-full object-contain rounded" />
              
            </div>

            {/* Read-only File Metadata */}
            <div className="bg-[#FAF4EE] dark:bg-[#0C241C] p-3 rounded-xl border border-[#282828]/15 dark:border-[#25473C] text-[11px] space-y-2 font-mono text-[#282828]/70 dark:text-[#B7C9C2]">
              <div className="flex justify-between">
                <span>Filename:</span>
                <span className="text-[#282828] dark:text-[#F1F7F4] font-bold truncate max-w-[140px]" title={media.filename}>
                  {media.filename}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Dimensions:</span>
                <span className="text-[#FC6454] dark:text-[#6BB89E]">{media.width} &times; {media.height} px</span>
              </div>
              <div className="flex justify-between">
                <span>File Size:</span>
                <span className="text-[#282828] dark:text-[#F1F7F4]">{media.formattedSize}</span>
              </div>
              <div className="flex justify-between">
                <span>MIME Type:</span>
                <span className="text-[#282828]/80 dark:text-[#B7C9C2]">{media.mimeType}</span>
              </div>
              <div className="flex justify-between">
                <span>Uploaded:</span>
                <span className="text-[#282828]/80 dark:text-[#B7C9C2]">{new Date(media.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Usage Badge / List */}
            <div className="p-3 rounded-xl bg-[#FAF4EE] dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#282828] dark:text-[#F1F7F4]">Website Usage</span>
                {usage?.isUsed ?
                <Badge variant="cyan" size="sm">Used in {usage.count} place{usage.count > 1 ? 's' : ''}</Badge> :

                <Badge variant="slate" size="sm">Unused</Badge>
                }
              </div>

              {usage?.isUsed &&
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {usage.locations.map((loc, idx) =>
                <div
                  key={idx}
                  className="text-[11px] bg-white dark:bg-[#15362B] p-1.5 rounded border border-[#282828]/10 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] flex items-center justify-between">
                  
                      <span className="truncate">
                        <strong className="text-[#FC6454] dark:text-[#6BB89E]">{loc.type}:</strong> {loc.name}
                      </span>
                      <span className="text-[10px] text-[#282828]/50 dark:text-[#7F9990] font-mono shrink-0 ml-1">
                        {loc.field}
                      </span>
                    </div>
                )}
                </div>
              }
            </div>
          </div>

          {/* Right Column: Editable Metadata Fields */}
          <div className="md:col-span-7 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Image Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Robotics Microcontroller Setup"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/20 dark:border-[#294B40] text-[#282828] dark:text-[#F1F7F4] placeholder-[#282828]/40 dark:placeholder-[#7F9990] focus:outline-none focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-[#6BB89E]" />
              
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-[#282828] dark:text-[#B7C9C2]">
                  Alt Text <span className="text-[#FC6454] dark:text-[#6BB89E] font-normal">(Accessibility)</span>
                </label>
              </div>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe this image for screen readers and search engines..."
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/20 dark:border-[#294B40] text-[#282828] dark:text-[#F1F7F4] placeholder-[#282828]/40 dark:placeholder-[#7F9990] focus:outline-none focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-[#6BB89E]" />
              
              <p className="text-[11px] text-[#282828]/60 dark:text-[#7F9990] mt-1">
                Public website uses this alt text for web accessibility compliance.
              </p>
            </div>

            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/20 dark:border-[#294B40] text-[#282828] dark:text-[#F1F7F4] focus:outline-none focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-[#6BB89E]">
                
                <option value="General">General</option>
                <option value="Branding">Branding</option>
                <option value="Courses">Courses</option>
                <option value="Projects">Projects</option>
                <option value="Events">Events</option>
                <option value="Achievements">Achievements</option>
                <option value="Certificates">Certificates</option>
                <option value="About">About</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes or context about this image..."
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/20 dark:border-[#294B40] text-[#282828] dark:text-[#F1F7F4] placeholder-[#282828]/40 dark:placeholder-[#7F9990] focus:outline-none focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-[#6BB89E]" />
              
            </div>

            <div>
              <label className="block font-bold text-[#282828] dark:text-[#B7C9C2] mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="robotics, sensors, lab3, hardware"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/20 dark:border-[#294B40] text-[#282828] dark:text-[#F1F7F4] placeholder-[#282828]/40 dark:placeholder-[#7F9990] focus:outline-none focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-[#6BB89E]" />
              
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#282828]/10 dark:border-[#25473C]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={saving}>
            <Check className="w-4 h-4 mr-1" />
            Save Details
          </Button>
        </div>
      </form>
    </Modal>);

};