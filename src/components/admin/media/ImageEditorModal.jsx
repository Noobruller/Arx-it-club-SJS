import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../../common/Modal.jsx';
import { Button } from '../../common/Button.jsx';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crop,
  Check,
  X,
  RefreshCw,
  Sliders,
  Eye,
  Columns } from
'lucide-react';


















export const ImageEditorModal = ({
  isOpen,
  onClose,
  imageSrc,
  imageName = 'image',
  category = 'General',
  onSave
}) => {
  const [loadedImage, setLoadedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('original');
  const [quality, setQuality] = useState(0.85); // 85% WebP/JPEG quality
  const [previewMode, setPreviewMode] = useState('editor');

  // Custom resize controls
  const [targetWidth, setTargetWidth] = useState(800);
  const [targetHeight, setTargetHeight] = useState(600);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  // Crop bounding box (normalized 0 to 1)
  const [cropBox, setCropBox] = useState({
    x: 0,
    y: 0,
    width: 1,
    height: 1
  });

  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load image object
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLoadedImage(img);
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
      resetToOriginal(img);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const resetToOriginal = (img = loadedImage) => {
    if (!img) return;
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAspectRatio('original');
    setCropBox({ x: 0, y: 0, width: 1, height: 1 });
    setTargetWidth(img.naturalWidth);
    setTargetHeight(img.naturalHeight);
    setPreviewMode('editor');
  };

  // Adjust crop box when aspect ratio changes
  useEffect(() => {
    if (!loadedImage) return;

    if (aspectRatio === 'original') {
      setCropBox({ x: 0, y: 0, width: 1, height: 1 });
      return;
    }

    if (aspectRatio === 'free') {
      return;
    }

    let targetRatio = 1;
    if (aspectRatio === '1:1') targetRatio = 1;
    if (aspectRatio === '4:3') targetRatio = 4 / 3;
    if (aspectRatio === '16:9') targetRatio = 16 / 9;
    if (aspectRatio === '3:2') targetRatio = 3 / 2;

    const imgRatio = loadedImage.naturalWidth / loadedImage.naturalHeight;

    let newWidth = 1;
    let newHeight = 1;
    let newX = 0;
    let newY = 0;

    if (targetRatio > imgRatio) {
      // Crop is wider than image: constrain height
      newHeight = imgRatio / targetRatio;
      newY = (1 - newHeight) / 2;
    } else {
      // Crop is taller than image: constrain width
      newWidth = targetRatio / imgRatio;
      newX = (1 - newWidth) / 2;
    }

    setCropBox({
      x: Math.max(0, newX),
      y: Math.max(0, newY),
      width: Math.min(1, newWidth),
      height: Math.min(1, newHeight)
    });
  }, [aspectRatio, loadedImage]);

  // Handle Width change with aspect lock
  const handleWidthChange = (val) => {
    const w = Math.max(50, Math.min(4000, val || 50));
    setTargetWidth(w);
    if (lockAspectRatio && loadedImage) {
      const ratio = loadedImage.naturalHeight / loadedImage.naturalWidth;
      setTargetHeight(Math.round(w * ratio));
    }
  };

  // Handle Height change with aspect lock
  const handleHeightChange = (val) => {
    const h = Math.max(50, Math.min(4000, val || 50));
    setTargetHeight(h);
    if (lockAspectRatio && loadedImage) {
      const ratio = loadedImage.naturalWidth / loadedImage.naturalHeight;
      setTargetWidth(Math.round(h * ratio));
    }
  };

  // Render edited image to canvas
  useEffect(() => {
    if (!loadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Source image dimensions
    const nw = loadedImage.naturalWidth;
    const nh = loadedImage.naturalHeight;

    // Crop box in source pixels
    const sx = cropBox.x * nw;
    const sy = cropBox.y * nh;
    const sWidth = cropBox.width * nw;
    const sHeight = cropBox.height * nh;

    // Determine target canvas dimensions
    const isSideways = rotation % 180 !== 0;
    let outW = Math.round(sWidth * zoom);
    let outH = Math.round(sHeight * zoom);

    if (targetWidth && targetHeight && (targetWidth !== nw || targetHeight !== nh)) {
      outW = Math.round(targetWidth * cropBox.width * zoom);
      outH = Math.round(targetHeight * cropBox.height * zoom);
    }

    canvas.width = isSideways ? outH : outW;
    canvas.height = isSideways ? outW : outH;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Center translation for rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Draw the cropped portion
    const drawW = isSideways ? canvas.height : canvas.width;
    const drawH = isSideways ? canvas.width : canvas.height;

    ctx.drawImage(loadedImage, sx, sy, sWidth, sHeight, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();
  }, [loadedImage, zoom, rotation, flipH, flipV, cropBox, targetWidth, targetHeight]);

  const handleSave = () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      // Prefer webp, fallback to jpeg if not supported
      let dataUrl = '';
      let mimeType = 'image/webp';
      try {
        dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          mimeType = 'image/jpeg';
        }
      } catch {
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        mimeType = 'image/jpeg';
      }

      // Calculate approximate byte size from base64
      const base64Str = dataUrl.split(',')[1] || '';
      const fileSize = Math.round(base64Str.length * 3 / 4);

      onSave({
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        fileSize,
        mimeType
      });

      onClose();
    } catch (err) {
      console.error('Failed to export edited image', err);
      alert('Could not save edited image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Image Editor &amp; Optimizer"
      maxWidth="5xl">
      
      <div className="flex flex-col gap-6 text-[#282828] dark:text-[#F1F7F4]">
        {/* Top Control Bar: Aspect Presets, Rotation & Flip */}
        <div className="bg-[#FAF4EE] dark:bg-[#0C241C] p-3 rounded-xl border border-[#282828]/15 dark:border-[#25473C] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Aspect Ratio Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#282828]/60 dark:text-[#B7C9C2] uppercase tracking-wider mr-1">
              Aspect:
            </span>
            {['original', '1:1', '4:3', '16:9', '3:2', 'free'].map((ratio) =>
            <button
              key={ratio}
              type="button"
              onClick={() => setAspectRatio(ratio)}
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
              aspectRatio === ratio ?
              'bg-[#FC6454] text-white dark:bg-[#2F8068] dark:text-[#F1F7F4] shadow-xs' :
              'bg-white text-[#282828]/70 hover:text-[#282828] hover:bg-[#EFE6DE] dark:bg-[#15362B] dark:text-[#B7C9C2] dark:hover:text-white dark:hover:bg-[#1C4436] border border-[#282828]/15 dark:border-[#25473C]'}`
              }>
              
                {ratio === 'original' ? 'Original' : ratio === 'free' ? 'Free' : ratio}
              </button>
            )}
          </div>

          {/* Transform Controls (Rotate & Flip) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
              title="Rotate Left 90°"
              className="p-1.5 rounded-lg bg-white dark:bg-[#15362B] hover:bg-[#EFE6DE] dark:hover:bg-[#1C4436] text-[#282828] dark:text-[#F1F7F4] border border-[#282828]/15 dark:border-[#25473C] cursor-pointer">
              
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              title="Rotate Right 90°"
              className="p-1.5 rounded-lg bg-white dark:bg-[#15362B] hover:bg-[#EFE6DE] dark:hover:bg-[#1C4436] text-[#282828] dark:text-[#F1F7F4] border border-[#282828]/15 dark:border-[#25473C] cursor-pointer">
              
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setFlipH(!flipH)}
              title="Flip Horizontal"
              className={`p-1.5 rounded-lg border border-[#282828]/15 dark:border-[#25473C] cursor-pointer ${
              flipH ?
              'bg-[#FC6454] text-white dark:bg-[#2F8068] dark:text-[#F1F7F4]' :
              'bg-white dark:bg-[#15362B] hover:bg-[#EFE6DE] dark:hover:bg-[#1C4436] text-[#282828] dark:text-[#F1F7F4]'}`
              }>
              
              <FlipHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setFlipV(!flipV)}
              title="Flip Vertical"
              className={`p-1.5 rounded-lg border border-[#282828]/15 dark:border-[#25473C] cursor-pointer ${
              flipV ?
              'bg-[#FC6454] text-white dark:bg-[#2F8068] dark:text-[#F1F7F4]' :
              'bg-white dark:bg-[#15362B] hover:bg-[#EFE6DE] dark:hover:bg-[#1C4436] text-[#282828] dark:text-[#F1F7F4]'}`
              }>
              
              <FlipVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle View: Editor vs Compare Preview */}
          <div className="flex items-center bg-white dark:bg-[#15362B] p-0.5 rounded-lg border border-[#282828]/15 dark:border-[#25473C]">
            <button
              type="button"
              onClick={() => setPreviewMode('editor')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
              previewMode === 'editor' ?
              'bg-[#FC6454] text-white dark:bg-[#2F8068] dark:text-[#F1F7F4]' :
              'text-[#282828]/60 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-white'}`
              }>
              
              <Eye className="w-3.5 h-3.5 inline mr-1" />
              Editor
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('compare')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
              previewMode === 'compare' ?
              'bg-[#FC6454] text-white dark:bg-[#2F8068] dark:text-[#F1F7F4]' :
              'text-[#282828]/60 dark:text-[#B7C9C2] hover:text-[#282828] dark:hover:text-white'}`
              }>
              
              <Columns className="w-3.5 h-3.5 inline mr-1" />
              Original vs Edited
            </button>
          </div>
        </div>

        {/* Workspace Canvas / Compare Area */}
        <div className="bg-[#FAF4EE]/70 dark:bg-[#071A14] border border-[#282828]/15 dark:border-[#25473C] rounded-2xl p-4 sm:p-6 min-h-[340px] max-h-[500px] flex items-center justify-center overflow-auto relative">
          {previewMode === 'editor' ? (
          /* Single Canvas Editor */
          <div className="relative flex flex-col items-center justify-center max-w-full">
              <canvas
              ref={canvasRef}
              className="max-h-[440px] max-w-full object-contain rounded-lg shadow-xl border border-[#282828]/15 dark:border-[#25473C] bg-white dark:bg-[#0C241C]" />
            
              <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-[#FC6454] dark:text-[#6BB89E] bg-white/95 dark:bg-[#102B22]/95 px-3 py-1 rounded-full border border-[#282828]/15 dark:border-[#25473C] shadow-xs">
                <span>{canvasRef.current?.width || 0} &times; {canvasRef.current?.height || 0} px</span>
                <span>&bull;</span>
                <span>Zoom: {Math.round(zoom * 100)}%</span>
                {rotation !== 0 &&
              <>
                    <span>&bull;</span>
                    <span>Rotate: {rotation}&deg;</span>
                  </>
              }
              </div>
            </div>) : (

          /* Requirement 15: Side-by-side Original vs Edited Preview */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
              {/* Original Preview */}
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-[#15362B] border border-[#282828]/15 dark:border-[#25473C] text-[11px] font-semibold text-[#282828] dark:text-[#F1F7F4]">
                  <span>Original Image</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#282828]/15 dark:border-[#25473C] bg-white dark:bg-[#071A14] p-2 flex items-center justify-center h-[280px]">
                  <img
                  src={imageSrc}
                  alt="Original Preview"
                  className="max-h-full max-w-full object-contain rounded" />
                
                </div>
                <p className="text-[11px] font-mono text-[#282828]/60 dark:text-[#B7C9C2]">
                  {loadedImage?.naturalWidth} &times; {loadedImage?.naturalHeight} px (Original)
                </p>
              </div>

              {/* Edited Preview */}
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FC6454]/10 dark:bg-[#2F8068]/25 border border-[#FC6454]/30 dark:border-[#6BB89E]/40 text-[11px] font-semibold text-[#FC6454] dark:text-[#6BB89E]">
                  <span>Edited Output (What will be saved)</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#FC6454]/25 dark:border-[#25473C] bg-white dark:bg-[#071A14] p-2 flex items-center justify-center h-[280px]">
                  <canvas
                  ref={previewCanvasRef}
                  className="max-h-full max-w-full object-contain rounded"
                  style={{
                    display: 'none' // Hidden helper canvas
                  }} />
                
                  {canvasRef.current &&
                <img
                  src={canvasRef.current.toDataURL('image/webp', quality)}
                  alt="Processed Preview"
                  className="max-h-full max-w-full object-contain rounded shadow-lg" />

                }
                </div>
                <p className="text-[11px] font-mono text-[#FC6454] dark:text-[#6BB89E]">
                  {canvasRef.current?.width} &times; {canvasRef.current?.height} px (Optimized WebP)
                </p>
              </div>
            </div>)
          }
        </div>

        {/* Bottom Tuning Panel: Zoom, Resize Dimensions, Quality */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF4EE] dark:bg-[#0C241C] p-4 rounded-xl border border-[#282828]/15 dark:border-[#25473C] text-xs">
          {/* Zoom Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-[#282828] dark:text-[#F1F7F4]">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
                Zoom / Scale
              </span>
              <span className="font-mono text-[#FC6454] dark:text-[#6BB89E]">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[#FC6454] dark:accent-[#6BB89E] cursor-pointer" />
            
            <div className="flex justify-between text-[10px] text-[#282828]/50 dark:text-[#7F9990] font-mono">
              <span>50%</span>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="hover:text-[#FC6454] dark:hover:text-[#6BB89E] underline cursor-pointer">
                
                100% Reset
              </button>
              <span>250%</span>
            </div>
          </div>

          {/* Width & Height Resize */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-[#282828] dark:text-[#F1F7F4]">
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
                Target Dimensions
              </span>
              <label className="text-[10px] text-[#282828]/60 dark:text-[#B7C9C2] flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lockAspectRatio}
                  onChange={(e) => setLockAspectRatio(e.target.checked)}
                  className="rounded text-[#FC6454] dark:text-[#2F8068] accent-[#FC6454] dark:accent-[#6BB89E]" />
                
                Lock Ratio
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-[#282828]/60 dark:text-[#B7C9C2] font-mono">Width (px)</span>
                <input
                  type="number"
                  value={targetWidth}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-1.5 rounded bg-white dark:bg-[#071A14] border border-[#282828]/20 dark:border-[#294B40] text-[#282828] dark:text-[#F1F7F4] font-mono text-xs focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-[#6BB89E]" />
                
              </div>
              <div>
                <span className="text-[10px] text-[#282828]/60 dark:text-[#B7C9C2] font-mono">Height (px)</span>
                <input
                  type="number"
                  value={targetHeight}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-1.5 rounded bg-white dark:bg-[#071A14] border border-[#282828]/20 dark:border-[#294B40] text-[#282828] dark:text-[#F1F7F4] font-mono text-xs focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-[#6BB89E]" />
                
              </div>
            </div>
          </div>

          {/* WebP Quality Optimization */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-[#282828] dark:text-[#F1F7F4]">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-[#58B889]" />
                Web Compression
              </span>
              <span className="font-mono text-emerald-600 dark:text-[#58B889]">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 dark:accent-[#58B889] cursor-pointer" />
            
            <p className="text-[10px] text-[#282828]/60 dark:text-[#B7C9C2] leading-tight">
              Generates high-fidelity WebP asset with small file size for optimal web loading.
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#282828]/10 dark:border-[#25473C]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => resetToOriginal()}>
            
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Reset Changes
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}>
              
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isProcessing}
              onClick={handleSave}>
              
              <Check className="w-4 h-4 mr-1.5" />
              Save &amp; Apply Image
            </Button>
          </div>
        </div>
      </div>
    </Modal>);

};