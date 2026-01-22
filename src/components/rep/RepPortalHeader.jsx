import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCw, Plus, ArrowLeft, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RepPortalHeader({ isAdmin, refreshing, onRefresh, onLogout, userName, showCreateTask = true, showBackButton = false, onBackClick, session }) {
  return (
    <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {showBackButton && (
              <button onClick={onBackClick} className="text-slate-600 hover:text-slate-900 flex-shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                {isAdmin ? 'Admin Pipeline' : 'Rep Portal'}
              </h1>
              {userName && <p className="text-xs sm:text-sm text-slate-600 truncate">{userName}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {showCreateTask && (
              <Link to={createPageUrl('AdminPipeline')} className="flex-1 sm:flex-initial">
                <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}
            <Button
              onClick={onRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex-1 sm:flex-initial text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''} sm:mr-1`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex-1 sm:flex-initial text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}