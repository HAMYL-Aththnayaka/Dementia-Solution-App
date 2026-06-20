// src/controllers/notificationController.js
// Get and mark-read notifications for a caregiver

const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');

const prisma = new PrismaClient();

// GET /caregivers/:id/notifications
async function getNotifications(req, res, next) {
  try {
    const { id: caregiverId } = req.params;

    // Caregivers can only see their own notifications
    if (req.user.id !== caregiverId) {
      return errorResponse(res, 'Not authorized', 403);
    }

    const notifications = await prisma.notification.findMany({
      where: { caregiverId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return successResponse(res, notifications);
  } catch (err) {
    next(err);
  }
}

// PATCH /notifications/:id/read
async function markRead(req, res, next) {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return errorResponse(res, 'Notification not found', 404);

    if (notification.caregiverId !== req.user.id) {
      return errorResponse(res, 'Not authorized', 403);
    }

    await prisma.notification.update({ where: { id }, data: { isRead: true } });

    return successResponse(res, null, 'Marked as read');
  } catch (err) {
    next(err);
  }
}

// PATCH /caregivers/:id/notifications/read-all
async function markAllRead(req, res, next) {
  try {
    const { id: caregiverId } = req.params;

    if (req.user.id !== caregiverId) {
      return errorResponse(res, 'Not authorized', 403);
    }

    await prisma.notification.updateMany({
      where: { caregiverId, isRead: false },
      data: { isRead: true },
    });

    return successResponse(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markRead, markAllRead };
