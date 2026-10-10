import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

import { Button } from '../components/common/Button.jsx';
import { CertificateModal } from '../components/common/CertificateModal.jsx';
import {
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  Award,
  Calendar,
  User,
  BookOpen } from
'lucide-react';





export const CertificatesVerifyPage = ({ initialCertId = '' }) => {
  const [certIdInput, setCertIdInput] = useState(initialCertId);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [verifiedCert, setVerifiedCert] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleVerify = async (idToVerify) => {
    const targetId = (idToVerify || certIdInput).trim();
    if (!targetId) return;

    setLoading(true);
    setSearched(true);
    setErrorMessage(null);
    setVerifiedCert(null);

    try {
      const res = await api.verifyCertificate(targetId);
      if (res && res.verified && res.certificate) {
        setVerifiedCert(res.certificate);
      } else {
        setErrorMessage('Certificate not found. Please verify the ID.');
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Certificate not found. The ID entered does not match our verified registry.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCertId) {
      setCertIdInput(initialCertId);
      handleVerify(initialCertId);
    }
  }, [initialCertId]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-left space-y-2 border-b border-[#282828]/10 dark:border-[#25473C] pb-6">
        <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider font-semibold">
          CREDENTIAL VERIFICATION
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight font-sans">
          Public Certificate Registry
        </h1>
        <p className="text-sm text-[#282828]/70 dark:text-[#B7C9C2] max-w-2xl">
          Instantly verify certificates and credentials issued by ARX IT CLUB OF SJS. Each certificate
          carries a tamper-proof SHA-256 validation identifier.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-6 sm:p-8 border border-[#282828]/10 dark:border-[#25473C] rounded-xl bg-white dark:bg-[#102B22] shadow-xs transition-colors">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="space-y-4">
          
          <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2]">
            Enter Certificate ID
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#282828]/40 dark:text-[#7F9990]" />
              <input
                type="text"
                placeholder="e.g. ITC-PY-2026-00421"
                value={certIdInput}
                onChange={(e) => setCertIdInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]"
                required />
              
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="sm:w-36">
              
              Verify ID
            </Button>
          </div>

          <p className="text-xs text-[#282828]/60 dark:text-[#7F9990]">
            Enter the unique ID printed at the bottom of the issued certificate or scanned via QR code.
          </p>
        </form>
      </div>

      {/* Result Display */}
      {loading ?
      <div className="py-12 text-center text-[#282828]/60 dark:text-[#7F9990] space-y-2">
          <div className="w-6 h-6 border-2 border-[#FC6454] dark:border-[#6BB89E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono">Querying credential registry...</p>
        </div> :
      verifiedCert ? (
      /* Verified Certificate Card */
      <div className="p-6 sm:p-8 border border-emerald-200 dark:border-[#25473C] bg-white dark:bg-[#102B22] rounded-xl space-y-6 shadow-xs animate-in fade-in transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#282828]/10 dark:border-[#25473C] gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-[#15362B] text-emerald-600 dark:text-[#58B889] border border-emerald-200 dark:border-[#25473C] flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-emerald-700 dark:text-[#58B889] font-medium">
                  REGISTRY VERIFICATION
                </span>
                <h3 className="text-xl font-bold text-[#282828] dark:text-[#F1F7F4] font-sans">
                  Authentic Credential Verified
                </h3>
              </div>
            </div>

            <Button
            variant="outline"
            size="md"
            onClick={() => setModalOpen(true)}>
            
              <Award className="w-4 h-4 mr-1.5" /> View Certificate
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#282828]/40 dark:text-[#7F9990]" /> Student Name
              </span>
              <p className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4]">{verifiedCert.studentName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#282828]/40 dark:text-[#7F9990]" /> Course Track
              </span>
              <p className="text-base font-semibold text-[#282828] dark:text-[#F1F7F4]">{verifiedCert.courseName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#282828]/40 dark:text-[#7F9990]" /> Completion Date
              </span>
              <p className="text-sm font-medium text-[#282828] dark:text-[#F1F7F4]">{verifiedCert.issueDate}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">Certificate Identifier</span>
              <p className="text-sm font-mono font-bold text-[#FC6454] dark:text-[#6BB89E]">
                {verifiedCert.certificateId}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] text-xs text-[#282828]/70 dark:text-[#B7C9C2] flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Authorized By: <strong className="text-[#282828] dark:text-[#F1F7F4]">IT Club Academic Council</strong>
            </span>
            <span className="text-emerald-700 dark:text-[#58B889] font-mono text-[11px]">
              SHA-256 Ledger Verified · 2026
            </span>
          </div>
        </div>) :
      searched && errorMessage ? (
      /* Not Found Error */
      <div className="p-8 border border-red-200 dark:border-rose-900/60 bg-red-50/50 dark:bg-rose-950/20 text-center space-y-3 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-rose-900/40 text-red-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-red-900 dark:text-rose-200">Certificate Not Found</h3>
            <p className="text-xs text-red-700 dark:text-rose-300 mt-1 max-w-md mx-auto">
              We could not locate any certificate matching ID &quot;{certIdInput}&quot;. Please verify the
              characters and try again.
            </p>
          </div>
          <p className="text-xs text-[#282828]/60 dark:text-[#7F9990] pt-2">
            For credential lookup assistance, contact club leadership via the Contact page.
          </p>
        </div>) :
      null}

      {/* Certificate Viewer Modal */}
      <CertificateModal
        certificate={verifiedCert}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)} />
      
    </div>);

};