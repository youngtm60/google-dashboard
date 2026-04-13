'use client';

import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { CheckSquare, Check, Plus, Loader2, Search } from 'lucide-react';
import { addTask, completeTask } from '@/lib/actions/task-actions';
import WidgetSkeleton from './WidgetSkeleton';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function TasksWidget({ maxHeight = "none" }: { maxHeight?: string }) {
  const { mutate } = useSWRConfig();
  const { data: tasks, isLoading } = useSWR('/api/workspace/tasks', fetcher, {
    refreshInterval: 1000 * 60 * 5,
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'recent' | 'all'>('recent');
  const [isAdding, setIsAdding] = useState(false);
  const [completingIds, setCompletingIds] = useState<string[]>([]);

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

  if (isLoading) return <WidgetSkeleton />;

  // Filter and Search logic
  const displayTasks = (tasks?.filter((t: any) => t.status !== 'completed') || []).filter((task: any) => {
    const query = searchQuery.toLowerCase();
    return task.title.toLowerCase().includes(query) || 
           (task.listName && task.listName.toLowerCase().includes(query));
  });

  const finalTasks = viewMode === 'recent' ? displayTasks.slice(0, 10) : displayTasks;

  return (
    <section className="glass-panel" style={{ padding: "20px", borderRadius: "24px", minHeight: "300px", maxHeight: "400px", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-secondary)" }}>
          <CheckSquare size={18} />
          <h3 style={{ fontWeight: 600, fontSize: "0.95rem" }}>Tasks</h3>
        </div>
        
        {/* View Mode Toggle */}
        <div style={{ 
          background: "rgba(255,255,255,0.05)", 
          padding: "2px", 
          borderRadius: "8px", 
          display: "flex",
          border: "1px solid var(--glass-border)"
        }}>
          <button 
            onClick={() => { setViewMode('recent'); setSearchQuery(''); }}
            style={{ 
              padding: "4px 10px", 
              borderRadius: "6px", 
              fontSize: "0.7rem", 
              fontWeight: 600,
              background: viewMode === 'recent' ? "var(--accent-secondary)" : "transparent",
              color: viewMode === 'recent' ? "black" : "var(--text-muted)",
              transition: "all 0.2s"
            }}
          >
            Recent
          </button>
          <button 
            onClick={() => { setViewMode('all'); setSearchQuery(''); }}
            style={{ 
              padding: "4px 10px", 
              borderRadius: "6px", 
              fontSize: "0.7rem", 
              fontWeight: 600,
              background: viewMode === 'all' ? "var(--accent-secondary)" : "transparent",
              color: viewMode === 'all' ? "black" : "var(--text-muted)",
              transition: "all 0.2s"
            }}
          >
            All
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        <form onSubmit={handleAddTask} style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Quick add to My Tasks..."
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--glass-border)",
              borderRadius: "10px",
              padding: "8px 12px",
              color: "white",
              fontSize: "0.85rem",
              outline: "none"
            }}
          />
          <button 
            type="submit" 
            disabled={isAdding || !newTaskTitle.trim()}
            style={{
              background: "var(--accent-secondary)",
              color: "white",
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: (isAdding || !newTaskTitle.trim()) ? 0.5 : 1
            }}
          >
            {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          </button>
        </form>

        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks or lists..."
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--glass-border)",
              borderRadius: "10px",
              padding: "8px 12px 8px 34px",
              color: "white",
              fontSize: "0.8rem",
              outline: "none"
            }}
          />
        </div>
      </div>

      <div style={{ 
        flex: 1,
        display: "flex", 
        flexDirection: "column", 
        gap: "10px", 
        overflowY: "auto", 
        maxHeight: maxHeight,
        paddingRight: "4px",
        width: "100%"
      }}>
        {finalTasks.map((task: any) => (
          <div key={task.id} className="glass-card" style={{ 
            padding: "10px 14px", 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            flexShrink: 0,
            width: "100%" 
          }}>
            <button 
              onClick={() => toggleTask(task.id, task.listId, task.status)}
              disabled={completingIds.includes(task.id)}
              style={{ 
                width: "18px", 
                height: "18px", 
                borderRadius: "50%", 
                border: "2px solid",
                borderColor: task.status === 'completed' ? "var(--accent-secondary)" : "var(--glass-border)",
                background: task.status === 'completed' ? "var(--accent-secondary)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                opacity: completingIds.includes(task.id) ? 0.5 : 1,
                cursor: "pointer"
              }}
            >
              {completingIds.includes(task.id) ? (
                <Loader2 size={10} className="animate-spin" />
              ) : task.status === 'completed' ? (
                <Check size={12} strokeWidth={4} />
              ) : null}
            </button>
            <div style={{ flex: 1 }}>
              <span style={{ 
                fontSize: "0.85rem", 
                fontWeight: 500,
                color: "var(--text-primary)",
                display: "block",
                marginBottom: "2px"
              }}>
                {task.title}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ 
                  fontSize: "0.65rem", 
                  padding: "1px 6px", 
                  borderRadius: "4px", 
                  background: "rgba(255,255,255,0.05)",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  border: "1px solid var(--glass-border)"
                }}>
                  {task.listName || 'My Tasks'}
                </span>
                {task.due && (
                  <span style={{ fontSize: "0.65rem", color: "var(--accent-rose)", fontWeight: 500 }}>
                    Due {new Date(task.due).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {finalTasks.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 20px" }}>
            <CheckSquare size={32} style={{ opacity: 0.2, marginBottom: "12px" }} />
            <p style={{ fontSize: "0.85rem" }}>All caught up! No active tasks.</p>
          </div>
        )}
      </div>
    </section>
  );
}
