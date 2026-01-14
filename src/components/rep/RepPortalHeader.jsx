import React from 'react';
import { Button } from "@/components/ui/button";
import { Home, Shield, RefreshCw, LogOut, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RepPortalHeader({ 
  isAdmin, 
  refreshing, 
  onRefresh, 
  onLogout,
  userName,
  showCreateTask = false,
  onCreateTaskClick
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">Rep Portal</h1>
            {userName && <p className="text-xs sm:text-sm text-slate-600 truncate">Welcome back, {userName}</p>}
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(createPageUrl('RepPortal'))}
              className="flex-1 sm:flex-initial min-h-[44px] sm:h-auto sm:w-auto"
              title="Go to Home"
            >
              <Home className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            
            {showCreateTask && (
              <Button 
                onClick={onCreateTaskClick} 
                className="flex-1 sm:flex-initial bg-purple-600 hover:bg-purple-700 min-h-[44px]"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Create Task</span>
              </Button>
            )}
            
            {isAdmin && (
              <Link to={createPageUrl('AdminPipeline')} className="flex-1 sm:flex-initial">
                <Button variant="outline" className="w-full sm:w-auto min-h-[44px]">
                  <Shield className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Admin Pipeline</span>
                </Button>
              </Link>
            )}
            
            <Button 
              variant="outline" 
              onClick={onRefresh} 
              disabled={refreshing} 
              className="flex-1 sm:flex-initial min-h-[44px]"
            >
              <RefreshCw className={`w-4 h-4 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onLogout} 
              className="flex-1 sm:flex-initial min-h-[44px]"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}