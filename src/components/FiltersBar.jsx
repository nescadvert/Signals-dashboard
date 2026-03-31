import React, { useMemo } from 'react';
import { Search, Filter, Layers, Activity, Monitor, Mail } from 'lucide-react';

export default function FiltersBar({ filters, setFilters, signals }) {
  // Pre-define common levels to ensure they always appear in the UI
  const levels = ['Cold', 'Warm', 'Hot'];
  
  // Dynamically get unique values for other filters
  const statuses = useMemo(() => [...new Set(signals.map(s => s.status))].filter(Boolean), [signals]);
  const platforms = useMemo(() => [...new Set(signals.map(s => s.platform))].filter(Boolean), [signals]);
  const dmStatuses = useMemo(() => [...new Set(signals.map(s => s.dmStatus))].filter(Boolean), [signals]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="filters-container">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          name="search" 
          value={filters.search} 
          onChange={handleChange} 
          placeholder="Rechercher un auteur ou du texte..."
          className="search-input"
        />
      </div>
      
      <div className="filters-row">
        <div className="filter-group">
          <Activity size={14} className="filter-icon" />
          <select name="status" value={filters.status} onChange={handleChange} className="filter-select">
            <option value="">Tous les Statuts</option>
            {statuses.sort().map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <Layers size={14} className="filter-icon" />
          <select name="level" value={filters.level} onChange={handleChange} className="filter-select">
            <option value="">Tous les Niveaux</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <Monitor size={14} className="filter-icon" />
          <select name="platform" value={filters.platform} onChange={handleChange} className="filter-select">
            <option value="">Toutes les Plateformes</option>
            {platforms.sort().map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <Mail size={14} className="filter-icon" />
          <select name="dmStatus" value={filters.dmStatus} onChange={handleChange} className="filter-select">
            <option value="">Status DM</option>
            {dmStatuses.sort().map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
