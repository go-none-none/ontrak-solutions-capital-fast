import React from 'react';
import { Button } from "@/components/ui/button";
import { Home, Shield, RefreshCw, LogOut, Plus, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import NotificationBell from './NotificationBell';
import UniversalSearch from './UniversalSearch';

export default function RepPortalHeader({ 
  isAdmin, 
  refreshing, 
  onRefresh, 
  onLogout,
  userName,
  showCreateTask = false,
  onCreateTaskClick,
  showBackButton = false,
  onBackClick = null,
  isAdminPortal = false,
  session = null
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">Rep Portal</h1>
            {userName && <p className="text-xs sm:text-sm text-slate-600 truncate">Welcome back, {userName}</p>}
          </div>
          
          {session && <UniversalSearch session={session} />}
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {showBackButton && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleBack}
                className="h-10 w-10"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(createPageUrl(isAdminPortal ? 'AdminPipeline' : 'RepPortal'))}
              className="h-10 w-10"
              title="Go to Home"
            >
              <Home className="w-5 h-5" />
            </Button>

            <NotificationBell />
            
            {showCreateTask && (
              <Button 
                onClick={onCreateTaskClick} 
                size="icon"
                className="h-10 w-10 bg-purple-600 hover:bg-purple-700"
                title="Create Task"
              >
                <Plus className="w-5 h-5" />
              </Button>
            )}
            
            {isAdmin && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.location.href = createPageUrl('AdminPipeline')}
                className="h-10 w-10"
                title="Admin Pipeline"
              >
                <Shield className="w-5 h-5" />
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={onRefresh} 
              disabled={refreshing} 
              className="h-10 w-10"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={onLogout} 
              className="h-10 w-10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}