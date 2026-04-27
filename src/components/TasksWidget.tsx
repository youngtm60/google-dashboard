'use client';

import {  useState , useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckSquare, Check, Plus, Loader2, Search, Edit2, Trash2, X } from 'lucide-react';
import { addTask, completeTask, editTaskTitle, deleteTask, createTaskList } from '@/lib/actions/task-actions';
import WidgetSkeleton from './WidgetSkeleton';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function TasksWidget({ 
  initialLimit, 
  showHeader = true, 
  fullHeight = false,
  viewMode: externalViewMode
}: { 
  initialLimit?: number, 
  showHeader?: boolean, 
  fullHeight?: boolean,
  viewMode?: 'recent' | 'all'
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate } = useSWRConfig();
  
  const urlQuery = searchParams?.get('q') || '';
  const urlEditingId = searchParams?.get('editing') || null;

  const { data: tasks, isLoading } = useSWR('/api/workspace/tasks', fetcher, {
    refreshInterval: 1000 * 60 * 5,
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (showHeader && searchQuery !== urlQuery) {
        const params = new URLSearchParams(window.location.search);
        if (searchQuery) params.set('q', searchQuery);
        else params.delete('q');
        router.push(window.location.pathname + '?' + params.toString());
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery, router, showHeader, urlQuery]);
  
  const [internalViewMode, setInternalViewMode] = useState<'recent' | 'all'>('all');
  const viewMode = externalViewMode || internalViewMode;
  const setViewMode = externalViewMode ? (() => {}) : setInternalViewMode;
  const [sortBy, setSortBy] = useState<'date' | 'alpha'>('date');
  const [selectedList, setSelectedList] = useState('all');
  
  // Extract unique list names
  const uniqueLists = Array.from(new Set(tasks?.map((t: any) => t.listName || 'My Tasks') || [])) as string[];
  
  // States for actions
  const [isAdding, setIsAdding] = useState(false);
  const [completingIds, setCompletingIds] = useState<string[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(urlEditingId);
  const [editTaskTitleText, setEditTaskTitleText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // List creation state
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const toggleTask = async (taskId: string, listId: string, currentStatus: string) => {
    if (completingIds.includes(taskId)) return;
    
    // Switch to completed or back to needsAction
    const newStatus = currentStatus === 'completed' ? 'needsAction' : 'completed';
    setCompletingIds(prev => [...prev, taskId]);
    
    const result = await completeTask(taskId, listId, newStatus);
    if (result.success) {
      mutate('/api/workspace/tasks');
    }
    setCompletingIds(prev => prev.filter(id => id !== taskId));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isAdding) return;

    setIsAdding(true);
    const result = await addTask(newTaskTitle);
    if (result.success) {
      setNewTaskTitle('');
      mutate('/api/workspace/tasks');
    }
    setIsAdding(false);
  };

  const handleEditInit = (taskId: string, title: string) => {
    setEditingTaskId(taskId);
    setEditTaskTitleText(title);
    if (showHeader) {
      const params = new URLSearchParams(window.location.search);
      params.set('editing', taskId);
      router.push(window.location.pathname + '?' + params.toString());
    }
  };

  const handleEditCancel = () => {
    setEditingTaskId(null);
    if (showHeader) {
      const params = new URLSearchParams(window.location.search);
      params.delete('editing');
      router.push(window.location.pathname + '?' + params.toString());
    }
  };

  const handleEditSave = async (taskId: string, listId: string) => {
    if (!editTaskTitleText.trim() || isProcessing) return;
    setIsProcessing(true);
    const result = await editTaskTitle(taskId, listId, editTaskTitleText);
    if (result.success) {
      mutate('/api/workspace/tasks');
      handleEditCancel();
    }
    setIsProcessing(false);
  };

  const handleDeleteTask = async (taskId: string, listId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setIsProcessing(true);
    const result = await deleteTask(taskId, listId);
    if (result.success) {
      mutate('/api/workspace/tasks');
    }
    setIsProcessing(false);
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || isProcessing) return;
    
    setIsProcessing(true);
    const result = await createTaskList(newListName);
    if (result.success) {
      setNewListName('');
      setIsCreatingList(false);
      mutate('/api/workspace/tasks');
    } else {
      alert(result.error || "Failed to create list");
    }
    setIsProcessing(false);
  };

    // Filter and Search logic
  let displayTasks = (tasks?.filter((t: any) => t.status !== 'completed') || []).filter((task: any) => {
    const query = debouncedQuery.toLowerCase();
    const matchesSearch = task.title.toLowerCase().includes(query) || 
           (task.listName && task.listName.toLowerCase().includes(query));
    
    const matchesList = selectedList === 'all' || (task.listName || 'My Tasks') === selectedList;
    
    return matchesSearch && matchesList;
  });

  // Apply sorting
  displayTasks = [...displayTasks].sort((a: any, b: any) => {
    if (sortBy === 'alpha') {
      return a.title.localeCompare(b.title);
    } else {
      const timeA = a.due ? new Date(a.due).getTime() : (a.updated ? new Date(a.updated).getTime() : 0);
      const timeB = b.due ? new Date(b.due).getTime() : (b.updated ? new Date(b.updated).getTime() : 0);
      return timeB - timeA;
    }
  });

  const finalTasks = viewMode === 'recent' ? displayTasks.slice(0, initialLimit || 10) : displayTasks;

  return (
    <section className={showHeader ? "glass-panel" : ""} style={{padding: showHeader ? "20px" : "0", borderRadius: "24px", display: "flex", flexDirection: "column", height: fullHeight ? "600px" : "450px"}}>
      {showHeader && (
        <>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-cyan)" }}>
              <CheckSquare size={20} />
              <h3 style={{ fontWeight: 600 }}>Tasks</h3>
            </div>
            
            {/* Sort & View Mode Toggles */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {/* List Filter Dropdown */}
              {!isCreatingList ? (
                <>
                  <select 
                    value={selectedList}
                    onChange={(e) => setSelectedList(e.target.value)}
                    style={{ 
                      background: "rgba(255,255,255,0.05)", 
                      border: "1px solid var(--glass-border)", 
                      borderRadius: "8px", 
                      padding: "4px 8px", 
                      fontSize: "0.7rem", 
                      color: "var(--text-muted)", 
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="all">All Lists</option>
                    {uniqueLists.map(list => (
                      <option key={list} value={list}>{list}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => setIsCreatingList(true)}
                    className="hover-opacity"
                    style={{ 
                      background: "rgba(255,255,255,0.05)", 
                      border: "1px solid var(--glass-border)", 
                      borderRadius: "8px", 
                      width: "28px", 
                      height: "28px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      color: "var(--text-muted)",
                      cursor: "pointer"
                    }}
                    title="Create New List"
                  >
                    <Plus size={14} />
                  </button>
                </>
              ) : (
                <form onSubmit={handleCreateList} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <input 
                    type="text" 
                    value={newListName} 
                    onChange={(e) => setNewListName(e.target.value)} 
                    placeholder="New list name..."
                    autoFocus
                    style={{ 
                      background: "rgba(255,255,255,0.1)", 
                      border: "1px solid var(--accent-cyan)", 
                      borderRadius: "6px", 
                      padding: "4px 8px", 
                      color: "var(--text-primary)", 
                      fontSize: "0.7rem", 
                      outline: "none",
                      width: "120px"
                    }}
                  />
                  <button 
                    type="submit" 
                    disabled={!newListName.trim() || isProcessing}
                    style={{ background: "var(--accent-cyan)", color: "black", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "0.65rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    {isProcessing ? "..." : "Create"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsCreatingList(false)}
                    style={{ background: "transparent", color: "var(--text-muted)", border: "none", cursor: "pointer" }}
                  >
                    <X size={14} />
                  </button>
                </form>
              )}

              <div style={{ background: "rgba(255,255,255,0.05)", padding: "2px", borderRadius: "8px", display: "flex", border: "1px solid var(--glass-border)" }}>
                <button 
                  onClick={() => setSortBy('date')}
                  style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 600, background: sortBy === 'date' ? "var(--accent-cyan)" : "transparent", color: sortBy === 'date' ? "black" : "var(--text-muted)", transition: "all 0.2s" }}
                >
                  Date
                </button>
                <button 
                  onClick={() => setSortBy('alpha')}
                  style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 600, background: sortBy === 'alpha' ? "var(--accent-cyan)" : "transparent", color: sortBy === 'alpha' ? "black" : "var(--text-muted)", transition: "all 0.2s" }}
                >
                  A-Z
                </button>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "2px", borderRadius: "8px", display: "flex", border: "1px solid var(--glass-border)" }}>
                <button 
                  onClick={() => { setViewMode('recent'); setSearchQuery(''); }}
                  style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 600, background: viewMode === 'recent' ? "var(--accent-cyan)" : "transparent", color: viewMode === 'recent' ? "black" : "var(--text-muted)", transition: "all 0.2s" }}
                >
                  Recent
                </button>
                <button 
                  onClick={() => { setViewMode('all'); setSearchQuery(''); }}
                  style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 600, background: viewMode === 'all' ? "var(--accent-cyan)" : "transparent", color: viewMode === 'all' ? "black" : "var(--text-muted)", transition: "all 0.2s" }}
                >
                  All
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Input & Search */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        <form onSubmit={handleAddTask} style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Quick add to My Tasks..." style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "10px", padding: "8px 12px", color: "var(--text-primary)", fontSize: "0.85rem", outline: "none" }} />
          <button type="submit" disabled={isAdding || !newTaskTitle.trim()} style={{ background: "var(--accent-cyan)", color: "white", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", opacity: (isAdding || !newTaskTitle.trim()) ? 0.5 : 1 }}>
            {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          </button>
        </form>

        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input type="text" className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tasks or lists..." />
        </div>
      </div>

      {/* Task List */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", paddingRight: "4px", width: "100%" }} className="custom-scrollbar">
        {isLoading && !tasks ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} /></div> : (() => {
          const topLevelTasks = finalTasks.filter((t: any) => !t.parentId || !finalTasks.some((p: any) => p.id === t.parentId));
          const subTasksByParent = finalTasks.reduce((acc: any, t: any) => {
            if (t.parentId) {
              if (!acc[t.parentId]) acc[t.parentId] = [];
              acc[t.parentId].push(t);
            }
            return acc;
          }, {});

          const renderTaskNode = (task: any, level: number = 0) => {
            const children = subTasksByParent[task.id] || [];
            return (
              <div key={task.id} style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px' }}>
                <div key={task.id} className="glass-card hover-opacity" style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyItems: "space-between", gap: "12px", flexShrink: 0, width: level > 0 ? `calc(100% - ${level * 24}px)` : "100%", marginLeft: level > 0 ? `${level * 24}px` : "0", borderLeft: level > 0 ? "3px solid var(--accent-cyan)" : undefined, opacity: level > 0 ? 0.9 : 1 }}>
            
            <button 
              onClick={() => toggleTask(task.id, task.listId, task.status)}
              disabled={completingIds.includes(task.id) || isProcessing}
              title="Complete Task"
              style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid", borderColor: task.status === 'completed' ? "var(--accent-cyan)" : "var(--glass-border)", background: task.status === 'completed' ? "var(--accent-cyan)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "white", opacity: completingIds.includes(task.id) ? 0.5 : 1, cursor: "pointer", flexShrink: 0 }}
            >
              {completingIds.includes(task.id) ? <Loader2 size={10} className="animate-spin" /> : task.status === 'completed' ? <Check size={12} strokeWidth={4} /> : null}
            </button>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingTaskId === task.id ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <input
                    type="text"
                    value={editTaskTitleText}
                    onChange={(e) => setEditTaskTitleText(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSave(task.id, task.listId);
                      if (e.key === 'Escape') handleEditCancel();
                    }}
                    style={{ flex: 1, background: "rgba(255,255,255,0.1)", border: "1px solid var(--accent-cyan)", borderRadius: "6px", padding: "4px 8px", color: "var(--text-primary)", fontSize: "0.85rem", outline: "none", minWidth: 0 }}
                  />
                  <button onClick={() => handleEditCancel()} disabled={isProcessing} style={{ background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}><X size={14} /></button>
                  <button onClick={() => handleEditSave(task.id, task.listId)} disabled={isProcessing} style={{ background: "var(--accent-cyan)", color: "black", padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 600, cursor: isProcessing ? "wait" : "pointer" }}>
                    {isProcessing ? "..." : "Save"}
                  </button>
                </div>
              ) : (
                <span 
                  onClick={() => handleEditInit(task.id, task.title)}
                  style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)", display: "block", marginBottom: "2px", cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  title="Click to edit task name"
                >
                  {task.title.split(' ').map((word: string, i: number, arr: string[]) => {
                    if (word.startsWith('#') && word.length > 1) {
                      return (
                        <span 
                          key={i} 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchQuery(word);
                            setViewMode('all');
                          }}
                          style={{ 
                            color: "var(--accent-cyan)",
                            background: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.05)",
                            padding: "2px 6px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            margin: "0 2px",
                            cursor: "pointer"
                          }}
                          className="hover-opacity"
                        >
                          {word}
                        </span>
                      );
                    }
                    return word + (i < arr.length - 1 ? ' ' : '');
                  })}
                </span>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", fontWeight: 600, border: "1px solid var(--glass-border)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100px" }}>
                  {task.listName || 'My Tasks'}
                </span>
                {task.due && <span style={{ fontSize: "0.65rem", color: "var(--accent-rose)", fontWeight: 500 }}>Due {new Date(task.due).toLocaleDateString()}</span>}
              </div>
            </div>

            {/* Quick Actions (only visible when not editing this task) */}
            {editingTaskId !== task.id && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                <button 
                  onClick={() => handleEditInit(task.id, task.title)}
                  className="hover-opacity" 
                  disabled={isProcessing}
                  title="Edit task"
                  style={{ background: "transparent", color: "var(--text-muted)", padding: "4px", cursor: "pointer" }}
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteTask(task.id, task.listId)}
                  className="hover-opacity" 
                  disabled={isProcessing}
                  title="Delete task"
                  style={{ background: "transparent", color: "#fca5a5", padding: "4px", cursor: "pointer", opacity: 0.8 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

          </div>
                {children.map((child: any) => renderTaskNode(child, level + 1))}
              </div>
            );
          };

          return topLevelTasks.map((task: any) => renderTaskNode(task, 0));
        })()}

        {finalTasks.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 20px" }}>
            <CheckSquare size={32} style={{ opacity: 0.2, marginBottom: "12px", margin: "0 auto" }} />
            <p style={{ fontSize: "0.85rem" }}>All caught up! No active tasks.</p>
          </div>
        )}
      </div>
    </section>
  );
}
