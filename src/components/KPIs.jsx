import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, TrendingUp, Award, Crown } from 'lucide-react';

export default function KPIs() {
  const { kpis } = useApp();

  return (
    <div className="kpi-grid">
      <div className="kpi-card blue">
        <div className="kpi-info">
          <span className="kpi-title">Total Students</span>
          <span className="kpi-value">{kpis.totalStudents}</span>
          <span className="kpi-sub">Enrolled Class List</span>
        </div>
        <div className="kpi-icon-wrapper">
          <Users style={{ width: '24px', height: '24px' }} />
        </div>
      </div>
      
      <div className="kpi-card purple">
        <div className="kpi-info">
          <span className="kpi-title">Class Average %</span>
          <span className="kpi-value">{kpis.classAverage}</span>
          <span className="kpi-sub">Overall Academic Score</span>
        </div>
        <div className="kpi-icon-wrapper">
          <TrendingUp style={{ width: '24px', height: '24px' }} />
        </div>
      </div>
      
      <div className="kpi-card green">
        <div className="kpi-info">
          <span className="kpi-title">Pass Rate %</span>
          <span className="kpi-value">{kpis.passRate}</span>
          <span className="kpi-sub">Passing Criteria: ≥ 50%</span>
        </div>
        <div className="kpi-icon-wrapper">
          <Award style={{ width: '24px', height: '24px' }} />
        </div>
      </div>
      
      <div className="kpi-card orange">
        <div className="kpi-info">
          <span className="kpi-title">Class Topper</span>
          <span className="kpi-value" title={kpis.topper.name}>
            {kpis.topper.name.length > 14 ? kpis.topper.name.slice(0, 12) + "..." : kpis.topper.name}
          </span>
          <span className="kpi-sub">{kpis.topper.scoreText}</span>
        </div>
        <div className="kpi-icon-wrapper">
          <Crown style={{ width: '24px', height: '24px' }} />
        </div>
      </div>
    </div>
  );
}
