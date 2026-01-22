import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Plus, X, ChevronDown, Search } from 'lucide-react';
import LeadCard from './LeadCard';
import OpportunityCard from './OpportunityCard';
import { Droppable, Draggable, DragDropContext } from '@hello-pangea/dnd';

export default function PipelineView({ records = [], type = 'leads', onStageChange, onCreateNew, session, onRecordSelect, stageName }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStages, setExpandedStages] = useState({});

  const stages = type === 'leads' ? [
    { name: 'new', label: 'Open - Not Contacted', color: 'bg-blue-500' },
    { name: 'contacted', label: 'Working - Contacted', color: 'bg-yellow-500' },
    { name: 'qualified', label: 'Qualified', color: 'bg-purple-500' },
    { name: 'in_progress', label: 'In Progress', color: 'bg-orange-500' },
    { name: 'funded', label: 'Funded', color: 'bg-green-500' },
    { name: 'declined', label: 'Declined', color: 'bg-red-500' }
  ] : [
    { name: 'Application In', label: 'Application In', color: 'bg-blue-500' },
    { name: 'Underwriting', label: 'Underwriting', color: 'bg-purple-500' },
    { name: 'Approved', label: 'Approved', color: 'bg-green-500' },
    { name: 'Contracts Out', label: 'Contracts Out', color: 'bg-yellow-500' },
    { name: 'Contracts In', label: 'Contracts In', color: 'bg-indigo-500' },
    { name: 'Closed - Funded', label: 'Funded', color: 'bg-green-600' },
    { name: 'Declined', label: 'Declined', color: 'bg-red-500' }
  ];

  const stageGroups = useMemo(() => {
    const groups = {};
    stages.forEach(stage => {
      groups[stage.name] = [];
    });
    
    records.forEach(record => {
      const stageKey = type === 'leads' ? record.Status : record.StageName;
      if (groups[stageKey]) {
        if (!searchTerm || 
            record.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.Company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (record.Account?.Name?.toLowerCase().includes(searchTerm.toLowerCase()))) {
          groups[stageKey].push(record);
        }
      }
    });
    
    return groups;
  }, [records, searchTerm, type]);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    const recordId = draggableId;
    const newStage = destination.droppableId;
    if (onStageChange) {
      onStageChange(recordId, newStage);
    }
  };

  const toggleStageExpand = (stageName) => {
    setExpandedStages(prev => ({ ...prev, [stageName]: !prev[stageName] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        {onCreateNew && (<Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />New</Button>)}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {stages.map(stage => {
            const isExpanded = expandedStages[stage.name] !== false;
            const stageRecords = stageGroups[stage.name] || [];
            const count = stageRecords.length;

            return (
              <Droppable key={stage.name} droppableId={stage.name}>
                {(provided, snapshot) => (
                  <motion.div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`rounded-lg border-2 transition-colors ${snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <button
                      onClick={() => toggleStageExpand(stage.name)}
                      className="w-full px-4 py-3 flex items-center justify-between bg-white rounded-t-lg hover:bg-slate-50 transition-colors border-b border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                        <span className="font-semibold text-slate-900">{stage.label}</span>
                        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">{count}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                    </button>

                    {isExpanded && (
                      <div className="p-3 space-y-2 min-h-[300px]">
                        {stageRecords.length === 0 ? (
                          <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No records</div>
                        ) : (
                          stageRecords.map((record, index) => (
                            <Draggable key={record.Id} draggableId={record.Id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`transition-all ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                >
                                  {type === 'leads' ? (
                                    <LeadCard lead={record} session={session} onSelect={onRecordSelect} />
                                  ) : (
                                    <OpportunityCard opportunity={record} session={session} onSelect={onRecordSelect} />
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </motion.div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}