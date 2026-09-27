import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, Clock } from 'lucide-react';
import { Button } from './ui/Button';

interface Task {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    dueDate?: string;
    priority: 'low' | 'medium' | 'high';
    category: 'listing' | 'deal' | 'visit' | 'admin' | 'other';
}

interface TaskListProps {
    dealId?: string;
    dealType?: 'sale' | 'rental';
    onTaskToggle?: (taskId: string, completed: boolean) => void;
    onTaskAdd?: (task: Omit<Task, 'id'>) => void;
    onTaskDelete?: (taskId: string) => void;
}

const DEFAULT_TASKS: Task[] = [
    { id: '1', title: 'Verify buyer identity', description: 'Check national ID or passport', completed: false, priority: 'high', category: 'deal' },
    { id: '2', title: 'Confirm escrow deposit', description: 'Verify 10% deposit received', completed: false, priority: 'high', category: 'deal' },
    { id: '3', title: 'Order title search', description: 'Submit to RLMUA', completed: false, priority: 'medium', category: 'deal' },
    { id: '4', title: 'Schedule notary signing', description: 'Coordinate with both parties', completed: false, priority: 'medium', category: 'deal' },
    { id: '5', title: 'Update listing status', description: 'Mark as under_negotiation', completed: false, priority: 'low', category: 'listing' },
    { id: '6', title: 'Notify seller', description: 'Send offer details to seller', completed: false, priority: 'medium', category: 'deal' },
];

export const TaskList: React.FC<TaskListProps> = ({
    dealId,
    dealType,
    onTaskToggle,
    onTaskAdd,
    onTaskDelete,
}) => {
    const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

    const toggleTask = (taskId: string) => {
        setTasks((prev) =>
            prev.map((t) => {
                if (t.id === taskId) {
                    const updated = { ...t, completed: !t.completed };
                    onTaskToggle?.(taskId, updated.completed);
                    return updated;
                }
                return t;
            })
        );
    };

    const addTask = () => {
        if (!newTaskTitle.trim()) return;
        const newTask: Task = {
            id: Date.now().toString(),
            title: newTaskTitle.trim(),
            completed: false,
            priority: newTaskPriority,
            category: 'other',
        };
        setTasks((prev) => [...prev, newTask]);
        onTaskAdd?.(newTask);
        setNewTaskTitle('');
        setIsAdding(false);
    };

    const deleteTask = (taskId: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        onTaskDelete?.(taskId);
    };

    const completedCount = tasks.filter((t) => t.completed).length;
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    const priorityColors = {
        low: 'bg-slate-500/15 text-slate-500',
        medium: 'bg-amber-500/15 text-amber-500',
        high: 'bg-red-500/15 text-red-500',
    };

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-bold text-[var(--color-text-main)]">Task List</h3>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                        {completedCount} of {tasks.length} completed
                    </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
                    <Plus size={12} />
                    <span>Add Task</span>
                </Button>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div className="h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                    <div
                        className="h-full rounded-full bg-[var(--color-brand-emerald)] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {isAdding && (
                <div className="mb-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] p-3 space-y-2">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Task title..."
                        className="w-full rounded-lg border border-[var(--color-input-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-emerald)]"
                    />
                    <div className="flex items-center justify-between">
                        <select
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                            className="rounded-lg border border-[var(--color-input-border)] bg-[var(--color-bg-card)] px-2 py-1.5 text-xs text-[var(--color-text-main)] outline-none"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button size="sm" variant="primary" onClick={addTask}>Add</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {tasks.length === 0 ? (
                    <p className="text-xs text-[var(--color-text-muted)] text-center py-4">No tasks yet</p>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                                task.completed
                                    ? 'border-[var(--color-border)] bg-[var(--color-input-bg)] opacity-60'
                                    : 'border-[var(--color-border)] bg-[var(--color-input-bg)]'
                            }`}
                        >
                            <button
                                onClick={() => toggleTask(task.id)}
                                className="shrink-0 mt-0.5"
                            >
                                {task.completed ? (
                                    <CheckSquare size={18} className="text-emerald-500" />
                                ) : (
                                    <Square size={18} className="text-[var(--color-text-dim)]" />
                                )}
                            </button>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${task.completed ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-main)]'}`}>
                                    {task.title}
                                </p>
                                {task.description && (
                                    <p className="text-[11px] text-[var(--color-text-muted)]">{task.description}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${priorityColors[task.priority]}`}>
                                    {task.priority}
                                </span>
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="p-1 rounded text-[var(--color-text-dim)] hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
