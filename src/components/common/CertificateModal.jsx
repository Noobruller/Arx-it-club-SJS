import React from 'react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

import { Award, Printer, CheckCircle, ExternalLink, QrCode } from 'lucide-react';








export const CertificateModal = ({
  certificate,
  isOpen,
  onClose,
  onVerifyOnline
}) => {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const verifyUrl = `${window.location.origin}/#certificates?id=${encodeURIComponent(
    certificate.certificateId
  )}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="space-y-4">
        {/* Certificate Container - LANDSCAPE DESIGN */}
        <div className="overflow-x-auto pb-2">
          <div
            id="printable-certificate"
            className="w-full min-w-[700px] bg-white border-[10px] border-amber-600/30 p-6 sm:p-10 rounded-[2px] shadow-xl text-center select-none relative"
            style={{
              aspectRatio: '1.414 / 1', // Standard A4 Landscape ratio
              backgroundImage:
              'radial-gradient(circle at 50% 50%, #ffffff 0%, #fcfbf7 100%)'
            }}>
            
            {/* Inner Double Border Frame */}
            <div className="border-2 border-slate-900 h-full p-6 sm:p-8 flex flex-col justify-between relative">
              {/* Corner flourishes */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-amber-600" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-600" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-600" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-amber-600" />

              {/* Header with Club Logo & Tagline */}
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="font-mono text-cyan-600 font-extrabold text-2xl tracking-tighter">
                    &lt; / &gt;
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wider">
                    IT CLUB
                  </span>
                </div>
                <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-3">
                  Learn. Build. Grow.
                </p>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-widest font-serif">
                  Certificate of Completion
                </h2>
                <div className="w-20 h-0.5 bg-amber-500 mx-auto my-2" />
                <p className="text-xs sm:text-sm text-slate-500 italic mt-1">
                  This certificate is proudly presented to
                </p>
              </div>

              {/* Student Name */}
              <div className="my-2">
                <h3 className="text-3xl sm:text-4xl font-serif font-bold text-blue-950 border-b-2 border-slate-300 inline-block pb-1 px-8 min-w-[280px]">
                  {certificate.studentName}
                </h3>
              </div>

              {/* Course Title and Completion text */}
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">
                  For successfully completing
                </p>
                <h4 className="text-xl sm:text-2xl font-bold text-slate-800">
                  {certificate.courseName}
                </h4>
              </div>

              {/* Bottom Metadata & Landscape Signature Columns */}
              <div className="grid grid-cols-3 gap-4 items-end pt-4 border-t border-slate-200 text-left">
                {/* Left: Issue Date, ID & QR */}
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>
                    <span className="font-semibold text-slate-700">Completion Date:</span>{' '}
                    {certificate.issueDate}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Certificate ID:</span>{' '}
                    <span className="font-mono text-blue-700 font-bold">
                      {certificate.certificateId}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 text-emerald-700 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Status: VERIFIED</span>
                  </div>
                </div>

                {/* Center: Official Seal & QR Code */}
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-3">
                    {/* Gold Ribbon Seal or Custom Stamp */}
                    {certificate.certificateStampUrl ?
                    <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center drop-shadow-sm">
                        <img src={certificate.certificateStampUrl} alt="Official Seal" className="w-full h-full object-contain" />
                      </div> :

                    <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-sm border border-yellow-200 text-slate-900">
                        <Award className="w-7 h-7" />
                      </div>
                    }
                    {/* QR Code */}
                    <div className="w-14 h-14 bg-white border border-slate-300 rounded p-1 flex flex-col items-center justify-center" title="Scan to verify online">
                      <QrCode className="w-11 h-11 text-slate-900" />
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-amber-900 uppercase mt-1 tracking-wider">
                    Official Academic Seal &bull; Scan to Verify
                  </span>
                </div>

                {/* Right: Authorized Signature */}
                <div className="text-right space-y-0.5">
                  <div className="font-serif italic text-base text-slate-800 border-b border-slate-400 pb-0.5 inline-block min-w-[140px] text-center">
                    {certificate.authorizedSignatures?.[0]?.name || 'IT Club Leadership'}
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {certificate.authorizedSignatures?.[0]?.title || 'Club President'}
                  </p>
                  <p className="text-[9px] text-slate-400">Authorized IT Club Signatory</p>
                </div>
              </div>

              {/* Landscape Footer Note */}
              <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                <span className="font-mono">Verification: {verifyUrl}</span>
                <span>Academic Year &bull; School IT Club Organization</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
            Certificate ID:{' '}
            <code className="bg-[#FAF4EE] dark:bg-[#15362B] border border-[#282828]/10 dark:border-[#25473C] px-2 py-0.5 rounded font-mono text-[#282828] dark:text-[#F1F7F4] font-semibold">
              {certificate.certificateId}
            </code>{' '}
            <span className="text-emerald-600 dark:text-[#58B889] font-bold ml-1.5">(Landscape Format)</span>
          </div>
          <div className="flex items-center gap-2">
            {onVerifyOnline &&
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onVerifyOnline(certificate.certificateId);
              }}>
              
                <ExternalLink className="w-4 h-4" />
                Verify Online
              </Button>
            }
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
              Print / Save PDF (Landscape)
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>);

};