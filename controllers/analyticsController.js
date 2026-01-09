const AppUser = require('../models/AppUser');
const mongoose = require('mongoose');

/**
 * Get user growth statistics (daily, weekly, monthly)
 */
const getUserGrowthStats = async (req, res) => {
  try {
    const now = new Date();
    const days = [];
    const weeks = [];
    const months = [];

    // Daily data (last 30 days)
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const count = await AppUser.countDocuments({
        created_at: { $gte: start, $lt: end }
      });

      days.push({
        date: start.toISOString().split('T')[0],
        count
      });
    }

    // Weekly data (last 12 weeks)
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7));
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
      const end = new Date(start);
      end.setDate(end.getDate() + 7);

      const count = await AppUser.countDocuments({
        created_at: { $gte: start, $lt: end }
      });

      weeks.push({
        week: `Week ${12 - i}`,
        start: start.toISOString().split('T')[0],
        count
      });
    }

    // Monthly data (last 12 months)
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

      const count = await AppUser.countDocuments({
        created_at: { $gte: start, $lt: end }
      });

      months.push({
        month: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count
      });
    }

    res.json({ days, weeks, months });
  } catch (error) {
    console.error('User growth stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user growth stats' });
  }
};

/**
 * Get tier distribution (Basic vs Pro)
 */
const getTierDistribution = async (req, res) => {
  try {
    const basic = await AppUser.countDocuments({ tier: 'basic', is_subscribed: true });
    const pro = await AppUser.countDocuments({ tier: 'pro', is_subscribed: true });
    const none = await AppUser.countDocuments({ tier: 'none' });

    res.json({ basic, pro, none });
  } catch (error) {
    console.error('Tier distribution error:', error);
    res.status(500).json({ error: 'Failed to fetch tier distribution' });
  }
};

/**
 * Get revenue statistics
 */
const getRevenueStats = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const payments = db.collection('payments');
    
    // Get all successful payments
    const allPayments = await payments.find({ 
      status: { $in: ['success', 'approved'] } 
    }).toArray();
    
    const total = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const todayRevenue = allPayments
      .filter(p => p.created_at && new Date(p.created_at) >= today)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const weekRevenue = allPayments
      .filter(p => p.created_at && new Date(p.created_at) >= weekAgo)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const monthRevenue = allPayments
      .filter(p => p.created_at && new Date(p.created_at) >= monthAgo)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    res.json({
      total,
      today: todayRevenue,
      week: weekRevenue,
      month: monthRevenue,
      count: allPayments.length
    });
  } catch (error) {
    console.error('Revenue stats error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue stats' });
  }
};

/**
 * Get expired subscriptions count
 */
const getExpiredStats = async (req, res) => {
  try {
    const now = new Date();
    
    // Count all users with expiry_date in the past (regardless of is_subscribed status)
    // This catches expired subscriptions even if backend already updated is_subscribed to false
    const expired = await AppUser.countDocuments({
      expiry_date: { $exists: true, $ne: null, $lt: now }
    });
    
    // Also count users with tier 'none' or is_subscribed false (for inactive users without expiry_date)
    const inactive = await AppUser.countDocuments({
      $or: [
        { tier: 'none' },
        { is_subscribed: false }
      ]
    });
    
    res.json({
      count: expired,
      inactive
    });
  } catch (error) {
    console.error('Expired stats error:', error);
    res.status(500).json({ error: 'Failed to fetch expired stats' });
  }
};

/**
 * Get linked Discord accounts statistics
 */
const getLinkedAccountsStats = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const discordLinks = db.collection('discord_links');
    
    const total = await discordLinks.countDocuments({});
    const uniqueUsers = await discordLinks.distinct('app_user_id');
    
    res.json({
      total,
      uniqueUsers: uniqueUsers.length
    });
  } catch (error) {
    console.error('Linked accounts stats error:', error);
    res.status(500).json({ error: 'Failed to fetch linked accounts stats' });
  }
};

/**
 * Get comprehensive dashboard stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const monthFromNow = new Date(today);
    monthFromNow.setMonth(monthFromNow.getMonth() + 1);

    // User stats
    const newUsersToday = await AppUser.countDocuments({
      created_at: { $gte: today }
    });
    const newUsersWeek = await AppUser.countDocuments({
      created_at: { $gte: weekAgo }
    });
    const newUsersMonth = await AppUser.countDocuments({
      created_at: { $gte: monthAgo }
    });
    const activeUsers = await AppUser.countDocuments({
      is_subscribed: true,
      expiry_date: { $gte: now }
    });

    // Expiring soon (within 7 days)
    const expiringSoon = await AppUser.countDocuments({
      is_subscribed: true,
      expiry_date: { $gte: now, $lte: weekFromNow }
    });

    // Payment stats
    const db = mongoose.connection.db;
    const payments = db.collection('payments');
    const allPayments = await payments.find({
      status: { $in: ['success', 'approved'] }
    }).toArray();

    const paymentsToday = allPayments.filter(p => {
      if (!p.created_at) return false;
      const paymentDate = new Date(p.created_at);
      return paymentDate >= today;
    }).length;

    const paymentsWeek = allPayments.filter(p => {
      if (!p.created_at) return false;
      const paymentDate = new Date(p.created_at);
      return paymentDate >= weekAgo;
    }).length;

    const paymentsMonth = allPayments.filter(p => {
      if (!p.created_at) return false;
      const paymentDate = new Date(p.created_at);
      return paymentDate >= monthAgo;
    }).length;

    const revenueToday = allPayments
      .filter(p => p.created_at && new Date(p.created_at) >= today)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const revenueWeek = allPayments
      .filter(p => p.created_at && new Date(p.created_at) >= weekAgo)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const revenueMonth = allPayments
      .filter(p => p.created_at && new Date(p.created_at) >= monthAgo)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Push token stats
    const usersWithTokens = await AppUser.find({
      $or: [
        { expo_tokens: { $exists: true, $ne: [] } },
        { fcm_tokens: { $exists: true, $ne: [] } }
      ]
    });
    const totalPushTokens = usersWithTokens.reduce((sum, u) => {
      return sum + (u.expo_tokens?.length || 0) + (u.fcm_tokens?.length || 0);
    }, 0);

    res.json({
      users: {
        newToday: newUsersToday,
        newWeek: newUsersWeek,
        newMonth: newUsersMonth,
        active: activeUsers,
        expiringSoon
      },
      payments: {
        today: paymentsToday,
        week: paymentsWeek,
        month: paymentsMonth,
        revenueToday,
        revenueWeek,
        revenueMonth
      },
      pushTokens: {
        usersWithTokens: usersWithTokens.length,
        totalTokens: totalPushTokens
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

/**
 * Get revenue chart data
 */
const getRevenueChart = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const payments = db.collection('payments');
    const allPayments = await payments.find({
      status: { $in: ['success', 'approved'] }
    }).toArray();

    const now = new Date();
    const days = [];
    
    // Last 30 days revenue
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const dayRevenue = allPayments
        .filter(p => {
          if (!p.created_at) return false;
          const paymentDate = new Date(p.created_at);
          return paymentDate >= start && paymentDate < end;
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      days.push({
        date: start.toISOString().split('T')[0],
        revenue: dayRevenue
      });
    }

    res.json({ days });
  } catch (error) {
    console.error('Revenue chart error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue chart data' });
  }
};

module.exports = {
  getUserGrowthStats,
  getTierDistribution,
  getRevenueStats,
  getExpiredStats,
  getLinkedAccountsStats,
  getDashboardStats,
  getRevenueChart
};

