const AppUser = require('../models/AppUser');
const Download = require('../models/Download');

/**
 * Get dashboard with users and stats
 */
const getDashboard = async (req, res) => {
  try {
    const search = req.query.search || '';
    
    // Build query
    const query = search 
      ? { email: { $regex: search, $options: 'i' } } 
      : {};
    
    // Get users
    const users = await AppUser.find(query)
      .sort({ created_at: -1 })
      .limit(100);
    
    // Get statistics
    const stats = {
      total: await AppUser.countDocuments({}),
      subscribed: await AppUser.countDocuments({ is_subscribed: true }),
      basic: await AppUser.countDocuments({ tier: 'basic' }),
      pro: await AppUser.countDocuments({ tier: 'pro' }),
      none: await AppUser.countDocuments({ tier: 'none' }),
      downloads: await Download.countDocuments({})
    };
    
    res.render('dashboard', {
      users: users.map(u => ({
        _id: u._id.toString(),
        email: u.email || 'N/A',
        tier: u.tier || 'none',
        is_subscribed: u.is_subscribed || false,
        expiry_date: u.expiry_date || null,
        created_at: u.created_at || null,
        expo_tokens: (u.expo_tokens || []).length,
        fcm_tokens: (u.fcm_tokens || []).length
      })),
      stats,
      admin: req.session.admin,
      search
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('error', { error: 'Failed to load users' });
  }
};

/**
 * Get users API endpoint
 */
const getUsersAPI = async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search 
      ? { email: { $regex: search, $options: 'i' } } 
      : {};
    
    const users = await AppUser.find(query)
      .sort({ created_at: -1 })
      .limit(100);
    
    res.json(users.map(u => ({
      _id: u._id.toString(),
      email: u.email || 'N/A',
      tier: u.tier || 'none',
      is_subscribed: u.is_subscribed || false,
      expiry_date: u.expiry_date || null,
      created_at: u.created_at || null
    })));
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

module.exports = {
  getDashboard,
  getUsersAPI
};

