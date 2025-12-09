import Constants from 'expo-constants';

// Configure API base URL
// For iOS simulator/Android emulator: use 'http://localhost:3003'
// For physical devices: use your computer's local IP address (e.g., 'http://192.168.1.100:3003')
// For production: use your production API URL
const getApiBaseUrl = (): string => {
  const apiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (apiUrl) {
    return `${apiUrl}/api/v1`;
  }
  // Default to localhost for development
  // Change this to your computer's IP address if testing on physical device
  // return 'http://localhost:3003/api/v1';
  return `${API_URL}/api/v1`
};
const API_URL="http://localhost:3003";
// const API_URL="http://192.168.106.199:3003";
const API_BASE_URL = getApiBaseUrl();

interface LoginResponse {
  token: string;
}

interface SignupResponse {
  msg: string;
}

interface ErrorResponse {
  msg: string;
}

export async function login(emailId: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailId,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ msg: 'Login failed' }));
      throw new Error((errorData as ErrorResponse).msg || `Login failed: ${response.status}`);
    }

    const data = await response.json();
    return data as LoginResponse;
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch')) {
      throw new Error('Network error. Please check if the backend server is running on port 3003.');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
}

export async function signup(
  username: string,
  emailId: string,
  password: string,
  role: 'salesperson' | 'fieldperson' | 'admin' = 'salesperson'
): Promise<SignupResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        emailId,
        password,
        role,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ msg: 'Signup failed' }));
      throw new Error((errorData as ErrorResponse).msg || `Signup failed: ${response.status}`);
    }

    const data = await response.json();
    return data as SignupResponse;
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch')) {
      throw new Error('Network error. Please check if the backend server is running on port 3003.');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
}

// Dashboard API functions
export interface Client {
  _id: string;
  name: string;
  phoneNo: string;
  location?: string;
  assignedTo?: string;
  createdAt: string;
}

export interface Lead {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    phoneNo: string;
    location?: string;
  };
  userId: string;
  loanType: 'personal' | 'business' | 'student' | 'home';
  loanStatus: 'hot' | 'warm' | 'cold';
  createdAt: string;
  updatedAt?: string;
}

export interface CallLog {
  _id: string;
  userId: string;
  clientId: {
    _id: string;
    name: string;
    phoneNo: string;
    location?: string;
  };
  status: 'connected' | 'rejected' | 'followup' | 'missed';
  callType?: 'incoming' | 'outgoing' | 'missed';
  duration?: string;
  calledTime: string;
  note?: string;
}

export type MeetStatus = 'met' | 'notmet' | 'meetagain';

export interface MeetLog {
  _id: string;
  fieldPersonId: {
    _id: string;
    username: string;
    emailId: string;
  };
  clientId: {
    _id: string;
    name: string;
    phoneNo: string;
    location?: string;
  };
  meetStatus: MeetStatus;
  distanceTravelled?: number;
  timestamp: string;
  notes?: string;
}

export interface Statistics {
  totalCalls: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  // Optional fields to stay in sync with backend while remaining backwards compatible
  totalMeets?: number;
  meetStatusCounts?: Record<MeetStatus, number>;
}

async function fetchWithAuth(url: string, token: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ msg: 'Request failed' }));
    throw new Error((errorData as ErrorResponse).msg || `Request failed: ${response.status}`);
  }

  return response.json();
}

export async function getClients(userId: string, token: string): Promise<Client[]> {
  try {
    console.log(`[API] Fetching clients for user: ${userId}`);
    const data = await fetchWithAuth(`${API_BASE_URL}/clients/${userId}`, token);
    const clients = data.data || data || [];
    console.log(`[API] Found ${clients.length} clients`);
    return clients;
  } catch (error) {
    console.error('[API] Error fetching clients:', error);
    throw error;
  }
}

export async function getLeads(userId: string, token: string): Promise<Lead[]> {
  try {
    console.log(`[API] Fetching leads for user: ${userId}`);
    const data = await fetchWithAuth(`${API_BASE_URL}/leads/${userId}`, token);
    const leads = data.data || data || [];
    console.log(`[API] Found ${leads.length} leads`);
    return leads;
  } catch (error) {
    console.error('[API] Error fetching leads:', error);
    throw error;
  }
}

export async function createLead(
  leadData: {
    clientId: string;
    loanType: 'personal' | 'business' | 'student' | 'home';
    loanStatus: 'hot' | 'warm' | 'cold';
    userId: string;
  },
  token: string
): Promise<Lead> {
  try {
    console.log('[API] Creating lead:', leadData);
    const data = await fetchWithAuth(
      `${API_BASE_URL}/leads`,
      token,
      {
        method: 'POST',
        body: JSON.stringify(leadData),
      }
    );
    console.log('[API] Lead created successfully:', data);
    return data.data || data;
  } catch (error) {
    console.error('[API] Error creating lead:', error);
    throw error;
  }
}

export async function getCallLogs(userId: string, token: string): Promise<CallLog[]> {
  try {
    console.log(`[API] Fetching call logs for user: ${userId}`);
    const data = await fetchWithAuth(`${API_BASE_URL}/calllogs/${userId}`, token);
    const callLogs = data.data || data || [];
    console.log(`[API] Found ${callLogs.length} call logs`);
    return callLogs;
  } catch (error) {
    console.error('[API] Error fetching call logs:', error);
    throw error;
  }
}

export async function createCallLog(
  callLogData: {
    clientId: string;
    status: 'connected' | 'rejected' | 'followup' | 'missed';
    callType: 'incoming' | 'outgoing' | 'missed';
    duration?: string;
    calledTime: string;
    note?: string;
    userId: string;
  },
  token: string
): Promise<CallLog> {
  try {
    console.log('[API] Creating call log:', callLogData);
    const data = await fetchWithAuth(
      `${API_BASE_URL}/calllogs`,
      token,
      {
        method: 'POST',
        body: JSON.stringify(callLogData),
      }
    );
    console.log('[API] Call log created successfully:', data);
    return data.data || data;
  } catch (error) {
    console.error('[API] Error creating call log:', error);
    throw error;
  }
}

export async function getMeetLogs(fieldPersonId: string, token: string): Promise<MeetLog[]> {
  try {
    console.log(`[API] Fetching meet logs for field person: ${fieldPersonId}`);
    const data = await fetchWithAuth(
      `${API_BASE_URL}/fieldperson/meetlogs?fieldPersonId=${fieldPersonId}`,
      token
    );
    const meetLogs = data.data || data || [];
    console.log(`[API] Found ${meetLogs.length} meet logs`);
    return meetLogs;
  } catch (error) {
    console.error('[API] Error fetching meet logs:', error);
    throw error;
  }
}

export async function createMeetLog(
  meetLogData: {
    clientId: string;
    fieldPersonId: string;
    meetStatus: MeetStatus;
    distanceTravelled?: number;
    timestamp?: string;
    notes?: string;
  },
  token: string
): Promise<MeetLog> {
  try {
    console.log('[API] Creating meet log:', meetLogData);
    const data = await fetchWithAuth(`${API_BASE_URL}/fieldperson/meetlogs`, token, {
      method: 'POST',
      body: JSON.stringify(meetLogData),
    });
    console.log('[API] Meet log created successfully:', data);
    return data.data || data;
  } catch (error) {
    console.error('[API] Error creating meet log:', error);
    throw error;
  }
}

export interface MeetStatistics {
  totalMeets: number;
  meetStatusCounts: Record<MeetStatus, number>;
}

export async function getMeetStatistics(fieldPersonId: string, token: string): Promise<MeetStatistics> {
  try {
    console.log(`[API] Fetching meet statistics for field person: ${fieldPersonId}`);
    const data = await fetchWithAuth(
      `${API_BASE_URL}/fieldperson/meetlogs/statistics?fieldPersonId=${fieldPersonId}`,
      token
    );
    const stats = data.data || data;
    return {
      totalMeets: stats.totalMeets ?? 0,
      meetStatusCounts: stats.meetStatusCounts ?? { met: 0, notmet: 0, meetagain: 0 },
    };
  } catch (error) {
    console.error('[API] Error fetching meet statistics:', error);
    return {
      totalMeets: 0,
      meetStatusCounts: { met: 0, notmet: 0, meetagain: 0 },
    };
  }
}

export async function getStatistics(userId: string, token: string): Promise<Statistics> {
  try {
    console.log(`[API] Fetching statistics for user: ${userId}`);
    const data = await fetchWithAuth(`${API_BASE_URL}/statistics/${userId}`, token);
    const stats = data.data || data;
    console.log('[API] Statistics retrieved:', stats);
    return stats;
  } catch (error) {
    console.error('[API] Error fetching statistics:', error);
    // Return default stats if API fails
    return {
      totalCalls: 0,
      hotLeads: 0,
      warmLeads: 0,
      coldLeads: 0,
    };
  }
}

export interface UserInfo {
  id: string;
  username: string;
  emailId: string;
  role: 'salesperson' | 'fieldperson' | 'admin';
  createdAt: string;
}

export async function getUserInfo(token: string): Promise<UserInfo> {
  try {
    console.log('[API] Fetching user info');
    const data = await fetchWithAuth(`${API_BASE_URL}/users/me`, token);
    const userInfo = data.data || data;
    console.log('[API] User info retrieved:', userInfo);
    return userInfo;
  } catch (error) {
    console.error('[API] Error fetching user info:', error);
    throw error;
  }
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  msg: string;
}

export async function changePassword(
  passwordData: ChangePasswordRequest,
  token: string
): Promise<ChangePasswordResponse> {
  try {
    console.log('[API] Changing password');
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ msg: 'Password change failed' }));
      throw new Error((errorData as ErrorResponse).msg || `Password change failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API] Password changed successfully');
    return data as ChangePasswordResponse;
  } catch (error) {
    console.error('[API] Error changing password:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
}
