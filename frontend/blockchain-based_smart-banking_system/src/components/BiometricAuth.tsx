import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function BiometricAuth() {
  const [authType, setAuthType] = useState<"fingerprint" | "facial" | "voice">("fingerprint");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [lastAuthResult, setLastAuthResult] = useState<{
    success: boolean;
    confidence: number;
    sessionToken: string | null;
  } | null>(null);

  const authenticateBiometric = useMutation(api.biometric.authenticateBiometric);
  const biometricHistory = useQuery(api.biometric.getBiometricHistory);

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);

    try {
      // Simulate biometric data capture
      const biometricData = `${authType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const deviceId = `device_${Math.random().toString(36).substr(2, 9)}`;

      const result = await authenticateBiometric({
        authType,
        biometricData,
        deviceId,
      });

      setLastAuthResult(result);

      if (result.success) {
        toast.success(`${authType} authentication successful!`);
      } else {
        toast.error(`${authType} authentication failed. Please try again.`);
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getAuthIcon = (type: string) => {
    switch (type) {
      case 'fingerprint': return '👆';
      case 'facial': return '👤';
      case 'voice': return '🎤';
      default: return '🔐';
    }
  };

  return (
    <div className="space-y-6">
      {/* Biometric Authentication */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Biometric Authentication</h2>
          <p className="text-gray-600">Secure your transactions with biometric verification</p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {/* Authentication Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Authentication Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['fingerprint', 'facial', 'voice'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setAuthType(type)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    authType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-2">{getAuthIcon(type)}</div>
                  <div className="text-sm font-medium capitalize">{type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Authentication Button */}
          <button
            onClick={handleAuthenticate}
            disabled={isAuthenticating}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthenticating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Authenticating...</span>
              </div>
            ) : (
              `Authenticate with ${authType}`
            )}
          </button>

          {/* Last Authentication Result */}
          {lastAuthResult && (
            <div className={`p-4 rounded-xl ${
              lastAuthResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  lastAuthResult.success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span className={lastAuthResult.success ? 'text-green-600' : 'text-red-600'}>
                    {lastAuthResult.success ? '✓' : '✗'}
                  </span>
                </div>
                <div>
                  <p className={`font-medium ${
                    lastAuthResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {lastAuthResult.success ? 'Authentication Successful' : 'Authentication Failed'}
                  </p>
                  <p className={`text-sm ${
                    lastAuthResult.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    Confidence: {(lastAuthResult.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Authentication History */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Authentication History</h3>
          <p className="text-gray-600 mt-1">Recent biometric authentication attempts</p>
        </div>

        <div className="p-6">
          {biometricHistory && biometricHistory.length > 0 ? (
            <div className="space-y-3">
              {biometricHistory.map((log) => (
                <div key={log._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      log.success ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <span className="text-lg">{getAuthIcon(log.authType)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{log.authType}</p>
                      <p className="text-sm text-gray-600">
                        Device: {log.deviceId}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      log.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.success ? 'Success' : 'Failed'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(log._creationTime).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(log.confidence * 100).toFixed(1)}% confidence
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No authentication history</h3>
              <p className="text-gray-600">Your biometric authentication attempts will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
