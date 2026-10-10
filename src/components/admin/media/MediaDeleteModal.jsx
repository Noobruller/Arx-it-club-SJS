import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal.jsx';
import { Button } from '../../common/Button.jsx';
import { Badge } from '../../common/Badge.jsx';

import { api } from '../../../services/api.js';
import { Trash2, AlertTriangle, ShieldAlert, CheckCircle, ExternalLink } from 'lucide-react';








export const MediaDeleteModal = ({
  isOpen,
  onClose,
  media,
  onDeleted
}) => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (media) {
      setLoading(true);
      api.
      getAdminMediaUsage(media.id).
      then((res) => setUsage(res)).
      catch(() => setUsage(null)).
      finally(() => setLoading(false));
    }
  }, [media]);

  if (!media) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteAdminMedia(media.id);
      onDeleted();
      onClose();
    } catch (err) {
      alert(err.message || 'Could not delete image.');
    } finally {
      setDeleting(false);
    }
  };

  const isBlocked = usage?.isUsed && usage.count > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Image" maxWidth="lg">
      <div className="space-y-5 text-[#282828] dark:text-[#F1F7F4] text-xs">
        {/* Thumbnail Preview */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-[#FAF4EE] dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#25473C]">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-white dark:bg-[#071A14] border border-[#282828]/15 dark:border-[#25473C] flex items-center justify-center shrink-0">
            <img src={media.url} alt={media.title} className="max-h-full max-w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <h4 className="font-bold text-[#282828] dark:text-[#F1F7F4] text-sm truncate">{media.title}</h4>
            <p className="font-mono text-[#282828]/60 dark:text-[#B7C9C2] text-[11px] truncate">{media.filename}</p>
            <p className="text-[10px] text-[#282828]/50 dark:text-[#7F9990] font-mono">
              {media.width}&times;{media.height} px &bull; {media.formattedSize}
            </p>
          </div>
        </div>

        {loading ?
        <div className="py-6 text-center text-[#282828]/50 dark:text-[#7F9990]">
            <div className="animate-spin w-5 h-5 border-2 border-[#FC6454] dark:border-[#6BB89E] border-t-transparent rounded-full mx-auto mb-2" />
            <p>Checking image references across website...</p>
          </div> :
        isBlocked ? (
        /* BLOCKED: Usage Protection (Requirement 13) */
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-3">
            <div className="flex items-start gap-3 text-rose-800 dark:text-rose-300">
              <ShieldAlert className="w-6 h-6 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                  Delete Protected: Image is currently in use!
                </h4>
                <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-1 leading-relaxed">
                  This image cannot be deleted because it is actively used in <strong>{usage.count} location{usage.count > 1 ? 's' : ''}</strong> on the public website.
                  Please replace or remove these references before deleting.
                </p>
              </div>
            </div>

            {/* List of in-use locations */}
            <div className="p-3 bg-white dark:bg-[#071A14] rounded-lg border border-rose-200 dark:border-rose-900/40 space-y-2 max-h-44 overflow-y-auto">
              <p className="font-bold text-[#282828] dark:text-[#B7C9C2] text-[11px] uppercase tracking-wider">
                Active Website Usages:
              </p>
              {usage.locations.map((loc, idx) =>
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-1 border-b border-[#282828]/10 dark:border-[#25473C] last:border-none">
              
                  <span className="text-[#282828] dark:text-[#F1F7F4] truncate">
                    <strong className="text-rose-600 dark:text-rose-400">{loc.type}:</strong> {loc.name}
                  </span>
                  <span className="text-[10px] text-[#282828]/50 dark:text-[#7F9990] font-mono ml-2 shrink-0">
                    {loc.field}
                  </span>
                </div>
            )}
            </div>
          </div>) : (

        /* SAFE TO DELETE */
        <div className="p-4 rounded-xl bg-[#FAF4EE] dark:bg-[#102B22] border border-[#282828]/15 dark:border-[#25473C] space-y-2 text-[#282828] dark:text-[#F1F7F4]">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-[#58B889] font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>Safe to delete</span>
            </div>
            <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
              This image is not currently used by any courses, projects, events, or pages. Deleting it will permanently remove the file from storage.
            </p>
          </div>)
        }

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#282828]/10 dark:border-[#25473C]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {isBlocked ? 'Close' : 'Cancel'}
          </Button>

          {!isBlocked &&
          <Button
            type="button"
            variant="danger"
            size="sm"
            loading={deleting}
            onClick={handleDelete}
            className="bg-rose-600 hover:bg-rose-700 text-white">
            
              <Trash2 className="w-4 h-4 mr-1.5" />
              Permanently Delete Image
            </Button>
          }
        </div>
      </div>
    </Modal>);

};