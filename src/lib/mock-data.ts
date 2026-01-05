import type { 
  Course, 
  Deliverable, 
  AcademicHealth, 
  OverloadRisk, 
  WorkloadData, 
  GradeProjection, 
  ActionItem 
} from './types';

export const mockCourses: Course[] = [
  { id: '1', name: 'Machine Learning', code: 'CS229', color: '#3B82F6' },
  { id: '2', name: 'Database Systems', code: 'CS186', color: '#10B981' },
  { id: '3', name: 'Operating Systems', code: 'CS162', color: '#F59E0B' },
  { id: '4', name: 'Algorithms', code: 'CS170', color: '#8B5CF6' },
];

export const mockDeliverables: Deliverable[] = [
  {
    id: '1',
    title: 'Neural Network Project',
    courseId: '1',
    courseName: 'Machine Learning',
    dueDate: '2024-01-15',
    status: 'in_progress',
    priority: 'high',
    estimatedHours: 20,
    gradeWeight: 25,
    currentGrade: 85,
    targetGrade: 90,
    riskLevel: 'medium',
  },
  {
    id: '2',
    title: 'Database Design Assignment',
    courseId: '2',
    courseName: 'Database Systems',
    dueDate: '2024-01-12',
    status: 'in_progress',
    priority: 'high',
    estimatedHours: 12,
    gradeWeight: 15,
    targetGrade: 88,
    riskLevel: 'low',
  },
  {
    id: '3',
    title: 'Kernel Module Implementation',
    courseId: '3',
    courseName: 'Operating Systems',
    dueDate: '2024-01-18',
    status: 'not_started',
    priority: 'medium',
    estimatedHours: 15,
    gradeWeight: 20,
    targetGrade: 85,
    riskLevel: 'high',
  },
  {
    id: '4',
    title: 'Dynamic Programming Problem Set',
    courseId: '4',
    courseName: 'Algorithms',
    dueDate: '2024-01-10',
    status: 'completed',
    priority: 'medium',
    estimatedHours: 8,
    gradeWeight: 10,
    currentGrade: 92,
    riskLevel: 'low',
  },
  {
    id: '5',
    title: 'Midterm Exam Study',
    courseId: '1',
    courseName: 'Machine Learning',
    dueDate: '2024-01-20',
    status: 'not_started',
    priority: 'high',
    estimatedHours: 16,
    gradeWeight: 30,
    targetGrade: 88,
    riskLevel: 'medium',
  },
];

export const mockAcademicHealth: AcademicHealth = {
  score: 78,
  trend: 'up',
  factors: {
    workload: 72,
    grades: 85,
    timeliness: 80,
    balance: 75,
  },
};

export const mockOverloadRisk: OverloadRisk = {
  level: 'medium',
  score: 65,
  reasons: [
    '3 high-priority deliverables due within 7 days',
    'Estimated 48 hours of work remaining',
    'One deliverable has high risk level',
  ],
};

export const mockWorkloadData: WorkloadData[] = [
  { date: '2024-01-08', hours: 6, deliverables: 2 },
  { date: '2024-01-09', hours: 8, deliverables: 3 },
  { date: '2024-01-10', hours: 4, deliverables: 1 },
  { date: '2024-01-11', hours: 10, deliverables: 2 },
  { date: '2024-01-12', hours: 7, deliverables: 2 },
  { date: '2024-01-13', hours: 5, deliverables: 1 },
  { date: '2024-01-14', hours: 9, deliverables: 3 },
];

export const mockGradeProjection: GradeProjection[] = [
  { date: '2024-01-08', current: 85.2, projected: 85.5, min: 82, max: 89 },
  { date: '2024-01-09', current: 85.5, projected: 86.0, min: 83, max: 89.5 },
  { date: '2024-01-10', current: 86.0, projected: 86.5, min: 83.5, max: 90 },
  { date: '2024-01-11', current: 86.5, projected: 87.0, min: 84, max: 90.5 },
  { date: '2024-01-12', current: 87.0, projected: 87.5, min: 84.5, max: 91 },
  { date: '2024-01-13', current: 87.5, projected: 88.0, min: 85, max: 91.5 },
  { date: '2024-01-14', current: 88.0, projected: 88.5, min: 85.5, max: 92 },
];

export const mockActionItems: ActionItem[] = [
  {
    id: '1',
    title: 'Complete Neural Network Project',
    description: 'Finish implementation and write-up for CS229 project',
    priority: 'high',
    dueDate: '2024-01-15',
    type: 'deliverable',
  },
  {
    id: '2',
    title: 'Review Database Design',
    description: 'Double-check ER diagrams and normalization',
    priority: 'high',
    dueDate: '2024-01-12',
    type: 'review',
  },
  {
    id: '3',
    title: 'Start Kernel Module Research',
    description: 'Begin reading documentation for OS assignment',
    priority: 'medium',
    dueDate: '2024-01-18',
    type: 'study',
  },
];
