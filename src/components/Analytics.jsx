import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Chart, registerables } from 'chart.js';

// Register all chart types and elements
Chart.register(...registerables);

export default function Analytics({ visible }) {
  const { students, theme } = useApp();
  
  const barChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  
  const barInstance = useRef(null);
  const doughnutInstance = useRef(null);

  useEffect(() => {
    if (!visible) return;

    const isDark = theme === 'dark';
    const textColor = isDark ? "#94a3b8" : "#475569";
    const gridColor = isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(226, 232, 240, 0.8)";

    // Recalculate metrics
    const gradeCounts = { "A+": 0, "A": 0, "B": 0, "C": 0, "D": 0, "F": 0 };
    let passCount = 0;
    let failCount = 0;

    students.forEach(std => {
      const grade = std.grade || "F";
      if (gradeCounts[grade] !== undefined) {
        gradeCounts[grade]++;
      }
      if (grade === "F") {
        failCount++;
      } else {
        passCount++;
      }
    });

    // 1. Grade Bar Chart
    if (barChartRef.current) {
      if (barInstance.current) {
        barInstance.current.destroy();
      }

      const ctx = barChartRef.current.getContext('2d');
      barInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(gradeCounts),
          datasets: [{
            label: 'Students Count',
            data: Object.values(gradeCounts),
            backgroundColor: [
              'rgba(16, 185, 129, 0.85)', // A+ Green
              'rgba(52, 211, 153, 0.85)', // A Emerald
              'rgba(56, 189, 248, 0.85)', // B LightBlue
              'rgba(99, 102, 241, 0.85)', // C Indigo
              'rgba(245, 158, 11, 0.85)', // D Amber
              'rgba(239, 68, 68, 0.85)'   // F Red
            ],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Grade Distribution Count',
              color: textColor,
              font: { family: 'Plus Jakarta Sans', size: 14, weight: 'bold' }
            }
          },
          scales: {
            x: {
              ticks: { color: textColor },
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: { color: textColor, stepSize: 1 },
              grid: { color: gridColor }
            }
          }
        }
      });
    }

    // 2. Pass vs Fail Doughnut Chart
    if (doughnutChartRef.current) {
      if (doughnutInstance.current) {
        doughnutInstance.current.destroy();
      }

      const ctx = doughnutChartRef.current.getContext('2d');
      doughnutInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Passing (≥ 50%)', 'Failing (< 50%)'],
          datasets: [{
            data: [passCount, failCount],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 2,
            borderColor: isDark ? '#111827' : '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: 'bold' } }
            },
            title: {
              display: true,
              text: 'Pass vs Fail Ratio',
              color: textColor,
              font: { family: 'Plus Jakarta Sans', size: 14, weight: 'bold' }
            }
          },
          cutout: '65%'
        }
      });
    }

    // Cleanup on unmount/destruction
    return () => {
      if (barInstance.current) {
        barInstance.current.destroy();
        barInstance.current = null;
      }
      if (doughnutInstance.current) {
        doughnutInstance.current.destroy();
        doughnutInstance.current = null;
      }
    };
  }, [students, theme, visible]);

  return (
    <div className={`analytics-panel ${visible ? 'visible' : ''}`}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        Class Performance Analytics
      </h3>
      <div className="charts-grid">
        <div className="chart-container">
          <canvas ref={barChartRef}></canvas>
        </div>
        <div className="chart-container">
          <canvas ref={doughnutChartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
