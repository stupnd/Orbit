/**
 * Type definitions for the AI Student OS application
 */

export type Course = {
  id: string;
  name: string;
  code: string;
  color: string;
};

export type DeliverableStatus = 'incomplete' | 'in_progress' | 'submitted' | 'graded';

export type Deliverable = {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  status: DeliverableStatus;
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
  gradeWeight: number;
  currentGrade?: number; // deprecated, use actualGrade
  targetGrade?: number;
  actualGrade?: number; // the real grade received (0-100)
  riskLevel: 'low' | 'medium' | 'high';
};

export type AcademicHealth = {
  score: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  factors: {
    workload: number;
    grades: number;
    timeliness: number;
    balance: number;
  };
};

export type OverloadRisk = {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  reasons: string[];
};

export type WorkloadData = {
  date: string;
  hours: number;
  deliverables: number;
};

export type GradeProjection = {
  date: string;
  current: number;
  projected: number;
  min: number;
  max: number;
};

export type ActionItem = {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  type: 'deliverable' | 'study' | 'review';
};

export type WhatIfInput = {
  deliverableId: string;
  effortHours: number;
  targetGrade: number;
  riskLevel: 'low' | 'medium' | 'high';
};

export type WhatIfOutput = {
  gradeChange: number;
  timeChange: number;
  riskChange: number;
  explanation: string;
};
