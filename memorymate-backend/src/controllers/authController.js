// src/controllers/authController.js
// Handles register, login, invite code generation, and patient-caregiver linking

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { signToken } = require('../services/tokenService');
const { generateInviteCode } = require('../utils/inviteCode');
const { successResponse, errorResponse } = require('../utils/response');
const { z } = require('zod');

const prisma = new PrismaClient();

// ─── Validation Schemas ───────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['PATIENT', 'CAREGIVER']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const linkSchema = z.object({
  inviteCode: z.string().length(6),
  relationship: z.string().optional(),
});

// ─── Handlers ─────────────────────────────────────────────────────────────────

// POST /auth/register
async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);

    // Check email not already taken
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return errorResponse(res, 'Email already registered', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // For patients: generate an invite code so caregivers can link to them
    const inviteCode = data.role === 'PATIENT' ? generateInviteCode() : undefined;

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        inviteCode,
      },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          inviteCode: user.inviteCode,
        },
      },
      'Registered successfully',
      201
    );
  } catch (err) {
    next(err);
  }
}

// POST /auth/login
async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return successResponse(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        inviteCode: user.inviteCode,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /auth/me  — return current user info
async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, inviteCode: true, createdAt: true },
    });

    if (!user) return errorResponse(res, 'User not found', 404);

    return successResponse(res, user);
  } catch (err) {
    next(err);
  }
}

// POST /auth/link-patient — caregiver provides patient's invite code
async function linkPatient(req, res, next) {
  try {
    const data = linkSchema.parse(req.body);

    // Find patient by invite code
    const patient = await prisma.user.findUnique({
      where: { inviteCode: data.inviteCode },
    });

    if (!patient) {
      return errorResponse(res, 'Invalid invite code', 404);
    }

    if (patient.role !== 'PATIENT') {
      return errorResponse(res, 'This invite code does not belong to a patient', 400);
    }

    if (patient.id === req.user.id) {
      return errorResponse(res, 'You cannot link to yourself', 400);
    }

    // Check if already linked
    const existingLink = await prisma.patientCaregiverLink.findUnique({
      where: {
        patientId_caregiverId: {
          patientId: patient.id,
          caregiverId: req.user.id,
        },
      },
    });

    if (existingLink) {
      return errorResponse(res, 'You are already linked to this patient', 409);
    }

    // Create the link (auto-accept for simplicity — can add approval flow later)
    const link = await prisma.patientCaregiverLink.create({
      data: {
        patientId: patient.id,
        caregiverId: req.user.id,
        relationship: data.relationship,
        status: 'ACCEPTED',
      },
    });

    return successResponse(
      res,
      {
        linkId: link.id,
        patient: { id: patient.id, name: patient.name, email: patient.email },
        status: link.status,
      },
      'Successfully linked to patient',
      201
    );
  } catch (err) {
    next(err);
  }
}

// PATCH /auth/fcm-token — update the device FCM token
async function updateFcmToken(req, res, next) {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) return errorResponse(res, 'fcmToken is required', 400);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { fcmToken },
    });

    return successResponse(res, null, 'FCM token updated');
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, linkPatient, updateFcmToken };
