import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Shield, RefreshCw, LogOut, Plus, ArrowLeft, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import NotificationBell from './NotificationBell';

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
  searchTerm = '',
  onSearchChange = null
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">Rep Portal</h1>
              {userName && <p className="text-xs sm:text-sm text-slate-600 truncate">Welcome back, {userName}</p>}
            </div>
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

          {/* Search Bar */}
          {onSearchChange && (
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search all leads, opportunities, and contacts..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 pr-10 h-10 text-sm w-full"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}