import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { CertificateModal } from '../../components/common/CertificateModal.jsx';
import { Award, Download, Eye, ExternalLink, ShieldCheck } from 'lucide-react';





export const MyCertificatesPage = ({ navigate }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    async function loadCerts() {
      try {
        const res = await api.getMemberCertificates();
        if (res.certificates) setCertificates(res.certificates);
      } catch (err) {
        console.error('Failed to load certificates', err);
      } finally {
        setLoading(false);
      }
    }
    loadCerts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282828]/10 dark:border-[#25473C] pb-4">
        <div>
          <span className="text-xs font-mono text-[#FC6454] dark:text-[#6BB89E] uppercase tracking-wider">
            CREDENTIAL REGISTRY
          </span>
          <h1 className="text-2xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight mt-1">
            My Certificates
          </h1>
          <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
            Verified credentials earned through completed IT Club courses and assessments.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/certificates')}>
          
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-[#FC6454] dark:text-[#6BB89E]" />
          Verify Credentials Publicly
        </Button>
      </div>

      {loading ?
      <div className="py-16 text-center text-xs font-mono text-[#282828]/50 dark:text-[#7F9990]">Loading certificates...</div> :
      certificates.length === 0 ?
      <div className="py-16 text-center bg-[#FAF4EE] dark:bg-[#102B22] rounded-lg border border-[#282828]/10 dark:border-[#25473C] p-8 space-y-4">
          <Award className="w-10 h-10 text-[#282828]/40 dark:text-[#7F9990] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#282828] dark:text-[#F1F7F4]">
              No certificates issued yet
            </h3>
            <p className="text-xs text-[#282828]/60 dark:text-[#B7C9C2] max-w-sm mx-auto">
              Complete your first course track to unlock an official verified IT Club certificate.
            </p>
          </div>
          <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/portal/courses')}>
          
            Explore Courses
          </Button>
        </div> :

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) =>
        <div
          key={cert.id}
          className="p-6 border border-[#282828]/10 dark:border-[#25473C] flex flex-col justify-between space-y-4 rounded-lg bg-white dark:bg-[#102B22] shadow-xs hover:border-[#FC6454]/40 dark:hover:border-[#366656] transition-colors">
          
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-md bg-[#EFE6DE]/60 dark:bg-[#15362B] text-[#FC6454] dark:text-[#6BB89E] border border-[#282828]/10 dark:border-[#25473C] flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <Badge variant="emerald" size="sm">
                    {cert.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#282828] dark:text-[#F1F7F4]">{cert.courseName}</h3>
                  <p className="text-xs font-mono text-[#282828]/50 dark:text-[#7F9990] mt-1">
                    Completed: <span className="text-[#282828] dark:text-[#F1F7F4] font-semibold">{cert.issueDate}</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-md bg-[#FAF4EE] dark:bg-[#0C241C] border border-[#282828]/10 dark:border-[#294B40] font-mono text-xs flex items-center justify-between">
                  <span className="text-[#282828]/50 dark:text-[#7F9990]">ID:</span>
                  <span className="font-bold text-[#FC6454] dark:text-[#6BB89E]">{cert.certificateId}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-[#282828]/10 dark:border-[#25473C] flex items-center justify-end gap-2">
                <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCert(cert)}>
              
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  View
                </Button>
                <Button
              variant="primary"
              size="sm"
              onClick={() => setSelectedCert(cert)}>
              
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download
                </Button>
              </div>
            </div>
        )}
        </div>
      }

      {/* Certificate Modal */}
      <CertificateModal
        certificate={selectedCert}
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        onVerifyOnline={(certId) => navigate(`/certificates?id=${certId}`)} />
      
    </div>);

};