import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPIs from './components/KPIs';
import Controls from './components/Controls';
import Analytics from './components/Analytics';
import GradeSheet from './components/GradeSheet';
import ConfigPanel from './components/ConfigPanel';
import FaqSection from './components/FaqSection';
import Toast from './components/Toast';

// Modals
import ReminderModal from './components/modals/ReminderModal';
import AddStudentModal from './components/modals/AddStudentModal';
import AddSubjectModal from './components/modals/AddSubjectModal';
import ManageSubjectsModal from './components/modals/ManageSubjectsModal';
import PdfSettingsModal from './components/modals/PdfSettingsModal';
import ImportExportModal from './components/modals/ImportExportModal';
import ConfirmModal from './components/modals/ConfirmModal';
import ProfilesModal from './components/modals/ProfilesModal';

// Exporters
import { generatePdfReport, generateStudentResultCards } from './utils/pdfExporter';
import { Menu } from 'lucide-react';

export default function App() {
  const { 
    students, 
    subjects, 
    config,
    isReminderDismissed, 
    deleteStudent, 
    deleteSubject, 
    resetActiveProfile,
    activeTab,
    sortedStudents
  } = useApp();

  // Mobile sidebar drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals Visibility States
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isManageSubjectsOpen, setIsManageSubjectsOpen] = useState(false);
  const [isPdfSettingsOpen, setIsPdfSettingsOpen] = useState(false);
  const [pdfSettingsType, setPdfSettingsType] = useState('report'); // 'report' | 'cards'
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isProfilesOpen, setIsProfilesOpen] = useState(false);

  // Custom Confirm Modal States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('Confirm Action');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState(''); // 'delete_student' | 'delete_subject' | 'reset_sheet'
  const [confirmData, setConfirmData] = useState(null);

  // Open first-time reminder modal if not dismissed
  useEffect(() => {
    if (!isReminderDismissed) {
      setIsReminderOpen(true);
    }
  }, [isReminderDismissed]);

  // Handle PDF submission to generate outputs
  const handlePdfSubmit = (data) => {
    const selectedDate = data.customDate || config.branding.customDate;
    if (pdfSettingsType === 'report') {
      generatePdfReport(data.heading, sortedStudents, subjects, data.teacherSig || config.branding.teacherSig, selectedDate);
    } else {
      generateStudentResultCards(
        data.schoolName, 
        data.className, 
        data.termExam, 
        sortedStudents, 
        subjects, 
        data.teacherSig || config.branding.teacherSig, 
        data.principalSig || config.branding.principalSig,
        config.gradeRules,
        data.templateStyle || config.branding.templateStyle,
        selectedDate
      );
    }
  };

  // Trigger Deleting a student with confirmation
  const handleDeleteStudentConfirm = (student) => {
    setConfirmType('delete_student');
    setConfirmData(student);
    setConfirmTitle('Remove Student');
    setConfirmMessage(`Are you sure you want to delete ${student.name || 'this student'} from the class list?`);
    setIsConfirmOpen(true);
  };

  // Trigger Deleting a subject with confirmation
  const handleDeleteSubjectConfirm = (index, name) => {
    setConfirmType('delete_subject');
    setConfirmData({ index, name });
    setConfirmTitle('Delete Subject');
    setConfirmMessage(`Are you sure you want to delete the subject "${name}"? This will permanently delete all student marks recorded for this subject.`);
    setIsConfirmOpen(true);
  };

  // Trigger Resetting roster with confirmation
  const handleResetConfirm = () => {
    setConfirmType('reset_sheet');
    setConfirmTitle('Reset Grading Sheet');
    setConfirmMessage('Warning: This will clear all students, subjects, and saved configuration settings of this sheet. This action is irreversible. Do you want to proceed?');
    setIsConfirmOpen(true);
  };

  // Execute confirm callback actions
  const handleConfirmExecute = () => {
    if (confirmType === 'delete_student' && confirmData) {
      deleteStudent(confirmData.id);
    } else if (confirmType === 'delete_subject' && confirmData) {
      deleteSubject(confirmData.index);
    } else if (confirmType === 'reset_sheet') {
      resetActiveProfile();
    }
    setIsConfirmOpen(false);
    setConfirmData(null);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Panel Left Drawer */}
      <Sidebar 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
        onManageProfiles={() => setIsProfilesOpen(true)}
        onExportPdf={() => {
          setPdfSettingsType('report');
          setIsPdfSettingsOpen(true);
        }}
        onExportCards={() => {
          setPdfSettingsType('cards');
          setIsPdfSettingsOpen(true);
        }}
        onShareBackup={() => setIsImportExportOpen(true)}
      />

      {/* Main Page Content Block */}
      <main className="main-content">
        
        {/* Mobile View Top Header Toggler */}
        <div className="mobile-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="hamburger-btn" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
              <Menu style={{ width: '22px', height: '22px' }} />
            </button>
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.5px' }}>
              Result Compiler Studio
            </span>
          </div>
        </div>

        {/* Global Dashboard Page Header */}
        <Header 
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
          onOpenProfiles={() => setIsProfilesOpen(true)}
        />

        {/* Dynamic Tab Renderers */}
        {activeTab === 'sheet' && (
          <>
            <KPIs />
            <Controls 
              onAddStudent={() => setIsAddStudentOpen(true)}
              onAddSubject={() => setIsAddSubjectOpen(true)}
              onManageSubjects={() => setIsManageSubjectsOpen(true)}
              onReset={handleResetConfirm}
            />
            <GradeSheet onDeleteStudent={handleDeleteStudentConfirm} />
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <KPIs />
            <Analytics visible={true} />
          </>
        )}

        {activeTab === 'settings' && (
          <ConfigPanel />
        )}

        {activeTab === 'faq' && (
          <FaqSection />
        )}
      </main>

      {/* Toast popup notifications */}
      <Toast />

      {/* Modals Portals */}
      <ReminderModal 
        isOpen={isReminderOpen} 
        onClose={() => setIsReminderOpen(false)} 
      />
      
      <AddStudentModal 
        isOpen={isAddStudentOpen} 
        onClose={() => setIsAddStudentOpen(false)} 
      />

      <AddSubjectModal 
        isOpen={isAddSubjectOpen} 
        onClose={() => setIsAddSubjectOpen(false)} 
      />

      <ManageSubjectsModal 
        isOpen={isManageSubjectsOpen} 
        onClose={() => setIsManageSubjectsOpen(false)}
        onDeleteSubject={handleDeleteSubjectConfirm}
      />

      <PdfSettingsModal 
        isOpen={isPdfSettingsOpen}
        onClose={() => setIsPdfSettingsOpen(false)}
        type={pdfSettingsType}
        onSubmit={handlePdfSubmit}
      />

      <ImportExportModal 
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
      />

      <ProfilesModal 
        isOpen={isProfilesOpen}
        onClose={() => setIsProfilesOpen(false)}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={handleConfirmExecute}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
