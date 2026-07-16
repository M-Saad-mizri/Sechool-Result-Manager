import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: "How do I add a new student?",
    a: "Click the <strong>\"Add Student\" button</strong> in the toolbar. In the dialog, type one or more names. If adding multiple students, separate their names using commas or new lines. Click \"Add Students\" to add them to your class sheet."
  },
  {
    q: "Can I customize subjects and their maximum marks?",
    a: "Yes! Use the <strong>\"Add Subject\"</strong> button to insert a new subject column with its max score. Use the <strong>\"Manage Subjects\"</strong> button to view all configured subjects, update their names, adjust their individual maximum marks, or remove them entirely."
  },
  {
    q: "How are grades and percentages calculated?",
    a: "The system compiles scores dynamically. The total maximum marks is calculated as the sum of the maximum marks of all subjects. Percentage is calculated as <code>(Total Obtained / Total Max Marks) * 100</code>. Grades are assigned as follows: A+ (≥90%), A (≥80%), B (≥70%), C (≥60%), D (≥50%), and F (<50%)."
  },
  {
    q: "Does this work on mobile phones?",
    a: "Absolutely! On screen sizes under 768px, the wide table switches to an interactive, touch-friendly <strong>student card grid</strong>. You can expand any student card to edit their marks using phone keyboards easily."
  },
  {
    q: "How do I rank the students and generate dashboards?",
    a: "Click the <strong>\"Compile & Rank\"</strong> button. The app will calculate all totals, update the KPI metrics, sort the students descending based on performance positions, and redraw the analytical charts."
  },
  {
    q: "How do I backup my data?",
    a: "Click the <strong>\"Share / Backup\"</strong> button. In the export tab, you can copy the text code, download a local <code>.json</code> file, or click <strong>\"Create Cloud Link\"</strong> to generate a temporary web link that exports your database directly to another device."
  },
  {
    q: "Is my data stored securely?",
    a: "All assessment data is saved in your browser's secure Local Storage. No student information is sent to third-party servers unless you explicitly create a cloud sharing link. Note that clearing your browser cookies/local data will delete local sheets, so remember to save backups!"
  }
];

export default function FaqSection() {
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex(prev => (prev === index ? null : index));
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(search.toLowerCase()) || 
    faq.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="faq-wrapper">
      <div className="faq-title">📘 Help Center & FAQ</div>
      <div className="faq-search-wrapper">
        <Search className="faq-search-icon" style={{ width: '18px', height: '18px' }} />
        <input 
          type="text" 
          className="faq-search-input" 
          placeholder="Search for questions..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="faq-accordion">
        {filteredFaqs.map((faq, idx) => {
          const isActive = activeIndex === idx;
          return (
            <div className={`faq-item ${isActive ? 'active' : ''}`} key={idx}>
              <button className="faq-quest" onClick={() => toggleFaq(idx)}>
                <span>{faq.q}</span>
                <ChevronDown 
                  style={{ 
                    width: '16px', 
                    height: '16px', 
                    transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }} 
                  className="faq-icon" 
                />
              </button>
              <div 
                className="faq-ans" 
                dangerouslySetInnerHTML={{ __html: faq.a }}
                style={{ display: isActive ? 'block' : 'none' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
