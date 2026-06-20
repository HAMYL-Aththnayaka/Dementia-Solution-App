// src/controllers/activityController.js
// Read activity logs for a patient

const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');
const { isLinkedOrSelf } = require('./patientController');

const prisma = new PrismaClient();

// GET /patients/:id/activity
// Query params: ?limit=50&eventType=RECOGNITION
async function getActivityLog(req, res, next) {
  try {
    const { id: patientId } = req.params;
    const { limit = 50, eventType } = req.query;

    const allowed = await isLinkedOrSelf(req.user.id, patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    const where = { patientId };
    if (eventType) where.eventType = eventType;

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: Math.min(parseInt(limit, 10) || 50, 200), // cap at 200
    });

    // Parse payload JSON for easier consumption by the client
    const parsed = logs.map((log) => ({
      ...log,
      payload: (() => {
        try { return JSON.parse(log.payload); } catch { return log.payload; }
      })(),
    }));

    return successResponse(res, parsed);
  } catch (err) {
    next(err);
  }
}

module.exports = { getActivityLog };
