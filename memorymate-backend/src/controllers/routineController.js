// src/controllers/routineController.js
// CRUD for routines + routine log (completed/missed/snoozed)

const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');
const { isLinkedOrSelf } = require('./patientController');
const { z } = require('zod');

const prisma = new PrismaClient();

const routineSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  scheduleTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  type: z.enum(['MEDICATION', 'APPOINTMENT', 'MEAL', 'OTHER']).default('OTHER'),
});

// GET /patients/:id/routines
async function getRoutines(req, res, next) {
  try {
    const { id: patientId } = req.params;

    const allowed = await isLinkedOrSelf(req.user.id, patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    const routines = await prisma.routine.findMany({
      where: { patientId, isActive: true },
      orderBy: { scheduleTime: 'asc' },
    });

    return successResponse(res, routines);
  } catch (err) {
    next(err);
  }
}

// POST /patients/:id/routines
async function createRoutine(req, res, next) {
  try {
    const { id: patientId } = req.params;

    const allowed = await isLinkedOrSelf(req.user.id, patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    const data = routineSchema.parse(req.body);

    const routine = await prisma.routine.create({
      data: {
        patientId,
        createdById: req.user.id,
        ...data,
      },
    });

    return successResponse(res, routine, 'Routine created', 201);
  } catch (err) {
    next(err);
  }
}

// PATCH /routines/:id
async function updateRoutine(req, res, next) {
  try {
    const { id } = req.params;

    const routine = await prisma.routine.findUnique({ where: { id } });
    if (!routine) return errorResponse(res, 'Routine not found', 404);

    const allowed = await isLinkedOrSelf(req.user.id, routine.patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    const data = routineSchema.partial().parse(req.body);

    const updated = await prisma.routine.update({ where: { id }, data });

    return successResponse(res, updated, 'Routine updated');
  } catch (err) {
    next(err);
  }
}

// DELETE /routines/:id — soft delete (set isActive = false)
async function deleteRoutine(req, res, next) {
  try {
    const { id } = req.params;

    const routine = await prisma.routine.findUnique({ where: { id } });
    if (!routine) return errorResponse(res, 'Routine not found', 404);

    const allowed = await isLinkedOrSelf(req.user.id, routine.patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    await prisma.routine.update({ where: { id }, data: { isActive: false } });

    return successResponse(res, null, 'Routine deleted');
  } catch (err) {
    next(err);
  }
}

// POST /routines/:id/log — patient marks routine as completed/snoozed
async function logRoutine(req, res, next) {
  try {
    const { id: routineId } = req.params;
    const { status } = req.body; // COMPLETED | SNOOZED

    if (!['COMPLETED', 'SNOOZED'].includes(status)) {
      return errorResponse(res, 'status must be COMPLETED or SNOOZED', 400);
    }

    const routine = await prisma.routine.findUnique({ where: { id: routineId } });
    if (!routine) return errorResponse(res, 'Routine not found', 404);

    // Update the most recent PENDING log for this routine
    const pendingLog = await prisma.routineLog.findFirst({
      where: { routineId, status: 'PENDING' },
      orderBy: { scheduledTime: 'desc' },
    });

    if (pendingLog) {
      await prisma.routineLog.update({
        where: { id: pendingLog.id },
        data: { status, respondedAt: new Date() },
      });
    } else {
      // Create a new log if none exists (e.g., patient tapped manually)
      await prisma.routineLog.create({
        data: {
          routineId,
          scheduledTime: new Date(),
          status,
          respondedAt: new Date(),
        },
      });
    }

    // Activity log
    await prisma.activityLog.create({
      data: {
        patientId: routine.patientId,
        eventType: 'REMINDER',
        payload: JSON.stringify({ routineId, title: routine.title, status }),
      },
    });

    return successResponse(res, null, `Routine marked as ${status.toLowerCase()}`);
  } catch (err) {
    next(err);
  }
}

// GET /routines/:id/logs — get log history for a routine
async function getRoutineLogs(req, res, next) {
  try {
    const { id: routineId } = req.params;

    const routine = await prisma.routine.findUnique({ where: { id: routineId } });
    if (!routine) return errorResponse(res, 'Routine not found', 404);

    const allowed = await isLinkedOrSelf(req.user.id, routine.patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    const logs = await prisma.routineLog.findMany({
      where: { routineId },
      orderBy: { scheduledTime: 'desc' },
      take: 30, // last 30 entries
    });

    return successResponse(res, logs);
  } catch (err) {
    next(err);
  }
}

module.exports = { getRoutines, createRoutine, updateRoutine, deleteRoutine, logRoutine, getRoutineLogs };
