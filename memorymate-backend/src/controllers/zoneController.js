// src/controllers/zoneController.js
// CRUD for safe zones + zone event reporting (enter/exit)

const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');
const { isLinkedOrSelf } = require('./patientController');
const { sendPush } = require('../services/notifyService');
const { z } = require('zod');

const prisma = new PrismaClient();

const zoneSchema = z.object({
  name: z.string().min(1),
  centerLat: z.number(),
  centerLng: z.number(),
  radiusMeters: z.number().min(50).max(5000).default(200),
});

// GET /patients/:id/zones
async function getZones(req, res, next) {
  try {
    const { id: patientId } = req.params;

    const allowed = await isLinkedOrSelf(req.user.id, patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    const zones = await prisma.safeZone.findMany({
      where: { patientId, isActive: true },
    });

    return successResponse(res, zones);
  } catch (err) {
    next(err);
  }
}

// POST /patients/:id/zones
async function createZone(req, res, next) {
  try {
    const { id: patientId } = req.params;

    const allowed = await isLinkedOrSelf(req.user.id, patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    const data = zoneSchema.parse(req.body);

    const zone = await prisma.safeZone.create({
      data: {
        patientId,
        createdById: req.user.id,
        ...data,
      },
    });

    return successResponse(res, zone, 'Safe zone created', 201);
  } catch (err) {
    next(err);
  }
}

// PATCH /zones/:id
async function updateZone(req, res, next) {
  try {
    const { id } = req.params;

    const zone = await prisma.safeZone.findUnique({ where: { id } });
    if (!zone) return errorResponse(res, 'Zone not found', 404);

    const allowed = await isLinkedOrSelf(req.user.id, zone.patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    const data = zoneSchema.partial().parse(req.body);

    const updated = await prisma.safeZone.update({ where: { id }, data });

    return successResponse(res, updated, 'Zone updated');
  } catch (err) {
    next(err);
  }
}

// DELETE /zones/:id — soft delete
async function deleteZone(req, res, next) {
  try {
    const { id } = req.params;

    const zone = await prisma.safeZone.findUnique({ where: { id } });
    if (!zone) return errorResponse(res, 'Zone not found', 404);

    const allowed = await isLinkedOrSelf(req.user.id, zone.patientId);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    await prisma.safeZone.update({ where: { id }, data: { isActive: false } });

    return successResponse(res, null, 'Zone deleted');
  } catch (err) {
    next(err);
  }
}

// POST /zones/:id/event — app reports a zone enter or exit event
async function reportZoneEvent(req, res, next) {
  try {
    const { id: zoneId } = req.params;
    const { eventType, lat, lng } = req.body;

    if (!['ENTER', 'EXIT'].includes(eventType)) {
      return errorResponse(res, 'eventType must be ENTER or EXIT', 400);
    }

    const zone = await prisma.safeZone.findUnique({ where: { id: zoneId } });
    if (!zone) return errorResponse(res, 'Zone not found', 404);

    // Create zone event record
    await prisma.zoneEvent.create({
      data: {
        patientId: zone.patientId,
        zoneId,
        eventType,
        lat: lat ?? null,
        lng: lng ?? null,
      },
    });

    // Log to activity log
    await prisma.activityLog.create({
      data: {
        patientId: zone.patientId,
        eventType: 'ZONE_EVENT',
        payload: JSON.stringify({ zoneId, zoneName: zone.name, eventType, lat, lng }),
      },
    });

    // If patient EXITED a zone, notify all linked caregivers
    if (eventType === 'EXIT') {
      const links = await prisma.patientCaregiverLink.findMany({
        where: { patientId: zone.patientId, status: 'ACCEPTED' },
        include: { caregiver: true, patient: true },
      });

      for (const link of links) {
        // Save notification record
        await prisma.notification.create({
          data: {
            caregiverId: link.caregiverId,
            type: 'ZONE_EXIT',
            title: '🚨 Safe Zone Alert',
            message: `${link.patient.name} has left "${zone.name}"`,
          },
        });

        // Send push notification
        await sendPush(
          link.caregiver.fcmToken,
          '🚨 Safe Zone Alert',
          `${link.patient.name} has left the safe zone "${zone.name}"`,
          { type: 'ZONE_EXIT', zoneId, patientId: zone.patientId }
        );
      }
    }

    return successResponse(res, null, `Zone ${eventType.toLowerCase()} event recorded`);
  } catch (err) {
    next(err);
  }
}

module.exports = { getZones, createZone, updateZone, deleteZone, reportZoneEvent };
