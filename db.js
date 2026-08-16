/**
 * ===================================================================
 * TRIANGLE AGENCY - DATABASE & CLOUD SYNC SERVICE (db.js)
 * ===================================================================
 * Manages dual-layer storage:
 * 1. Fast Local Storage (Immediate UI response & Offline support)
 * 2. Google Sheets Cloud Database (Via Google Apps Script Web App API)
 * ===================================================================
 */

const CloudDB = (function () {
  const STORAGE_KEY_ACCOUNTS = 'triangle_accounts';
  const STORAGE_KEY_CURRENT_USER = 'triangle_current_user';
  const STORAGE_KEY_API_URL = 'triangle_cloud_api_url';
  const STORAGE_KEY_AUTO_SYNC = 'triangle_cloud_auto_sync';

  // Default Sheet link: https://docs.google.com/spreadsheets/d/1vzmWRsqqpFkf7nMKp5CdsZGVqHHDdNtxCaCItAbnKhM/edit
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1vzmWRsqqpFkf7nMKp5CdsZGVqHHDdNtxCaCItAbnKhM/edit';

  function getApiUrl() {
    return localStorage.getItem(STORAGE_KEY_API_URL) || '';
  }

  function setApiUrl(url) {
    if (url) {
      localStorage.setItem(STORAGE_KEY_API_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_API_URL);
    }
  }

  function isAutoSyncEnabled() {
    return localStorage.getItem(STORAGE_KEY_AUTO_SYNC) !== 'false';
  }

  function setAutoSync(enabled) {
    localStorage.setItem(STORAGE_KEY_AUTO_SYNC, enabled ? 'true' : 'false');
  }

  // Get local accounts
  function getLocalAccounts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_ACCOUNTS) || '{}');
    } catch (e) {
      return {};
    }
  }

  // Set local accounts
  function setLocalAccounts(accounts) {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  }

  // Ensure default master admin account
  function ensureAdminAccount() {
    const accounts = getLocalAccounts();
    if (!accounts['admin']) {
      accounts['admin'] = {
        username: 'admin',
        password: 'admin',
        role: 'admin',
        createdDate: new Date().toISOString(),
        character: {
          name: 'Central Overseer (Admin)',
          title: 'General Director',
          standing: 'Executive Standing',
          id: 'DIR-000',
          arc: {
            anomaly: 'Omniscience',
            reality: 'Directorate Office',
            competency: 'Executive Oversight',
            primeDirective: 'Preserve Agency Continuity',
            burnoutRelease: 'Execute Audit Protocol',
            sanctionedBehaviors: [
              { text: 'Review Field Agent Dossiers', done: true },
              { text: 'Maintain Database Security', done: true }
            ]
          },
          commendations: 10,
          demerits: 0,
          burnout: 0,
          qualities: {
            attentiveness: { max: 5, current: 5 },
            professionalism: { max: 5, current: 5 },
            presence: { max: 5, current: 5 }
          }
        }
      };
      setLocalAccounts(accounts);
    }
    return accounts;
  }

  // Save or update an account
  async function saveAccount(account) {
    const username = account.username || (account.character && account.character.name);
    if (!username) return false;

    // 1. Save locally
    const accounts = getLocalAccounts();
    accounts[username] = {
      username: username,
      password: account.password || (accounts[username] ? accounts[username].password : ''),
      role: account.role || (accounts[username] ? accounts[username].role : 'agent'),
      character: account.character,
      createdAt: accounts[username] ? accounts[username].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLocalAccounts(accounts);

    // 2. Sync to Cloud if API URL is configured
    const apiUrl = getApiUrl();
    if (apiUrl && isAutoSyncEnabled()) {
      try {
        await fetch(apiUrl, {
          method: 'POST',
          mode: 'no-cors', // Google Apps Script Web App standard
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'saveAccount',
            account: accounts[username]
          })
        });
        console.log(`[CloudDB] Synced ${username} to Google Sheets`);
      } catch (err) {
        console.warn(`[CloudDB] Could not sync ${username} to cloud:`, err);
      }
    }
    return true;
  }

  // Delete an account
  async function deleteAccount(username) {
    const accounts = getLocalAccounts();
    if (accounts[username]) {
      delete accounts[username];
      setLocalAccounts(accounts);
    }

    if (localStorage.getItem(STORAGE_KEY_CURRENT_USER) === username) {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }

    const apiUrl = getApiUrl();
    if (apiUrl && isAutoSyncEnabled()) {
      try {
        await fetch(apiUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'deleteAccount',
            username: username
          })
        });
        console.log(`[CloudDB] Deleted ${username} from Google Sheets`);
      } catch (err) {
        console.warn(`[CloudDB] Could not delete ${username} from cloud:`, err);
      }
    }
  }

  // Pull all accounts from Cloud
  async function pullFromCloud() {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      return { success: false, message: 'กรุณาระบุ Web App URL ของ Google Apps Script ก่อน' };
    }

    try {
      const res = await fetch(apiUrl);
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        const cloudAccounts = json.data;
        const localAccounts = getLocalAccounts();

        // Merge cloud accounts with local accounts
        const merged = Object.assign({}, localAccounts, cloudAccounts);
        setLocalAccounts(merged);
        return { success: true, count: Object.keys(cloudAccounts).length, data: merged };
      } else {
        return { success: false, message: json.message || 'ไม่สามารถดึงข้อมูลได้' };
      }
    } catch (err) {
      return { success: false, message: err.toString() };
    }
  }

  // Push all local accounts to Cloud
  async function pushToCloud() {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      return { success: false, message: 'กรุณาระบุ Web App URL ของ Google Apps Script ก่อน' };
    }

    const accounts = getLocalAccounts();
    try {
      await fetch(apiUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'syncAll',
          accounts: accounts
        })
      });
      return { success: true, count: Object.keys(accounts).length };
    } catch (err) {
      return { success: false, message: err.toString() };
    }
  }

  return {
    SHEET_URL,
    getApiUrl,
    setApiUrl,
    isAutoSyncEnabled,
    setAutoSync,
    getLocalAccounts,
    setLocalAccounts,
    ensureAdminAccount,
    saveAccount,
    deleteAccount,
    pullFromCloud,
    pushToCloud
  };
})();

// Export globally
if (typeof window !== 'undefined') {
  window.CloudDB = CloudDB;
}
