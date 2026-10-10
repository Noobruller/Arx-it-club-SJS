
import { db } from '../services/db.js';

export const certificateController = {
  verify(req, res) {
    const { certificateId } = req.params;

    if (!certificateId || typeof certificateId !== 'string') {
      res.status(400).json({ error: 'Please provide a Certificate ID to verify.' });
      return;
    }

    const cert = db.verifyCertificateByCertId(certificateId.trim());

    if (!cert) {
      res.status(404).json({
        verified: false,
        error: 'Certificate not found. Please double-check the Certificate ID or contact IT Club administration.'
      });
      return;
    }

    res.json({
      verified: true,
      status: cert.status,
      certificate: {
        certificateId: cert.certificateId,
        studentName: cert.studentName,
        courseName: cert.courseName,
        issueDate: cert.issueDate,
        status: cert.status,
        authorizedSignatures: cert.authorizedSignatures,
        qrData: cert.qrData
      }
    });
  },

  getById(req, res) {
    const { id } = req.params;
    const cert = db.getCertificateById(id) || db.verifyCertificateByCertId(id);

    if (!cert) {
      res.status(404).json({ error: 'Certificate not found.' });
      return;
    }

    res.json({ certificate: cert });
  }
};