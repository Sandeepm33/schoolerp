const { Notification } = require('../models/saasModels');

// GET ALL NOTIFICATIONS
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch notifications' });
  }
};

// MARK SINGLE NOTIFICATION AS READ
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    const unreadCount = await Notification.countDocuments({ read: false });
    res.json({ message: 'Notification marked as read', notification, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update notification' });
  }
};

// MARK ALL NOTIFICATIONS AS READ
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json({ message: 'All notifications marked as read', notifications, unreadCount: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to mark notifications as read' });
  }
};

// DELETE / CLEAR ALL NOTIFICATIONS
const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: 'Notifications cleared', notifications: [], unreadCount: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to clear notifications' });
  }
};

// INTERNAL HELPER & API TO CREATE NOTIFICATION
const createNotificationHelper = async ({ title, message, type = 'SYSTEM', link = '', targetRole = 'ALL' }) => {
  try {
    const notification = new Notification({
      title,
      message,
      type,
      link,
      read: false,
      targetRole,
      createdAt: new Date()
    });
    await notification.save();
    return notification;
  } catch (e) {
    console.error('Error creating notification helper:', e.message);
    return null;
  }
};

const createNotification = async (req, res) => {
  try {
    const { title, message, type, link, targetRole } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    const notification = await createNotificationHelper({ title, message, type, link, targetRole });
    res.status(201).json({ message: 'Notification created', notification });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create notification' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  createNotification,
  createNotificationHelper
};
