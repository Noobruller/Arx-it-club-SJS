import React, { useState } from 'react';
import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Badge } from '../common/Badge.jsx';
import { Modal } from '../common/Modal.jsx';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  FileText,
  Download,
  ExternalLink,
  User,
  Mail,
  Phone,
  Send,
  BookOpen,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Award,
  Filter,
  Check,
  Eye,
  Info,
  MessageSquare,
  Quote
} from 'lucide-react';

export const ApplicationReviewView = ({
  applications = [],
  loading = false,
  onApprove,
  onReject,
  onRefresh,
  showToast
}) => {
  const [filterStatus, setFilterStatus] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [viewDetailModal, setViewDetailModal] = useState(false);

  // Approve dialog state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [appToApprove, setAppToApprove] = useState(null);
  const [approving, setApproving] = useState(false);

  // Reject dialog state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [appToReject, setAppToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Compute stats
  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  // Filtered list
  const filteredApplications = applications.filter((app) => {
    // Status filter
    if (filterStatus !== 'all' && app.status !== filterStatus) {
      return false;
    }

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const name = (app.studentName || '').toLowerCase();
    const memberId = (app.memberId || '').toLowerCase();
    const email = (app.email || '').toLowerCase();
    const phone = (app.phoneNumber || '').toLowerCase();
    const cls = (app.class || '').toLowerCase();
    const course = (app.course?.title || '').toLowerCase();
    const tg = (app.telegramUsername || '').toLowerCase();

    const essay = (app.motivationEssay || app.essay || '').toLowerCase();

    return (
      name.includes(q) ||
      memberId.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      cls.includes(q) ||
      course.includes(q) ||
      tg.includes(q) ||
      essay.includes(q)
    );
  });

  const handleOpenApproveModal = (app) => {
    setAppToApprove(app);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!appToApprove) return;
    setApproving(true);
    try {
      await onApprove(appToApprove.id);
      showToast?.(`Application for ${appToApprove.studentName} approved! Student access activated.`, 'success');
      setApproveModalOpen(false);
      setAppToApprove(null);
    } catch (err) {
      showToast?.(err.message || 'Failed to approve application', 'error');
    } finally {
      setApproving(false);
    }
  };

  const handleOpenRejectModal = (app) => {
    setAppToReject(app);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!appToReject) return;
    setRejecting(true);
    try {
      await onReject(appToReject.id, rejectionReason.trim());
      showToast?.(`Application for ${appToReject.studentName} has been rejected.`, 'info');
      setRejectModalOpen(false);
      setAppToReject(null);
      setRejectionReason('');
    } catch (err) {
      showToast?.(err.message || 'Failed to reject application', 'error');
    } finally {
      setRejecting(false);
    }
  };

  const handleOpenDetails = (app) => {
    setSelectedApp(app);
    setViewDetailModal(true);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#58B889] border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#102B22] p-5 rounded-xl border border-[#282828]/10 dark:border-[#25473C] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FC6454]/10 dark:bg-[#2F8068]/20 flex items-center justify-center text-[#FC6454] dark:text-[#6BB89E]">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#282828] dark:text-[#F1F7F4] font-sans">
              Student Application Review
            </h2>
          </div>
          <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] mt-1">
            Manual administrator review system. Evaluate applicant documents and credentials before activating access.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="text-xs shrink-0 bg-white dark:bg-[#0C241C] border-[#282828]/15 dark:border-[#25473C]"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Applications
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterStatus('pending')}
          className={`p-4 rounded-xl bg-white dark:bg-[#102B22] border transition-all cursor-pointer shadow-xs ${
            filterStatus === 'pending'
              ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/20'
              : 'border-[#282828]/10 dark:border-[#25473C] hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-bold text-[#282828]/60 dark:text-[#B7C9C2] tracking-wider">
              Pending Evaluation
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {pendingCount}
            </span>
            <span className="text-xs text-[#282828]/50 dark:text-[#7F9990]">applicants awaiting decision</span>
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('approved')}
          className={`p-4 rounded-xl bg-white dark:bg-[#102B22] border transition-all cursor-pointer shadow-xs ${
            filterStatus === 'approved'
              ? 'border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-400/20'
              : 'border-[#282828]/10 dark:border-[#25473C] hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-bold text-[#282828]/60 dark:text-[#B7C9C2] tracking-wider">
              Approved Members
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-[#58B889]">
              {approvedCount}
            </span>
            <span className="text-xs text-[#282828]/50 dark:text-[#7F9990]">admitted into IT club</span>
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('rejected')}
          className={`p-4 rounded-xl bg-white dark:bg-[#102B22] border transition-all cursor-pointer shadow-xs ${
            filterStatus === 'rejected'
              ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-400/20'
              : 'border-[#282828]/10 dark:border-[#25473C] hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-bold text-[#282828]/60 dark:text-[#B7C9C2] tracking-wider">
              Rejected Applications
            </span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {rejectedCount}
            </span>
            <span className="text-xs text-[#282828]/50 dark:text-[#7F9990]">declined submissions</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-[#102B22] p-3.5 rounded-xl border border-[#282828]/10 dark:border-[#25473C] shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-white font-bold shadow-xs'
                : 'text-[#282828]/70 dark:text-[#B7C9C2] hover:bg-[#FAF4EE] dark:hover:bg-[#15362B]'
            }`}
          >
            <span>Pending</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              filterStatus === 'approved'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-[#282828]/70 dark:text-[#B7C9C2] hover:bg-[#FAF4EE] dark:hover:bg-[#15362B]'
            }`}
          >
            <span>Approved</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              filterStatus === 'rejected'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'text-[#282828]/70 dark:text-[#B7C9C2] hover:bg-[#FAF4EE] dark:hover:bg-[#15362B]'
            }`}
          >
            <span>Rejected</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
              {rejectedCount}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              filterStatus === 'all'
                ? 'bg-[#282828] text-white dark:bg-[#2F8068] font-bold shadow-xs'
                : 'text-[#282828]/70 dark:text-[#B7C9C2] hover:bg-[#FAF4EE] dark:hover:bg-[#15362B]'
            }`}
          >
            <span>All Records</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
              {applications.length}
            </span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#282828]/40 dark:text-[#7F9990]" />
          <input
            type="text"
            placeholder="Search applicant name, email, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#FAF4EE]/70 dark:bg-[#0C241C] border border-[#282828]/15 dark:border-[#294B40] text-xs text-[#282828] dark:text-[#F1F7F4] focus:outline-none focus:ring-1 focus:ring-[#FC6454] dark:focus:ring-[#6BB89E]"
          />
        </div>
      </div>

      {/* Applications Table / Cards */}
      {filteredApplications.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-[#102B22] border-[#282828]/10 dark:border-[#25473C]">
          <ClipboardCheck className="w-12 h-12 mx-auto text-[#282828]/30 dark:text-[#7F9990] mb-3" />
          <h3 className="font-bold text-sm text-[#282828] dark:text-[#F1F7F4]">
            {filterStatus === 'pending'
              ? 'No pending applications waiting for review'
              : 'No applications match your current filter'}
          </h3>
          <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] mt-1 max-w-md mx-auto">
            {filterStatus === 'pending'
              ? 'All submitted student registrations have been reviewed. New applications from the website will appear here in real time.'
              : 'Try switching filters or clearing your search query to see other applicants.'}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#282828]/10 dark:border-[#25473C] shadow-xs">
          <table className="w-full text-left text-xs text-[#282828] dark:text-[#F1F7F4] bg-white dark:bg-[#102B22]">
            <thead className="bg-[#FAF4EE] dark:bg-[#0A211A] text-[#282828]/70 dark:text-[#B7C9C2] border-b border-[#282828]/10 dark:border-[#25473C] uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Applicant Info</th>
                <th className="p-3">Class &amp; Track</th>
                <th className="p-3">Contact</th>
                <th className="p-3 min-w-[200px]">Essay &amp; Statement</th>
                <th className="p-3">Documents / Info</th>
                <th className="p-3">Applied Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282828]/10 dark:divide-[#25473C] font-sans">
              {filteredApplications.map((app) => {
                const awardFiles = app.awardFiles || [];
                const hasDocs = Boolean(app.award || awardFiles.length > 0);

                return (
                  <tr
                    key={app.id}
                    className="hover:bg-[#FAF4EE]/70 dark:hover:bg-[#15362B] transition-colors"
                  >
                    {/* Applicant Info */}
                    <td className="p-3">
                      <div>
                        <div className="font-bold text-[#282828] dark:text-[#F1F7F4] flex items-center gap-1.5">
                          <span>{app.studentName}</span>
                        </div>
                        <div className="font-mono text-[11px] text-[#FC6454] dark:text-[#6BB89E] font-medium mt-0.5">
                          {app.memberId}
                        </div>
                      </div>
                    </td>

                    {/* Class & Track */}
                    <td className="p-3">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded bg-[#FAF4EE] dark:bg-[#0C241C] border border-[#282828]/10 dark:border-[#294B40] text-[11px] font-mono font-semibold text-[#282828] dark:text-[#F1F7F4]">
                          {app.class}
                        </span>
                        {app.course && (
                          <div className="text-[11px] text-[#282828]/70 dark:text-[#B7C9C2] flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-[#FC6454] dark:text-[#6BB89E]" />
                            <span className="truncate max-w-[140px]">{app.course.title}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-3">
                      <div className="space-y-1 text-[11px]">
                        {app.email ? (
                          <div className="flex items-center gap-1.5 text-[#282828]/80 dark:text-[#B7C9C2]">
                            <Mail className="w-3 h-3 text-[#282828]/40 dark:text-[#7F9990] shrink-0" />
                            <span className="truncate max-w-[150px]">{app.email}</span>
                          </div>
                        ) : (
                          <span className="text-[#282828]/40 dark:text-[#7F9990] italic">No email</span>
                        )}

                        <div className="flex items-center gap-1.5 font-mono text-[#282828]/70 dark:text-[#B7C9C2]">
                          <Phone className="w-3 h-3 text-[#282828]/40 dark:text-[#7F9990] shrink-0" />
                          <span>{app.phoneNumber}</span>
                        </div>

                        {app.telegramUsername && (
                          <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-mono text-[10px]">
                            <Send className="w-2.5 h-2.5" />
                            <span>{app.telegramUsername}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Essay / Statement */}
                    <td className="p-3 max-w-[230px]">
                      {app.motivationEssay || app.essay ? (
                        <div
                          onClick={() => handleOpenDetails(app)}
                          className="group cursor-pointer p-2 rounded-lg bg-[#FAF4EE]/70 dark:bg-[#0C241C] border border-[#282828]/10 dark:border-[#25473C] hover:border-[#FC6454]/40 dark:hover:border-[#6BB89E]/40 transition-colors"
                          title="Click to read full statement"
                        >
                          <div className="flex items-center gap-1 text-[10px] font-mono text-[#FC6454] dark:text-[#6BB89E] mb-1 font-semibold">
                            <MessageSquare className="w-3 h-3 shrink-0" />
                            <span>Statement</span>
                          </div>
                          <p className="line-clamp-2 text-[11px] text-[#282828]/80 dark:text-[#B7C9C2] italic leading-snug group-hover:text-[#282828] dark:group-hover:text-[#F1F7F4]">
                            "{app.motivationEssay || app.essay}"
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#282828]/40 dark:text-[#7F9990] italic">
                          No statement written
                        </span>
                      )}
                    </td>

                    {/* Documents / Info */}
                    <td className="p-3">
                      {hasDocs ? (
                        <div className="space-y-1">
                          {app.award && (
                            <div className="text-[11px] font-medium text-[#282828] dark:text-[#F1F7F4] flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate max-w-[140px]">{app.award}</span>
                            </div>
                          )}

                          {awardFiles.length > 0 && (
                            <button
                              onClick={() => handleOpenDetails(app)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                              <FileText className="w-3 h-3" />
                              <span>{awardFiles.length} file{awardFiles.length > 1 ? 's' : ''} uploaded</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#282828]/40 dark:text-[#7F9990] italic">
                          None submitted
                        </span>
                      )}
                    </td>

                    {/* Applied Date */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="text-[11px] text-[#282828]/80 dark:text-[#B7C9C2]">
                        {formatDate(app.createdAt)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(app.status)}
                        {app.status === 'rejected' && app.rejectionReason && (
                          <p className="text-[10px] text-rose-600 dark:text-rose-400 max-w-[130px] truncate" title={app.rejectionReason}>
                            Reason: {app.rejectionReason}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => handleOpenDetails(app)}
                          className="p-1.5 rounded-lg border border-[#282828]/15 dark:border-[#25473C] text-[#282828]/70 dark:text-[#B7C9C2] hover:bg-[#FAF4EE] dark:hover:bg-[#15362B] transition-colors cursor-pointer"
                          title="View Full Application Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleOpenApproveModal(app)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              title="Approve Applicant"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>

                            <button
                              onClick={() => handleOpenRejectModal(app)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              title="Reject Applicant"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {app.status === 'rejected' && (
                          <button
                            onClick={() => handleOpenApproveModal(app)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-700 text-white font-mono text-[11px] font-medium transition-colors cursor-pointer"
                            title="Reconsider and Approve"
                          >
                            Approve
                          </button>
                        )}

                        {app.status === 'approved' && (
                          <button
                            onClick={() => handleOpenRejectModal(app)}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-mono text-[11px] font-medium transition-colors cursor-pointer"
                            title="Revoke Approval"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: APPLICATION DETAILS MODAL */}
      <Modal
        isOpen={viewDetailModal}
        onClose={() => setViewDetailModal(false)}
        title="Application Dossier"
        maxWidth="lg"
      >
        {selectedApp && (
          <div className="space-y-5 text-xs text-[#282828] dark:text-[#F1F7F4]">
            {/* Top Summary Card */}
            <div className="p-4 rounded-xl bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4]">
                  {selectedApp.studentName}
                </h3>
                <p className="font-mono text-xs text-[#FC6454] dark:text-[#6BB89E] font-medium">
                  {selectedApp.memberId} &bull; Section {selectedApp.class}
                </p>
              </div>
              <div>{getStatusBadge(selectedApp.status)}</div>
            </div>

            {/* Grid of Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/10 dark:border-[#25473C]">
                <span className="text-[10px] font-mono text-[#282828]/60 dark:text-[#7F9990] uppercase block">
                  Email Address
                </span>
                <span className="font-medium text-[#282828] dark:text-[#F1F7F4]">
                  {selectedApp.email || 'Not provided'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/10 dark:border-[#25473C]">
                <span className="text-[10px] font-mono text-[#282828]/60 dark:text-[#7F9990] uppercase block">
                  Phone Number
                </span>
                <span className="font-medium font-mono text-[#282828] dark:text-[#F1F7F4]">
                  {selectedApp.phoneNumber}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/10 dark:border-[#25473C]">
                <span className="text-[10px] font-mono text-[#282828]/60 dark:text-[#7F9990] uppercase block">
                  Telegram Username
                </span>
                <span className="font-medium font-mono text-cyan-600 dark:text-cyan-400">
                  {selectedApp.telegramUsername}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/10 dark:border-[#25473C]">
                <span className="text-[10px] font-mono text-[#282828]/60 dark:text-[#7F9990] uppercase block">
                  Enrolled Track
                </span>
                <span className="font-medium text-[#282828] dark:text-[#F1F7F4]">
                  {selectedApp.course?.title || 'General Curriculum'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/10 dark:border-[#25473C]">
                <span className="text-[10px] font-mono text-[#282828]/60 dark:text-[#7F9990] uppercase block">
                  Submission Date
                </span>
                <span className="font-medium text-[#282828] dark:text-[#F1F7F4]">
                  {formatDate(selectedApp.createdAt)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#0C241C] border border-[#282828]/10 dark:border-[#25473C]">
                <span className="text-[10px] font-mono text-[#282828]/60 dark:text-[#7F9990] uppercase block">
                  Telegram Bot Verified
                </span>
                <span className="font-medium text-[#282828] dark:text-[#F1F7F4]">
                  {selectedApp.telegramActivated ? 'Yes (Linked)' : 'No (Pending Link)'}
                </span>
              </div>
            </div>

            {/* Applicant Motivation Essay / Paragraph */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0C241C] border border-[#282828]/10 dark:border-[#25473C] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#FC6454] dark:text-[#6BB89E] font-bold tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#FC6454] dark:text-[#6BB89E]" />
                  Application Essay &amp; Motivation Paragraph
                </span>
                {(selectedApp.motivationEssay || selectedApp.essay) && (
                  <span className="text-[10px] font-mono text-[#282828]/60 dark:text-[#7F9990] bg-[#FAF4EE] dark:bg-[#102B22] px-2 py-0.5 rounded border border-[#282828]/10 dark:border-[#25473C]">
                    {(selectedApp.motivationEssay || selectedApp.essay).length} chars
                  </span>
                )}
              </div>

              {selectedApp.motivationEssay || selectedApp.essay ? (
                <div className="p-3.5 rounded-lg bg-[#FAF4EE]/70 dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C]">
                  <p className="text-xs text-[#282828] dark:text-[#F1F7F4] leading-relaxed whitespace-pre-wrap font-sans">
                    "{selectedApp.motivationEssay || selectedApp.essay}"
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#FAF4EE]/40 dark:bg-[#102B22]/40 border border-dashed border-[#282828]/15 dark:border-[#25473C] text-xs text-[#282828]/50 dark:text-[#7F9990] italic">
                  No personal essay or statement submitted for this applicant.
                </div>
              )}
            </div>

            {/* Submitted Awards / Supporting Info */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0C241C] border border-[#282828]/10 dark:border-[#25473C] space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#FC6454] dark:text-[#6BB89E] font-bold tracking-wider">
                Submitted Awards &amp; Experience
              </span>
              <p className="text-xs text-[#282828]/80 dark:text-[#B7C9C2]">
                {selectedApp.award || 'No prior awards or honors stated.'}
              </p>
            </div>

            {/* Supporting Document Files */}
            {selectedApp.awardFiles && selectedApp.awardFiles.length > 0 && (
              <div className="p-4 rounded-xl bg-white dark:bg-[#0C241C] border border-[#282828]/10 dark:border-[#25473C] space-y-3">
                <span className="text-[10px] font-mono uppercase text-[#FC6454] dark:text-[#6BB89E] font-bold tracking-wider">
                  Supporting Documents & Files ({selectedApp.awardFiles.length})
                </span>
                <div className="space-y-3">
                  {selectedApp.awardFiles.map((file) => {
                    const mime = (file.mimeType || '').toLowerCase();
                    const isImage = mime.startsWith('image/') ||
                      /\.(jpg|jpeg|png|webp|gif)$/i.test(file.originalFilename || '');
                    const token = (typeof window !== 'undefined' && (localStorage.getItem('itclub_auth_token') || localStorage.getItem('token'))) || '';
                    const downloadUrl = `/api/admin/award-files/${file.id}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
                    const previewSrc = file.dataUrl || downloadUrl;

                    return (
                      <div key={file.id} className="rounded-lg border border-[#282828]/10 dark:border-[#25473C] overflow-hidden">
                        {/* Image Preview */}
                        {isImage && (
                          <div className="bg-[#FAF4EE] dark:bg-[#102B22] flex items-center justify-center p-2 max-h-72 overflow-hidden">
                            <img
                              src={previewSrc}
                              alt={file.originalFilename}
                              className="max-h-64 max-w-full object-contain rounded shadow-sm"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}
                        {/* File Info + Download Row */}
                        <div className="flex items-center justify-between p-2.5 bg-[#FAF4EE]/60 dark:bg-[#0A211A]/60">
                          <div className="flex items-center gap-2 min-w-0">
                            {isImage ? (
                              <ExternalLink className="w-4 h-4 text-indigo-500 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#282828] dark:text-[#F1F7F4] truncate">
                                {file.originalFilename}
                              </p>
                              <span className="text-[10px] font-mono text-[#282828]/50 dark:text-[#7F9990]">
                                {isImage ? 'Image' : 'Document'} · {file.formattedSize || 'File'}
                              </span>
                            </div>
                          </div>
                          <a
                            href={file.dataUrl || downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={file.originalFilename}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-[#15362B] border border-[#282828]/15 dark:border-[#25473C] text-[11px] font-mono font-medium hover:bg-[#FAF4EE] text-[#282828] dark:text-[#F1F7F4] transition-colors shrink-0"
                          >
                            <Download className="w-3 h-3 text-[#FC6454] dark:text-[#6BB89E]" />
                            <span>{isImage ? 'Open / View' : 'Download'}</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rejection Details if rejected */}
            {selectedApp.status === 'rejected' && selectedApp.rejectionReason && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300">
                <span className="font-bold font-mono uppercase text-[10px] block text-rose-600 dark:text-rose-400">
                  Rejection Reason Given:
                </span>
                <p className="mt-1">{selectedApp.rejectionReason}</p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#282828]/10 dark:border-[#25473C] flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewDetailModal(false)}
              >
                Close
              </Button>

              {selectedApp.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setViewDetailModal(false);
                      handleOpenRejectModal(selectedApp);
                    }}
                  >
                    Reject Application
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setViewDetailModal(false);
                      handleOpenApproveModal(selectedApp);
                    }}
                  >
                    Approve Application
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: CONFIRM APPROVAL DIALOG */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => !approving && setApproveModalOpen(false)}
        title="Confirm Application Approval"
        maxWidth="md"
      >
        {appToApprove && (
          <div className="space-y-4 text-xs text-[#282828] dark:text-[#F1F7F4]">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-[#58B889] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                  Activate student membership?
                </h4>
                <p className="text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed">
                  Approving this application will grant <strong>{appToApprove.studentName}</strong> (
                  <span className="font-mono font-bold">{appToApprove.memberId}</span>) full active access to the ARX IT CLUB OF SJS member portal and enroll them into their chosen track.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] space-y-1.5 text-xs">
              <div><strong>Applicant:</strong> {appToApprove.studentName}</div>
              <div><strong>Class:</strong> {appToApprove.class}</div>
              <div><strong>Course:</strong> {appToApprove.course?.title || 'General Curriculum'}</div>
              <div><strong>Phone:</strong> {appToApprove.phoneNumber}</div>
              {(appToApprove.motivationEssay || appToApprove.essay) && (
                <div className="pt-1.5 mt-1 border-t border-[#282828]/10 dark:border-[#25473C]">
                  <strong className="text-[11px] block text-[#282828]/60 dark:text-[#7F9990]">Motivation Statement:</strong>
                  <p className="line-clamp-2 italic text-[#282828]/80 dark:text-[#B7C9C2] mt-0.5">
                    "{appToApprove.motivationEssay || appToApprove.essay}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={approving}
                onClick={() => setApproveModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={approving}
                onClick={handleConfirmApprove}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Confirm &amp; Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 3: CONFIRM REJECTION DIALOG */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => !rejecting && setRejectModalOpen(false)}
        title="Reject Student Application"
        maxWidth="md"
      >
        {appToReject && (
          <div className="space-y-4 text-xs text-[#282828] dark:text-[#F1F7F4]">
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-900 dark:text-rose-200 text-sm">
                  Decline application for {appToReject.studentName}?
                </h4>
                <p className="text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                  The applicant will not be permitted to sign into the student portal. You may specify an optional explanation below.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
                Rejection Reason (Optional feedback for applicant)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Prerequisite requirements not met, or incomplete verification info..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#282828]/20 dark:border-[#294B40] text-xs bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <p className="text-[10px] text-[#282828]/50 dark:text-[#7F9990] mt-1">
                If provided, this note will be shown to the applicant if they attempt to sign in.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={rejecting}
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={rejecting}
                onClick={handleConfirmReject}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
