import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/clerk-react";
import { format } from "date-fns";
import { databaseService } from "@/services/databaseService";
import { authService } from "@/services/authService";
import { IUserSession } from "@/models/UserSession";
import { Database, Users, Activity, Clock, Globe, Monitor } from "lucide-react";

const Admin = () => {
  const { user, isSignedIn } = useUser();
  const [sessions, setSessions] = useState<IUserSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (isSignedIn && user) {
      loadSessionData();
    }
  }, [isSignedIn, user]);

  const loadSessionData = async () => {
    setIsLoading(true);
    try {
      // Load all sessions (for demo purposes - in production, you'd want pagination)
      const allSessions = await databaseService.getAllUserSessions();
      setSessions(allSessions);

      // Load stats for current user
      if (user) {
        const userStats = await authService.getSessionStats(user.id);
        setStats(userStats);
      }

      console.log('✅ Session data loaded:', allSessions.length);
    } catch (error) {
      console.error('❌ Error loading session data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return '📱';
      case 'tablet':
        return '📱';
      case 'desktop':
        return '💻';
      default:
        return '🖥️';
    }
  };

  const getSignInMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      email: 'bg-blue-100 text-blue-800',
      google: 'bg-red-100 text-red-800',
      github: 'bg-gray-100 text-gray-800',
      facebook: 'bg-blue-100 text-blue-800',
      other: 'bg-purple-100 text-purple-800',
    };

    return (
      <Badge className={colors[method] || colors.other}>
        {method.charAt(0).toUpperCase() + method.slice(1)}
      </Badge>
    );
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">Please sign in to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor user sign-ins and session data</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Session</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageSessionDuration}m</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Globe className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Last Sign-in</p>
                    <p className="text-sm font-bold text-gray-900">
                      {stats.lastSignIn ? format(new Date(stats.lastSignIn), 'MMM d, HH:mm') : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sessions Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Recent Sign-ins
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">All user authentication events</p>
            </div>
            <Button onClick={loadSessionData} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No sign-in sessions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.slice(0, 20).map((session) => (
                  <div key={session._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{getDeviceIcon(session.deviceInfo?.type || 'unknown')}</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{session.email}</p>
                            {getSignInMethodBadge(session.signInMethod)}
                            {session.isActive && (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Signed in: {format(new Date(session.signInTime), 'MMM d, yyyy HH:mm:ss')}
                          </p>
                          {session.signOutTime && (
                            <p className="text-sm text-gray-600">
                              Signed out: {format(new Date(session.signOutTime), 'MMM d, yyyy HH:mm:ss')}
                              {session.sessionDuration && ` (${session.sessionDuration}m)`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Monitor className="h-4 w-4" />
                          <span>{session.deviceInfo?.type || 'Unknown'}</span>
                        </div>
                        {session.deviceInfo?.os && (
                          <p>{session.deviceInfo.os}</p>
                        )}
                        {session.deviceInfo?.browser && (
                          <p>{session.deviceInfo.browser}</p>
                        )}
                        {session.location?.timezone && (
                          <p>{session.location.timezone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {sessions.length > 20 && (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Showing 20 of {sessions.length} sessions</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
