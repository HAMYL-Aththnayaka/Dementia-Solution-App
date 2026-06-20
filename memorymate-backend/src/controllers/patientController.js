// src/controllers/patientController.js
// Get patient info and their linked caregivers

const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');

const prisma = new PrismaClient();

// Helper: check that the requesting user is linked to the patient (or IS the patient)
async function isLinkedOrSelf(requestingUserId, patientId) {
  if (requestingUserId === patientId) return true;

  const link = await prisma.patientCaregiverLink.findFirst({
    where: {
      patientId,
      caregiverId: requestingUserId,
      status: 'ACCEPTED',
    },
  });

  return !!link;
}

// GET /patients/:id — get patient profile
async function getPatient(req, res, next) {
  try {
    const { id } = req.params;

    const allowed = await isLinkedOrSelf(req.user.id, id);
    if (!allowed) return errorResponse(res, 'Not authorized to view this patient', 403);

    const patient = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        inviteCode: true,
        createdAt: true,
      },
    });

    if (!patient || patient.role !== 'PATIENT') {
      return errorResponse(res, 'Patient not found', 404);
    }

    return successResponse(res, patient);
  } catch (err) {
    next(err);
  }
}

// GET /patients/:id/caregivers — list all accepted caregivers for a patient
async function getPatientCaregivers(req, res, next) {
  try {
    const { id } = req.params;

    const allowed = await isLinkedOrSelf(req.user.id, id);
    if (!allowed) return errorResponse(res, 'Not authorized', 403);

    const links = await prisma.patientCaregiverLink.findMany({
      where: { patientId: id, status: 'ACCEPTED' },
      include: {
        caregiver: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const caregivers = links.map((l) => ({
      linkId: l.id,
      relationship: l.relationship,
      caregiver: l.caregiver,
    }));

    return successResponse(res, caregivers);
  } catch (err) {
    next(err);
  }
}

// Export the helper too — used by other controllers
module.exports = { getPatient, getPatientCaregivers, isLinkedOrSelf };
