const AppUser = require('../models/AppUser');

/**
 * Get user edit page
 */
const getUserEdit = async (req, res) => {
  try {
    const user = await AppUser.findById(req.params.id);
    
    if (!user) {
      return res.status(404).render('error', { error: 'User not found' });
    }
    
    res.render('user-edit', {
      user: {
        _id: user._id.toString(),
        email: user.email || '',
        tier: user.tier || 'none',
        is_subscribed: user.is_subscribed || false,
        expiry_date: user.expiry_date 
          ? new Date(user.expiry_date).toISOString().split('T')[0] 
          : '',
        created_at: user.created_at || null,
        expo_tokens: user.expo_tokens || [],
        fcm_tokens: user.fcm_tokens || []
      },
      admin: req.session.admin
    });
  } catch (error) {
    console.error('User edit error:', error);
    res.render('error', { error: 'Failed to load user' });
  }
};

/**
 * Update user
 */
const updateUser = async (req, res) => {
  try {
    const { email, tier, is_subscribed, expiry_date } = req.body;
    
    const updateData = {
      email: email.trim(),
      tier: tier || 'none',
      is_subscribed: is_subscribed === 'true' || is_subscribed === true,
    };
    
    // Handle expiry date
    if (expiry_date) {
      updateData.expiry_date = new Date(expiry_date);
    } else if (is_subscribed === 'false' || is_subscribed === false) {
      updateData.expiry_date = null;
    }
    
    await AppUser.findByIdAndUpdate(req.params.id, { $set: updateData });
    
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.json({ success: false, message: 'Failed to update user' });
  }
};

module.exports = {
  getUserEdit,
  updateUser
};

