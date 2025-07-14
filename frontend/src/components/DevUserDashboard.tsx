/**
 * NoirCheck - Dev User Dashboard
 * Dashbo  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'upload', label: 'Upload File', icon: Upload },
    { id: 'verify', label: 'Verify', icon: CheckCircle },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];development mode with mock authentication
 */

'use client';

import { useState, useEffect } from 'react';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { User, BarChart3, History, Settings, Upload, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { VerificationResult } from '@/components/VerificationResult';
import { mockApiService } from '@/services/mockApi';

export function DevUserDashboard() {
  const { user, logout } = useMockAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState<any>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos reales del usuario
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Cargar estadísticas del usuario (mock)
        const stats = await mockApiService.getUserStats(user.id);
        setUserStats(stats);
        
        // Cargar historial del usuario (mock)
        const history = await mockApiService.getUserActivity(user.id);
        setUserHistory(history);
        
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'upload', label: 'Subir Archivo', icon: Upload },
    { id: 'verify', label: 'Verificar', icon: CheckCircle },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                NoirCheck <span className="text-red-400">[DEV]</span>
              </h1>
              <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full border border-green-600/30">
                Development Mode
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{user?.username}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-800/30 backdrop-blur-sm rounded-xl p-1 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && <OverviewTab userStats={userStats} loading={loading} />}
          {activeTab === 'upload' && <UploadTab user={user} />}
          {activeTab === 'verify' && <VerifyTab />}
          {activeTab === 'history' && <HistoryTab userHistory={userHistory} loading={loading} />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab({ userStats, loading }: { userStats: any; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Registered Files</p>
              <p className="text-3xl font-bold text-white">{userStats?.totalRegistrations || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Verifications</p>
              <p className="text-3xl font-bold text-white">{userStats?.totalVerifications || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Last Activity</p>
              <p className="text-lg font-bold text-white">
                {userStats?.lastActivity ? new Date(userStats.lastActivity).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button className="p-4 bg-blue-600/20 border border-blue-600/30 rounded-xl text-blue-400 hover:bg-blue-600/30 transition-colors text-left">
            <Upload className="w-6 h-6 mb-2" />
            <h4 className="font-semibold">Register New File</h4>
            <p className="text-sm text-blue-300/70">Upload and register original content on blockchain</p>
          </button>
          
          <button className="p-4 bg-green-600/20 border border-green-600/30 rounded-xl text-green-400 hover:bg-green-600/30 transition-colors text-left">
            <CheckCircle className="w-6 h-6 mb-2" />
            <h4 className="font-semibold">Verify Content</h4>
            <p className="text-sm text-green-300/70">Verify the authenticity of a file</p>
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-green-600/20 border border-green-600/30 rounded-lg">
          <p className="text-green-400 text-sm">
            ✅ Development mode with simulated data: Files are processed with mock responses
          </p>
        </div>
      </div>
    </div>
  );
}

// Upload Tab
function UploadTab({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Register File</h2>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="mb-4 p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg">
          <p className="text-blue-400 text-sm">
            🧪 Development mode: Files will be processed with simulated data
          </p>
        </div>
        
        <FileUpload mode="register" useMockApi={true} />
      </div>
    </div>
  );
}

// Verify Tab
function VerifyTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setVerificationResult(null);
    }
  };

  const handleVerify = async () => {
    if (!selectedFile) return;

    setIsVerifying(true);
    try {
      const result = await mockApiService.verifyContent(selectedFile);
      setVerificationResult(result);
    } catch (error) {
      console.error('Error verifying file:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Verify Authenticity</h2>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="mb-6 p-4 bg-green-600/20 border border-green-600/30 rounded-lg">
          <p className="text-green-400 text-sm">
            🔍 Simulated verification: Example results will be shown for testing
          </p>
        </div>

        {!selectedFile ? (
          <div className="text-center">
            <div className="w-24 h-24 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Select a file to verify</h3>
            <p className="text-gray-400 mb-6">We'll verify its authenticity using blockchain and web sources</p>
            
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="verify-file-input"
              accept="*/*"
            />
            <label
              htmlFor="verify-file-input"
              className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors cursor-pointer"
            >
              Select File
            </label>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-700/30 rounded-lg">
              <FileText className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-gray-400 text-sm">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 inline-block" />
                    Verifying...
                  </>
                ) : (
                  'Verify Authenticity'
                )}
              </button>
              
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setVerificationResult(null);
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Select Another
              </button>
            </div>
          </div>
        )}

        {verificationResult && (
          <div className="mt-6">
            <VerificationResult result={verificationResult} />
          </div>
        )}
      </div>
    </div>
  );
}

// History Tab
function HistoryTab({ userHistory, loading }: { userHistory: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Activity History</h2>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Activity History</h2>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="p-6 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
          <p className="text-gray-400 text-sm">Simulated data from mock backend</p>
        </div>
        
        {userHistory.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No activity recorded yet</p>
            <p className="text-gray-500 text-sm">Register or verify files to see your history</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {userHistory.map((item, index) => (
              <div key={index} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    {item.type === 'registration' ? (
                      <Upload className="w-5 h-5 text-blue-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.filename || 'File'}</p>
                    <p className="text-gray-400 text-sm">
                      {item.type === 'registration' ? 'Registered' : 'Verified'} • 
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full">
                  {item.status === 'completed' ? 'Success' : 'Failed'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Profile Tab
function ProfileTab() {
  const { user } = useMockAuth();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">User Profile</h2>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{user?.username}</h3>
            <p className="text-gray-400">{user?.email}</p>
            <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full">
              Development User
            </span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Username
            </label>
            <input
              type="text"
              value={user?.username || ''}
              readOnly
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Settings</h2>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Development Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Development Mode</p>
              <p className="text-gray-400 text-sm">Use simulated data instead of blockchain</p>
            </div>
            <div className="w-12 h-6 bg-green-600 rounded-full flex items-center justify-end px-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Detailed Logs</p>
              <p className="text-gray-400 text-sm">Show debug information in console</p>
            </div>
            <div className="w-12 h-6 bg-green-600 rounded-full flex items-center justify-end px-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Mock API</p>
              <p className="text-gray-400 text-sm">Use simulated backend responses</p>
            </div>
            <div className="w-12 h-6 bg-green-600 rounded-full flex items-center justify-end px-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
