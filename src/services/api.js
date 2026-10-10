

const TOKEN_KEY = 'itclub_auth_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to save token to localStorage', err);
  }
}

export function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error('Failed to remove token from localStorage', err);
  }
}

// Base URL for API requests.
// When VITE_API_URL is set (e.g., https://api.arxitclub.org), all requests
// route to the external self-hosted backend server. When unset, requests use
// relative paths (same-origin, suitable for unified deployments).
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : '';

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    // Include credentials (cookies) for cross-origin requests to the self-hosted backend
    credentials: 'include'
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('Upload payload too large. The files you attached exceed the server limit. Please upload smaller or compressed files (under 2.5MB).');
    }
    const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export const api = {
  // Public Website Settings
  async getSettings() {
    return request('/api/settings');
  },

  async getPublicSettings() {
    return request('/api/settings');
  },

  // Auth
  async register(params)













  {
    return request(
























      '/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(params)
      });
  },

  async activateAccount(code, memberId) {
    return request(















      '/api/auth/activate', {
        method: 'POST',
        body: JSON.stringify({ code, memberId })
      });
  },

  async login(credentials) {
    return request(




      '/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
  },

  async adminLogin(credentials) {
    return request(




      '/api/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
  },

  async logout() {
    clearStoredToken();
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {

      // Ignore errors on logout
    }},

  async getMe() {
    return request('/api/auth/me');
  },

  // Member Portal
  async getProfile() {
    return request('/api/members/profile');
  },

  async updateProfile(updates) {
    return request('/api/members/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async changePassword(data) {
    return request('/api/members/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getMemberCourses() {
    return request('/api/members/courses');
  },

  async getMemberCertificates() {
    return request('/api/members/certificates');
  },

  async getMemberAwards() {
    return request('/api/members/awards');
  },

  async getMemberProjects() {
    return request('/api/members/projects');
  },

  async getDashboardSummary() {
    return request(
































      '/api/members/dashboard-summary');
  },

  // Public Courses
  async getCourses(category, search) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (search) params.set('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/courses${queryString}`);
  },

  async getCourseById(id) {
    return request(`/api/courses/${id}`);
  },

  async enrollCourse(courseId) {
    return request(`/api/courses/${courseId}/enroll`, {
      method: 'POST'
    });
  },

  // Public Certificates
  async verifyCertificate(certificateId) {
    return request(



      `/api/certificates/verify/${encodeURIComponent(certificateId)}`);
  },

  async getCertificateById(id) {
    return request(`/api/certificates/${encodeURIComponent(id)}`);
  },

  // Public Projects, Events, Achievements, Stats
  async getProjects(status, category) {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.set('status', status);
    if (category && category !== 'All') params.set('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/projects${qs}`);
  },

  async getEvents(status) {
    const qs = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/api/events${qs}`);
  },

  async registerEvent(eventId, memberId) {
    return request(`/api/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ memberId })
    });
  },

  async getAchievements(category) {
    const qs = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return request(`/api/achievements${qs}`);
  },

  async getStats() {
    return request('/api/stats');
  },

  // ================= ADMIN API =================
  async getAdminOverview() {
    return request(









      '/api/admin/overview');
  },

  // Student Applications Review
  async getAdminApplications(status = 'pending') {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/api/admin/applications${qs}`);
  },

  async approveAdminApplication(id) {
    return request(`/api/admin/applications/${id}/approve`, {
      method: 'PATCH'
    });
  },

  async rejectAdminApplication(id, rejectionReason) {
    return request(`/api/admin/applications/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason })
    });
  },

  async getAdminMembers(q, status) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status && status !== 'all') params.set('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/admin/members${qs}`);
  },

  async getAdminMemberDetail(id) {
    return request(






      `/api/admin/members/${id}`);
  },

  async getAdminMemberAwardFiles(id) {
    return request(`/api/admin/members/${id}/award-files`);
  },

  async updateAdminMember(id, data) {
    return request(`/api/admin/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async toggleAdminMemberStatus(id) {
    return request(`/api/admin/members/${id}/toggle-status`, {
      method: 'POST'
    });
  },

  async deleteAdminMember(id) {
    return request(`/api/admin/members/${id}`, {
      method: 'DELETE'
    });
  },

  async resetAdminMemberPassword(id, newPassword) {
    return request(`/api/admin/members/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    });
  },

  async getAdminCourses() {
    return request('/api/admin/courses');
  },

  async createAdminCourse(courseData) {
    return request('/api/admin/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  },

  async updateAdminCourse(id, courseData) {
    return request(`/api/admin/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
  },

  async deleteAdminCourse(id) {
    return request(`/api/admin/courses/${id}`, {
      method: 'DELETE'
    });
  },

  async getAdminEnrollments() {
    return request('/api/admin/enrollments');
  },

  async updateAdminEnrollment(id, data) {
    return request(`/api/admin/enrollments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async getAdminCertificates() {
    return request('/api/admin/certificates');
  },

  async issueAdminCertificate(data) {
    return request('/api/admin/certificates/issue', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async toggleAdminCertificate(id) {
    return request(`/api/admin/certificates/${id}/toggle`, {
      method: 'POST'
    });
  },

  async deleteAdminCertificate(id) {
    return request(`/api/admin/certificates/${id}`, {
      method: 'DELETE'
    });
  },

  async getAdminAwards() {
    return request('/api/admin/awards');
  },

  async createAdminAward(data) {
    return request('/api/admin/awards', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminAward(id) {
    return request(`/api/admin/awards/${id}`, {
      method: 'DELETE'
    });
  },

  async getAdminProjects() {
    return request('/api/admin/projects');
  },

  async createAdminProject(data) {
    return request('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminProject(id, data) {
    return request(`/api/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminProject(id) {
    return request(`/api/admin/projects/${id}`, {
      method: 'DELETE'
    });
  },

  async getAdminEvents() {
    return request('/api/admin/events');
  },

  async createAdminEvent(data) {
    return request('/api/admin/events', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminEvent(id, data) {
    return request(`/api/admin/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminEvent(id) {
    return request(`/api/admin/events/${id}`, {
      method: 'DELETE'
    });
  },

  async getAdminAchievements() {
    return request('/api/admin/achievements');
  },

  async createAdminAchievement(data) {
    return request('/api/admin/achievements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminAchievement(id, data) {
    return request(`/api/admin/achievements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminAchievement(id) {
    return request(`/api/admin/achievements/${id}`, {
      method: 'DELETE'
    });
  },

  async getAdminAnnouncements() {
    return request('/api/admin/announcements');
  },

  async createAdminAnnouncement(data) {
    return request('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminAnnouncement(id) {
    return request(`/api/admin/announcements/${id}`, {
      method: 'DELETE'
    });
  },

  async getAdminSettings() {
    return request('/api/admin/settings');
  },

  async updateAdminSettings(settings) {
    return request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  async updateSettings(settings) {
    return this.updateAdminSettings(settings);
  },

  async changeAdminPassword(newPassword) {
    return request('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    });
  },

  // Telegram Integrated API Methods
  async getTelegramBroadcasts() {
    return request(








      '/api/telegram/broadcasts');
  },

  async reactToTelegramBroadcast(id, emoji) {
    return request(
      `/api/telegram/broadcasts/${id}/react`,
      {
        method: 'POST',
        body: JSON.stringify({ emoji })
      }
    );
  },

  async sendTelegramBotMessage(command, memberId, fromInfo) {
    return request(




      '/api/telegram/bot', {
        method: 'POST',
        body: JSON.stringify({ command, memberId, fromInfo })
      });
  },

  async getTelegramConfig() {
    return request(







      '/api/telegram/config');
  },

  async getActivationSession(token) {
    return request(











      `/api/telegram/activation-session/${token}`);
  },

  async verifyTelegramChannel(token, telegramUserId) {
    return request(





      '/api/telegram/verify-channel', {
        method: 'POST',
        body: JSON.stringify({ token, telegramUserId })
      });
  },

  async getTelegramWebhookInfo() {
    return request(








      '/api/telegram/webhook-info');
  },

  async syncTelegramWebhook() {
    return request(




      '/api/telegram/sync-webhook', {
        method: 'POST'
      });
  },

  async toggleRegistrationStatus(payload) {
    return request(




      '/api/admin/settings/toggle-registration', {
        method: 'POST',
        body: JSON.stringify(payload || {})
      });
  },

  async setRegistrationStatus(status, closedMessage) {
    return this.toggleRegistrationStatus({ status, closedMessage });
  },

  async getMyActivation() {
    return request(
















      '/api/members/activation');
  },

  async generateMyActivation() {
    return request(








      '/api/members/activation/generate', {
        method: 'POST'
      });
  },

  async createActivationToken() {
    return this.generateMyActivation();
  },

  // Club Resources
  async getClubResources() {
    return request('/api/resources');
  },

  // Public Announcements
  async getAnnouncements() {
    return request('/api/announcements');
  },

  // Media Library Operations
  async getAdminMedia(category, query) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (query && query.trim()) params.append('q', query.trim());
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/admin/media${qs}`);
  },

  async getAdminMediaById(id) {
    return request(`/api/admin/media/${id}`);
  },

  async getAdminMediaUsage(id) {
    return request(`/api/admin/media/${id}/usage`);
  },

  async uploadAdminMedia(data)









  {
    return request('/api/admin/media/upload', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminMediaMetadata(id, data) {
    return request(`/api/admin/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async replaceAdminMedia(
  id,
  data)






  {
    return request(




      `/api/admin/media/${id}/replace`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
  },

  async deleteAdminMedia(id, force = false) {
    const qs = force ? '?force=true' : '';
    return request(`/api/admin/media/${id}${qs}`, {
      method: 'DELETE'
    });
  },

  // --- Public Social Media & Governance ---
  async getPublicSocialLinks() {
    return request('/api/social-links');
  },

  async getGovernanceRoles() {
    return request('/api/governance');
  },

  // --- Admin Social Media Management ---
  async getAdminSocialLinks() {
    return request('/api/admin/social-links');
  },

  async createAdminSocialLink(data) {
    return request('/api/admin/social-links', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminSocialLink(id, data) {
    return request(`/api/admin/social-links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminSocialLink(id) {
    return request(`/api/admin/social-links/${id}`, {
      method: 'DELETE'
    });
  },

  // --- Admin Governance Management ---
  async getAdminGovernance() {
    return request('/api/admin/governance');
  },

  async createAdminGovernance(data) {
    return request('/api/admin/governance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminGovernance(id, data) {
    return request(`/api/admin/governance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminGovernance(id) {
    return request(`/api/admin/governance/${id}`, {
      method: 'DELETE'
    });
  },

  async reorderAdminGovernance(ids) {
    return request('/api/admin/governance/reorder', {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
  },

  // --- Admin Telegram Bot Operations (Requirement 3, 5, 8, 14, 21, 23, 24) ---
  async getAdminTelegramStatus() {
    return request('/api/admin/telegram/status');
  },

  async updateAdminTelegramToken(token) {
    return request(





      '/api/admin/telegram/token', {
        method: 'POST',
        body: JSON.stringify({ token })
      });
  },

  async testAdminTelegramConnection() {
    return request(




      '/api/admin/telegram/test', {
        method: 'POST'
      });
  },

  async getAdminBotCommands() {
    return request('/api/admin/telegram/commands');
  },

  async updateAdminBotCommand(command, updates) {
    return request('/api/admin/telegram/commands', {
      method: 'PUT',
      body: JSON.stringify({ command, updates })
    });
  },

  async syncAdminBotCommands() {
    return request('/api/admin/telegram/commands/sync', {
      method: 'POST'
    });
  },

  async getAdminBotContent() {
    return request('/api/admin/telegram/content');
  },

  async updateAdminBotContent(content) {
    return request('/api/admin/telegram/content', {
      method: 'PUT',
      body: JSON.stringify(content)
    });
  },

  // --- Attendance Management ---
  async checkInAttendance(memberId) {
    return request('/api/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ memberId })
    });
  },

  async getAttendanceStatus() {
    return request('/api/attendance/status');
  },

  async getMyAttendanceHistory() {
    return request('/api/attendance/my-history');
  }
};