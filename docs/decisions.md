# Decisions Log

This document records major product and technical decisions to avoid second-guessing and refactoring churn.

---

## 2026-01-XX — Project Initialization
- Project is framed as a “Student Operating System” (product-level OS, not system-level).
- Focus is decision support, not task tracking.
- UI-first approach using mock data to maintain motivation.
- Glassy + minimal design chosen for a premium feel.
- V1 scope intentionally limited to avoid abandonment.

---

## UI Decisions
- React + TypeScript + Vite
- Tailwind CSS
- shadcn/ui for base components
- Custom glass wrappers for visual identity

---

## AI Decisions
- V1 logic may be heuristic-based or rule-driven.
- AI sophistication comes after usefulness.
- Explanations are as important as predictions.
