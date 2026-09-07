import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  GitBranch,
  Upload,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode2,
  Settings,
  Code2,
  Layers,
  ExternalLink,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Project, ProjectFile } from '../../types';
import { api } from '../../services/api';
import { sfx } from '../../services/audio';

export const ProjectsPage: React.FC<{ onOpenWizard: () => void }> = ({ onOpenWizard }) => {
  const { projects, selectedProjectId, setSelectedProjectId, refreshData, addToast, setCurrentRoute } = useApp();

  const [activeProjectTab, setActiveProjectTab] = useState<'summary' | 'files' | 'rules' | 'settings'>('summary');
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newLang, setNewLang] = useState('TypeScript');

  const currentProj = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleSelectProject = (p: Project) => {
    sfx.playClick();
    setSelectedProjectId(p.id);
    if (p.files && p.files.length > 0) {
      setSelectedFile(p.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    sfx.playClick();
    try {
      const created = await api.createProject({
        name: newProjectName,
        repoUrl: newRepoUrl || 'https://github.com/custom/repo',
        mainLanguage: newLang,
        environment: 'Staging'
      });
      setIsImportModalOpen(false);
      setNewProjectName('');
      setNewRepoUrl('');
      await refreshData();
      setSelectedProjectId(created.id);
      addToast('success', 'Project Connected', `${created.name} imported successfully.`);
    } catch (err) {
      addToast('error', 'Import Failed', 'Could not create new project.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-brand-400" />
            <span>Connected Code Projects</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage repositories, inspect file abstract syntax trees, and configure verification rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sfx.playClick();
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
          >
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <span>Import Repository</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Projects Gallery List */}
        <div className="col-span-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
            Projects ({projects.length})
          </span>

          <div className="space-y-2">
            {projects.map((p) => {
              const isSelected = (currentProj?.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProject(p)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500/10 text-white shadow-md shadow-brand-500/10'
                      : 'border-[#1c2333] bg-[#0f131c] text-slate-300 hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[180px]">{p.name}</span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        p.lastDecision === 'SHIP'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : p.lastDecision === 'BLOCK'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {p.lastDecision}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 truncate mt-1">{p.description}</p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-3 pt-2 border-t border-white/[0.04]">
                    <span>{p.mainLanguage}</span>
                    <span>Env: {p.environment}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Project Detail Pane */}
        {currentProj && (
          <div className="col-span-8 space-y-4">
            <div className="p-6 rounded-2xl bg-[#0f131c] border border-[#232b3e] space-y-4">
              {/* Project Title Bar */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{currentProj.name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                      {currentProj.defaultBranch}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{currentProj.description}</p>
                </div>

                <button
                  onClick={() => {
                    sfx.playClick();
                    onOpenWizard();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 shadow-md shadow-cyan-500/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Run Verification</span>
                </button>
              </div>

              {/* Project Details Navigation Tabs */}
              <div className="flex border-b border-[#1c2333] pt-2 gap-2">
                {[
                  { id: 'summary', label: 'Summary' },
                  { id: 'files', label: `Files (${currentProj.files?.length || 0})` },
                  { id: 'rules', label: `Verification Rules (${currentProj.rules?.length || 0})` }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      sfx.playClick();
                      setActiveProjectTab(t.id as any);
                    }}
                    className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                      activeProjectTab === t.id
                        ? 'border-brand-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Summary */}
              {activeProjectTab === 'summary' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-[#1c2333]">
                      <span className="text-slate-400 block font-mono text-[10px]">Repository URL</span>
                      <a
                        href={currentProj.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline mt-0.5 block truncate"
                      >
                        {currentProj.repoUrl}
                      </a>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-[#1c2333]">
                      <span className="text-slate-400 block font-mono text-[10px]">Open Issues</span>
                      <span className="font-bold text-rose-400 mt-0.5 block">{currentProj.openIssuesCount} Issue(s)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-[#1c2333]">
                      <span className="text-slate-400 block font-mono text-[10px]">Last Status</span>
                      <span className="font-bold text-white mt-0.5 block">{currentProj.lastDecision}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Files Explorer */}
              {activeProjectTab === 'files' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3">
                    {/* File Tree */}
                    <div className="col-span-4 space-y-1 bg-[#07090e] p-2.5 rounded-xl border border-[#1c2333] max-h-72 overflow-y-auto">
                      {currentProj.files.map((file) => (
                        <button
                          key={file.path}
                          onClick={() => {
                            sfx.playClick();
                            setSelectedFile(file);
                          }}
                          className={`w-full p-2 rounded-lg text-left text-xs font-mono flex items-center gap-2 truncate transition-colors ${
                            (selectedFile?.path || currentProj.files[0]?.path) === file.path
                              ? 'bg-brand-500/20 text-cyan-300 font-bold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                          }`}
                        >
                          <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* File Code Viewer */}
                    <div className="col-span-8 bg-[#07090e] p-3 rounded-xl border border-[#1c2333] max-h-72 overflow-y-auto">
                      <div className="text-[10px] font-mono text-slate-400 pb-2 border-b border-white/[0.06] flex justify-between">
                        <span>{selectedFile?.path || currentProj.files[0]?.path || 'No file selected'}</span>
                        <span>{selectedFile?.language || 'python'}</span>
                      </div>
                      <pre className="text-xs font-mono text-slate-300 pt-2 leading-relaxed overflow-x-auto">
                        <code>{selectedFile?.content || currentProj.files[0]?.content || '// Empty file'}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Verification Rules */}
              {activeProjectTab === 'rules' && (
                <div className="space-y-2">
                  {currentProj.rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-[#1c2333] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{rule.name}</span>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {rule.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{rule.description}</p>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        ENFORCED
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f131c] border border-[#232b3e] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Import Repository</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Payment Gateway Bridge"
                  className="w-full bg-[#090b12] border border-[#232b3e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">GitHub Repo URL</label>
                <input
                  type="text"
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  placeholder="https://github.com/my-org/my-repo"
                  className="w-full bg-[#090b12] border border-[#232b3e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Primary Language</label>
                <select
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  className="w-full bg-[#090b12] border border-[#232b3e] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="TypeScript">TypeScript / Node</option>
                  <option value="Python">Python</option>
                  <option value="Go">Go</option>
                  <option value="Rust">Rust</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1c2333]">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-500"
              >
                Connect & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
