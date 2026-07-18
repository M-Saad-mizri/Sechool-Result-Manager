import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const generateId = () => 'std_' + Math.random().toString(36).substr(2, 9);
const generateProfileId = () => 'prof_' + Math.random().toString(36).substr(2, 9);

// Default dynamic grade rules config
const DEFAULT_GRADE_RULES = [
  { grade: "A+", minPercent: 90, remarks: [
    "Excellent effort, keep up the great work!",
    "Outstanding performance, you're a role model!",
    "Superb results! You should be very proud.",
    "Your hard work is clearly paying off!"
  ]},
  { grade: "A", minPercent: 80, remarks: [
    "Great job, you're improving every day!",
    "Commendable performance, stay focused!",
    "Solid work this term, keep it up!"
  ]},
  { grade: "B", minPercent: 70, remarks: [
    "Good effort, but there's still room for more growth.",
    "Nice work, but you need to focus on weak areas.",
    "You have good potential, push for better results!"
  ]},
  { grade: "C", minPercent: 60, remarks: [
    "Satisfactory effort, but there’s room for improvement.",
    "Keep working, and review challenging topics.",
    "Decent effort, consistency is key!"
  ]},
  { grade: "D", minPercent: 50, remarks: [
    "Needs improvement in several areas.",
    "You need to spend more time on your studies.",
    "Focus on the basics to boost your score."
  ]},
  { grade: "F", minPercent: 0, remarks: [
    "Failed, please put in more effort and seek help.",
    "You need to dedicate more time to studies.",
    "Let's work together to improve this result."
  ]}
];

const titleCase = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const DEFAULT_BRANDING = {
  schoolName: "Beaconhouse School System",
  className: "Grade 8-A",
  termExam: "First Term Exam",
  teacherSig: null,
  principalSig: null,
  templateStyle: 'classic_navy',
  customDate: ''
};

// Calculate letter grade based on dynamic rules
const calculateLetterGrade = (percentage, gradeRules) => {
  const rules = gradeRules || DEFAULT_GRADE_RULES;
  // Sort rules descending by threshold percentage
  const sortedRules = [...rules].sort((a, b) => b.minPercent - a.minPercent);
  const matched = sortedRules.find(r => percentage >= r.minPercent);
  return matched ? matched.grade : "F";
};

// Calculate single student metrics with custom rules
const calculateStudent = (student, subjects, gradeRules) => {
  let totalObt = 0;
  subjects.forEach(sub => {
    const val = parseFloat(student.marks[sub.name]) || 0;
    totalObt += val;
  });
  const totalMax = subjects.reduce((sum, sub) => sum + (parseFloat(sub.maxMarks) || 0), 0);
  const percentage = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
  
  return {
    ...student,
    totalMarks: totalObt,
    percentage: percentage,
    grade: calculateLetterGrade(percentage, gradeRules)
  };
};

export const AppProvider = ({ children }) => {
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isReminderDismissed, setIsReminderDismissed] = useState(false);
  const [toast, setToast] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState('sheet'); // 'sheet' | 'analytics' | 'settings' | 'faq'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rank'); // 'rank' | 'name' | 'percentage'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Initialize: Load databases and check themes
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    setIsReminderDismissed(localStorage.getItem('dontShowAgain') === '1');

    const storedProfiles = localStorage.getItem('result_compiler_profiles');
    const legacyData = localStorage.getItem('results');

    let initialProfiles = [];
    let initialActiveId = null;

    if (storedProfiles) {
      try {
        initialProfiles = JSON.parse(storedProfiles);
      } catch (e) {
        console.error("Error loading profiles:", e);
      }
    }

    // Migration of legacy data key
    if (initialProfiles.length === 0 && legacyData) {
      try {
        const parsed = JSON.parse(legacyData);
        const legacySubjects = parsed.subjects || [];
        const migratedSubjects = legacySubjects.map(sub => 
          typeof sub === 'string' ? { name: sub, maxMarks: 100 } : sub
        );

        const migratedStudents = (parsed.students || []).map(std => {
          let marksObj = {};
          if (Array.isArray(std.marks)) {
            migratedSubjects.forEach((sub, idx) => {
              marksObj[sub.name] = std.marks[idx] !== undefined ? std.marks[idx] : "";
            });
          } else {
            marksObj = std.marks || {};
            migratedSubjects.forEach(sub => {
              if (marksObj[sub.name] === undefined) marksObj[sub.name] = "";
            });
          }
          return {
            id: std.id || generateId(),
            name: std.name || "",
            fatherName: std.fatherName || "",
            marks: marksObj,
            totalMarks: std.totalMarks || 0,
            percentage: std.percentage || 0,
            grade: std.grade || "F"
          };
        });

        initialProfiles = [{
          id: 'migrated_default',
          name: 'Default Sheet',
          createdAt: new Date().toISOString().split('T')[0],
          students: migratedStudents,
          subjects: migratedSubjects.length > 0 ? migratedSubjects : [
            { name: "English", maxMarks: 100 },
            { name: "English B/R", maxMarks: 100 },
            { name: "Urdu", maxMarks: 50 }
          ],
          config: {
            gradeRules: DEFAULT_GRADE_RULES,
            branding: DEFAULT_BRANDING
          }
        }];
        initialActiveId = 'migrated_default';
      } catch (e) {
        console.error("Migration error:", e);
      }
    }

    // Fill missing configs in loaded profiles
    if (initialProfiles.length > 0) {
      initialProfiles = initialProfiles.map(p => {
        if (!p.createdAt) {
          p.createdAt = new Date().toISOString().split('T')[0];
        }
        if (!p.config) {
          p.config = {
            gradeRules: DEFAULT_GRADE_RULES,
            branding: DEFAULT_BRANDING
          };
        } else {
          if (!p.config.gradeRules) p.config.gradeRules = DEFAULT_GRADE_RULES;
          if (!p.config.branding) p.config.branding = DEFAULT_BRANDING;
        }
        return p;
      });
    }

    // Fallback new default sheet profile
    if (initialProfiles.length === 0) {
      const defaultId = generateProfileId();
      initialProfiles = [{
        id: defaultId,
        name: 'Class 8-A Assessment',
        createdAt: new Date().toISOString().split('T')[0],
        students: [],
        subjects: [
          { name: "English", maxMarks: 100 },
          { name: "English B/R", maxMarks: 100 },
          { name: "Urdu", maxMarks: 50 }
        ],
        config: {
          gradeRules: DEFAULT_GRADE_RULES,
          branding: DEFAULT_BRANDING
        }
      }];
      initialActiveId = defaultId;
    } else if (!initialActiveId) {
      const savedActiveId = localStorage.getItem('result_compiler_active_profile_id');
      if (savedActiveId && initialProfiles.some(p => p.id === savedActiveId)) {
        initialActiveId = savedActiveId;
      } else {
        initialActiveId = initialProfiles[0].id;
      }
    }

    setProfiles(initialProfiles);
    setActiveProfileId(initialActiveId);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('result_compiler_profiles', JSON.stringify(profiles));
      setUnsavedChanges(false);
    }
  }, [profiles]);

  // Save active profile ID to localStorage
  useEffect(() => {
    if (activeProfileId) {
      localStorage.setItem('result_compiler_active_profile_id', activeProfileId);
    }
  }, [activeProfileId]);

  // Sync theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Helpers
  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;
  const students = activeProfile ? activeProfile.students : [];
  const subjects = activeProfile ? activeProfile.subjects : [];
  const config = activeProfile ? activeProfile.config : { gradeRules: DEFAULT_GRADE_RULES, branding: DEFAULT_BRANDING };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Math.random() });
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const dismissReminder = (dontShowAgain) => {
    if (dontShowAgain) {
      localStorage.setItem('dontShowAgain', '1');
      setIsReminderDismissed(true);
    }
    showToast('Preferences updated!');
  };

  const updateActiveProfileData = (updatedFields) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return { ...p, ...updatedFields };
      }
      return p;
    }));
    setUnsavedChanges(true);
  };

  // --- CONFIG / SETTINGS UPDATE ACTIONS ---
  const updateProfileConfig = (newConfig) => {
    if (!activeProfile) return;
    
    const mergedBranding = {
      ...activeProfile.config.branding,
      ...(newConfig.branding || {})
    };

    if (newConfig.branding) {
      if (newConfig.branding.schoolName) mergedBranding.schoolName = titleCase(newConfig.branding.schoolName);
      if (newConfig.branding.className) mergedBranding.className = titleCase(newConfig.branding.className);
      if (newConfig.branding.termExam) mergedBranding.termExam = titleCase(newConfig.branding.termExam);
    }

    const mergedConfig = {
      ...activeProfile.config,
      ...newConfig,
      branding: mergedBranding
    };

    // If gradeRules changed, recalculate all student letter grades
    let updatedStudents = students;
    if (newConfig.gradeRules) {
      updatedStudents = students.map(std => 
        calculateStudent(std, subjects, newConfig.gradeRules)
      );
    }

    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return { 
          ...p, 
          config: mergedConfig,
          students: updatedStudents
        };
      }
      return p;
    }));
    setUnsavedChanges(true);
    showToast('Configuration settings updated!');
  };

  const resetProfileConfig = () => {
    if (!activeProfile) return;
    
    const updatedStudents = students.map(std => 
      calculateStudent(std, subjects, DEFAULT_GRADE_RULES)
    );

    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return { 
          ...p, 
          config: {
            gradeRules: DEFAULT_GRADE_RULES,
            branding: DEFAULT_BRANDING
          },
          students: updatedStudents
        };
      }
      return p;
    }));
    setUnsavedChanges(true);
    showToast('Configuration settings reset to default values.');
  };

  // --- STUDENT ACTIONS ---
  const addStudents = (namesString) => {
    if (!namesString.trim()) return;
    const names = namesString
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n && !/^\d/.test(n));

    if (names.length === 0) {
      showToast('Names cannot start with a number.', 'danger');
      return;
    }

    const newStudents = names.map(name => {
      const defaultMarks = {};
      subjects.forEach(sub => {
        defaultMarks[sub.name] = "";
      });
      return {
        id: generateId(),
        name: titleCase(name),
        fatherName: "",
        marks: defaultMarks,
        totalMarks: 0,
        percentage: 0,
        grade: calculateLetterGrade(0, config.gradeRules)
      };
    });

    updateActiveProfileData({
      students: [...students, ...newStudents]
    });
    showToast(`Added ${newStudents.length} student(s) successfully!`);
  };

  const updateStudentField = (studentId, field, value) => {
    const processedValue = (field === 'name' || field === 'fatherName') ? titleCase(value) : value;
    const updatedStudents = students.map(std => {
      if (std.id === studentId) {
        const updated = { ...std, [field]: processedValue };
        return calculateStudent(updated, subjects, config.gradeRules);
      }
      return std;
    });
    updateActiveProfileData({ students: updatedStudents });
  };

  const updateStudentMark = (studentId, subjectName, value) => {
    const updatedStudents = students.map(std => {
      if (std.id === studentId) {
        const updatedMarks = { ...std.marks, [subjectName]: value };
        const updated = { ...std, marks: updatedMarks };
        return calculateStudent(updated, subjects, config.gradeRules);
      }
      return std;
    });
    
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return { ...p, students: updatedStudents };
      }
      return p;
    }));
    setUnsavedChanges(true);
  };

  const deleteStudent = (studentId) => {
    const updatedStudents = students.filter(std => std.id !== studentId);
    updateActiveProfileData({ students: updatedStudents });
    showToast('Student deleted.');
  };

  // --- SUBJECT ACTIONS ---
  const addSubject = (name, maxMarks) => {
    const normalized = titleCase(name.trim());
    if (subjects.some(sub => sub.name.toLowerCase() === normalized.toLowerCase())) {
      showToast('Subject already exists.', 'warning');
      return;
    }

    const newSubject = { name: normalized, maxMarks: parseFloat(maxMarks) || 100 };
    const updatedSubjects = [...subjects, newSubject];

    const updatedStudents = students.map(std => {
      const updated = {
        ...std,
        marks: { ...std.marks, [normalized]: "" }
      };
      return calculateStudent(updated, updatedSubjects, config.gradeRules);
    });

    updateActiveProfileData({
      subjects: updatedSubjects,
      students: updatedStudents
    });
    showToast(`Subject "${normalized}" added successfully.`);
  };

  const updateSubject = (index, name, maxMarks) => {
    const oldName = subjects[index].name;
    const newName = titleCase(name.trim());
    const newMax = parseFloat(maxMarks) || 100;

    const updatedSubjects = [...subjects];
    updatedSubjects[index] = { name: newName, maxMarks: newMax };

    const updatedStudents = students.map(std => {
      const marksCopy = { ...std.marks };
      if (oldName !== newName) {
        marksCopy[newName] = marksCopy[oldName] !== undefined ? marksCopy[oldName] : "";
        delete marksCopy[oldName];
      }
      const updated = { ...std, marks: marksCopy };
      return calculateStudent(updated, updatedSubjects, config.gradeRules);
    });

    updateActiveProfileData({
      subjects: updatedSubjects,
      students: updatedStudents
    });
    showToast(`Subject "${newName}" updated.`);
  };

  const deleteSubject = (index) => {
    const subName = subjects[index].name;
    const updatedSubjects = subjects.filter((_, idx) => idx !== index);

    const updatedStudents = students.map(std => {
      const marksCopy = { ...std.marks };
      delete marksCopy[subName];
      const updated = { ...std, marks: marksCopy };
      return calculateStudent(updated, updatedSubjects, config.gradeRules);
    });

    updateActiveProfileData({
      subjects: updatedSubjects,
      students: updatedStudents
    });
    showToast(`Subject "${subName}" deleted.`);
  };

  // --- ACTIONS ---
  const compileAndRank = () => {
    let hasError = false;
    students.forEach(std => {
      subjects.forEach(sub => {
        const val = parseFloat(std.marks[sub.name]);
        if (val > sub.maxMarks || val < 0) {
          hasError = true;
        }
      });
    });

    if (hasError) {
      showToast('⚠️ Warning: Some marks exceed subject maximum bounds!', 'danger');
    }

    const compiled = students
      .map(std => calculateStudent(std, subjects, config.gradeRules))
      .sort((a, b) => b.percentage - a.percentage);

    updateActiveProfileData({ students: compiled });
    showToast('Compilation and class ranking complete!');
  };

  const resetActiveProfile = () => {
    updateActiveProfileData({
      students: [],
      subjects: [
        { name: "English", maxMarks: 100 },
        { name: "English B/R", maxMarks: 100 },
        { name: "Urdu", maxMarks: 50 }
      ],
      config: {
        gradeRules: DEFAULT_GRADE_RULES,
        branding: DEFAULT_BRANDING
      }
    });
    showToast('Roster reset to default layout.');
  };

  const importData = (dataObject) => {
    if (!dataObject || (!dataObject.students && !dataObject.subjects)) {
      showToast('Invalid backup file structure.', 'danger');
      return;
    }

    const importedName = dataObject.name ? dataObject.name.trim() : (activeProfile ? activeProfile.name : 'Imported Sheet');

    // Parse imported subjects
    let importedSubjects = [];
    if (dataObject.subjects) {
      importedSubjects = dataObject.subjects.map(sub => 
        typeof sub === 'string' ? { name: sub, maxMarks: 100 } : sub
      );
    }

    // Parse imported rules and config
    const importedRules = dataObject.config?.gradeRules || DEFAULT_GRADE_RULES;
    const importedBranding = dataObject.config?.branding || DEFAULT_BRANDING;
    const importedConfig = {
      gradeRules: importedRules,
      branding: importedBranding
    };

    // Parse imported students
    let importedStudents = [];
    if (dataObject.students) {
      importedStudents = dataObject.students.map(std => {
        let marksObj = {};
        if (Array.isArray(std.marks)) {
          importedSubjects.forEach((sub, idx) => {
            marksObj[sub.name] = std.marks[idx] !== undefined ? std.marks[idx] : "";
          });
        } else {
          marksObj = std.marks || {};
          importedSubjects.forEach(sub => {
            if (marksObj[sub.name] === undefined) marksObj[sub.name] = "";
          });
        }
        return {
          id: std.id || generateId(),
          name: std.name || "",
          fatherName: std.fatherName || "",
          marks: marksObj,
          totalMarks: std.totalMarks || 0,
          percentage: std.percentage || 0,
          grade: std.grade || "F"
        };
      });
    }

    // Check if profile with the same name exists
    const existingIdx = profiles.findIndex(p => p.name.toLowerCase() === importedName.toLowerCase());

    if (existingIdx !== -1) {
      // Exists: Merge/add data to this sheet
      const existingProfile = profiles[existingIdx];
      
      // 1. Merge subjects: keep existing, add new ones
      const mergedSubjects = [...existingProfile.subjects];
      importedSubjects.forEach(impSub => {
        if (!mergedSubjects.some(sub => sub.name.toLowerCase() === impSub.name.toLowerCase())) {
          mergedSubjects.push(impSub);
        }
      });

      // 2. Overwrite/merge configuration (prefer imported for grading scale, merge branding)
      const mergedConfig = {
        gradeRules: dataObject.config?.gradeRules || existingProfile.config?.gradeRules || DEFAULT_GRADE_RULES,
        branding: {
          ...(existingProfile.config?.branding || DEFAULT_BRANDING),
          ...(dataObject.config?.branding || {})
        }
      };

      // 3. Merge students: match by name (case-insensitive)
      const mergedStudents = [...existingProfile.students];
      importedStudents.forEach(impStd => {
        const stdIdx = mergedStudents.findIndex(std => std.name.toLowerCase() === impStd.name.toLowerCase());
        
        if (stdIdx !== -1) {
          // Merge student marks
          const existingStd = mergedStudents[stdIdx];
          const mergedMarks = { ...existingStd.marks, ...impStd.marks };
          // Ensure all merged subjects are covered
          mergedSubjects.forEach(sub => {
            if (mergedMarks[sub.name] === undefined) {
              mergedMarks[sub.name] = "";
            }
          });
          mergedStudents[stdIdx] = {
            ...existingStd,
            fatherName: impStd.fatherName || existingStd.fatherName,
            marks: mergedMarks
          };
        } else {
          // Add student
          const newMarks = { ...impStd.marks };
          mergedSubjects.forEach(sub => {
            if (newMarks[sub.name] === undefined) {
              newMarks[sub.name] = "";
            }
          });
          mergedStudents.push({
            id: generateId(),
            name: impStd.name,
            fatherName: impStd.fatherName || "",
            marks: newMarks
          });
        }
      });

      // 4. Recalculate metrics for all students in this profile
      const finalStudents = mergedStudents.map(std => 
        calculateStudent(std, mergedSubjects, mergedConfig.gradeRules)
      );

      // Update profile and set active
      setProfiles(prev => prev.map((p, idx) => {
        if (idx === existingIdx) {
          return {
            ...p,
            subjects: mergedSubjects,
            config: mergedConfig,
            students: finalStudents
          };
        }
        return p;
      }));
      setActiveProfileId(existingProfile.id);
      showToast(`Sheet "${importedName}" already exists. Data has been successfully merged into it!`, 'success');
    } else {
      // Does not exist: Create new profile
      const newProfileId = generateProfileId();
      const newProfile = {
        id: newProfileId,
        name: titleCase(importedName),
        createdAt: dataObject.createdAt || new Date().toISOString().split('T')[0],
        subjects: importedSubjects.length > 0 ? importedSubjects : [
          { name: "English", maxMarks: 100 },
          { name: "English B/R", maxMarks: 100 },
          { name: "Urdu", maxMarks: 50 }
        ],
        config: importedConfig,
        students: []
      };

      // Process students with new profile config and subjects
      newProfile.students = importedStudents.map(std => {
        const stdMarks = { ...std.marks };
        newProfile.subjects.forEach(sub => {
          if (stdMarks[sub.name] === undefined) stdMarks[sub.name] = "";
        });
        const processedStd = {
          id: std.id || generateId(),
          name: std.name || "",
          fatherName: std.fatherName || "",
          marks: stdMarks
        };
        return calculateStudent(processedStd, newProfile.subjects, newProfile.config.gradeRules);
      });

      setProfiles(prev => [...prev, newProfile]);
      setActiveProfileId(newProfileId);
      showToast(`Created new sheet "${titleCase(importedName)}" and imported data.`, 'success');
    }
  };

  // --- MULTIPLE PROFILE SAVING ---
  const createNewProfile = (name) => {
    const newId = generateProfileId();
    const newProfile = {
      id: newId,
      name: titleCase(name.trim()) || `Result Sheet #${profiles.length + 1}`,
      createdAt: new Date().toISOString().split('T')[0],
      students: [],
      subjects: [
        { name: "English", maxMarks: 100 },
        { name: "English B/R", maxMarks: 100 },
        { name: "Urdu", maxMarks: 50 }
      ],
      config: {
        gradeRules: DEFAULT_GRADE_RULES,
        branding: DEFAULT_BRANDING
      }
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newId);
    showToast(`Created profile: "${newProfile.name}"`);
  };

  const cloneActiveProfile = (newName) => {
    if (!activeProfile) return;
    const newId = generateProfileId();
    const cloned = {
      ...activeProfile,
      id: newId,
      name: titleCase(newName.trim()) || `${activeProfile.name} (Copy)`
    };
    setProfiles(prev => [...prev, cloned]);
    setActiveProfileId(newId);
    showToast(`Cloned profile as: "${cloned.name}"`);
  };

  const renameProfile = (profileId, newName) => {
    const cleaned = titleCase(newName.trim());
    if (!cleaned) return;
    setProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        return { ...p, name: cleaned };
      }
      return p;
    }));
    showToast(`Renamed to "${cleaned}"`);
  };

  const deleteProfile = (profileId) => {
    if (profiles.length <= 1) {
      showToast('Cannot delete the last remaining sheet profile.', 'warning');
      return;
    }
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    setProfiles(updatedProfiles);
    
    if (activeProfileId === profileId) {
      setActiveProfileId(updatedProfiles[0].id);
    }
    showToast('Result sheet profile removed.');
  };

  const loadProfile = (profileId) => {
    setActiveProfileId(profileId);
    showToast('Loaded selected profile.');
  };

  // --- DYNAMIC SEARCH & SORTING ---
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default to high-to-low for scores/percentages
    }
  };

  const getSortedAndFilteredStudents = () => {
    // 1. Filter by query
    let result = [...students];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(std => 
        std.name.toLowerCase().includes(q) || 
        std.fatherName.toLowerCase().includes(q)
      );
    }

    // 2. Sort by criteria
    result.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortBy === 'percentage') {
        valA = a.percentage;
        valB = b.percentage;
      } else {
        // Default Rank position (percentage sorted descending)
        valA = a.percentage;
        valB = b.percentage;
        // Invert search values for rank so order corresponds correctly
        return b.percentage - a.percentage;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  };

  // --- KPIS CALCULATIONS ---
  const classCount = students.length;
  let classAverage = 0;
  let passRate = 0;
  let topper = { name: 'N/A', scoreText: 'Top Ranked Student' };

  if (classCount > 0) {
    let sumPercentage = 0;
    let passes = 0;
    let highestPercent = -1;
    let topperName = 'N/A';
    let topperObt = 0;
    let topperMax = 0;
    const totalMax = subjects.reduce((sum, sub) => sum + (parseFloat(sub.maxMarks) || 0), 0);

    students.forEach(std => {
      sumPercentage += std.percentage;
      if (std.grade !== "F") passes++;
      
      if (std.percentage > highestPercent) {
        highestPercent = std.percentage;
        topperName = std.name || "Unnamed";
        topperObt = std.totalMarks;
        topperMax = totalMax;
      }
    });

    classAverage = sumPercentage / classCount;
    passRate = (passes / classCount) * 100;
    topper = {
      name: topperName,
      scoreText: `${highestPercent.toFixed(1)}% (${topperObt}/${topperMax})`
    };
  }

  return (
    <AppContext.Provider value={{
      profiles,
      activeProfileId,
      activeProfile,
      students,
      subjects,
      config,
      theme,
      toggleTheme,
      isReminderDismissed,
      dismissReminder,
      toast,
      showToast,
      unsavedChanges,

      // Tab & Filter States
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      sortBy,
      sortOrder,
      handleSortChange,
      sortedStudents: getSortedAndFilteredStudents(),
      
      // Actions
      addStudents,
      updateStudentField,
      updateStudentMark,
      deleteStudent,
      addSubject,
      updateSubject,
      deleteSubject,
      compileAndRank,
      resetActiveProfile,
      importData,
      updateProfileConfig,
      resetProfileConfig,

      // Profile management
      createNewProfile,
      cloneActiveProfile,
      renameProfile,
      deleteProfile,
      loadProfile,

      // Computed KPIs
      kpis: {
        totalStudents: classCount,
        classAverage: `${classAverage.toFixed(2)}%`,
        passRate: `${passRate.toFixed(2)}%`,
        topper
      }
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
