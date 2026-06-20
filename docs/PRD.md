MemoryMate — AI-Powered Cognitive Support App for Dementia Care
Version: 1.0
Author: Yasas Lasith
Date: 2026-06-20
Type: Final Year Project (B.Sc. information Technology )

---

1. Overview

MemoryMate is a mobile application that helps people living with dementia or memory impairments stay safe and independent for longer, while giving their caregivers visibility and peace of mind. The app combines on-device face recognition, routine/medication reminders, geofencing-based safety alerts, and a calm conversational AI companion, all managed through a caregiver dashboard backed by a custom server.

The project is designed to demonstrate full-stack mobile development, applied AI/ML (computer vision + NLP), and responsible handling of sensitive personal data — making it suitable as a final year capstone with both engineering depth and social impact.

---

2. Problem Statement

People with early-to-moderate dementia frequently struggle with three things: recognizing familiar people, remembering daily routines (meals, medication, appointments), and staying within safe, familiar areas. Family caregivers cannot be present 24/7, and existing solutions are either purely reactive (GPS trackers with no context) or institutional and expensive. There is a gap for an affordable, privacy-conscious mobile app that provides gentle, in-the-moment support to the patient while keeping a caregiver informed.

---

3. Goals and Objectives

- Help patients recognize familiar people without feeling embarrassed or anxious.
- Reduce missed medication and routine adherence failures.
- Detect when a patient leaves a pre-defined safe zone and alert caregivers quickly.
- Provide a calm, repeatable way to answer common orientation questions ("What day is it?", "Where am I supposed to be?").
- Give caregivers a simple dashboard to configure faces, routines, safe zones, and review activity.
- Build the system with privacy and consent as first-class design constraints, not an afterthought.

---

4. Target Users and Personas

Primary user — The Patient
A person in early-to-moderate stages of dementia, generally still mobile and able to use a simplified phone interface with large text, voice prompts, and minimal navigation.

Secondary user — The Caregiver
An adult child, spouse, or professional carer who manages the patient's profile remotely: adding known faces, setting up routines, defining safe zones, and monitoring alerts and activity logs.

Tertiary user — Care Facility Staff (stretch scope)
Staff at a care home managing multiple patients through an admin view.

---

5. Scope

5.1 MVP (must-have for submission)
- Patient onboarding and simplified accessible UI (large text, voice-first navigation).
- Face recognition: caregiver uploads labeled photos; app recognizes them via the camera.
- Routine and medication reminders with simple accept/snooze voice or tap response.
- Safe-zone geofencing: caregiver draws a safe area; app sends push alert if patient leaves.
- Caregiver dashboard to manage faces, routines, safe zones, and view activity log.
- Secure authentication and patient-caregiver account linking.

5.2 Stretch goals (if time permits)
- Conversational AI companion for orientation questions.
- Simple anomaly detection on routine adherence.
- Multi-caregiver support per patient.
- Offline fallback mode.

5.3 Out of scope
- Medical diagnosis or treatment recommendations.
- Continuous video recording or surveillance.
- Wearable hardware integration.

---

6. Functional Requirements

FR1: Large font, high contrast, minimal tap UI for patients.
FR2: Camera-based face recognition with name+relationship announcement.
FR3: No false identifications — unknown faces must say "I don't recognise this person yet".
FR4: Scheduled reminders with done/snooze response.
FR5: Geofence-based caregiver alert on zone exit.
FR6 (stretch): Voice orientation questions.
FR7: Caregiver register, login, and patient linking via invite code.
FR8: Add/edit/remove known faces.
FR9: Create, edit, delete routine reminders.
FR10: Draw and edit safe zones on a map.
FR11: Push notifications on zone exit or missed reminder.
FR12: Chronological activity log for the caregiver.
FR13: Authenticated REST API for all operations.
FR14: Face embeddings stored securely; raw photos encrypted at rest.
FR15: Role-based access — only linked caregivers can view/modify patient data.
FR16: Audit log of data access events.

---

7. Non-Functional Requirements

Privacy & Consent: Sensitive data encrypted at rest and in transit. Patient consent assumed handled during onboarding.
Performance: Face recognition < 2 seconds. Geofencing battery-efficient via OS APIs.
Accessibility: WCAG-inspired — large tap targets, voice feedback, high contrast.
Reliability: Reminder delivery tested with intermittent connectivity.
Scalability: Architecture described as horizontally scalable.

---

8. Success Metrics

- Face recognition accuracy > 90% on enrolled faces under normal lighting.
- Reminder delivery success rate > 95%.
- Geofence alert latency < 60 seconds.
- SUS usability score from 3–5 test participants.

---

9. Tech Stack

Mobile App: React Native (Expo Managed Workflow), React Navigation, TensorFlow Lite.
Backend: Node.js + Express, PostgreSQL (SQLite in dev), Prisma ORM.
Face Recognition: On-device TFLite (Phase 4), backend photo match (Phase 1).
Geofencing: expo-location OS-level geofencing APIs.
Notifications: Firebase Cloud Messaging, expo-notifications.
Hosting: Render/Railway for backend.

---

10. Assumptions and Constraints

- Patient consent is assumed to be handled outside the app.
- Targets Android primarily; iOS supported by React Native.
- Development timeline: one academic year (~24–28 weeks).

---

11. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Face recognition accuracy low on low-end devices | High | Cloud API fallback; benchmark early |
| Battery drain from location polling | Medium | OS-level geofencing APIs |
| Scope creep from stretch features | Medium | Lock MVP scope at mid-review |
| Ethical/privacy concerns from evaluators | Medium | Dedicated ethics/privacy section in report |

---

12. Open Questions

Q1: Should the conversational companion be cloud-based or on-device?
Decision: Cloud-based (LLM API) with strict prompt guardrails. Deferred to stretch goal.

Q2: OS-level geofencing or custom polling?
Decision: OS-level geofencing via expo-location (battery-efficient, event-driven).
