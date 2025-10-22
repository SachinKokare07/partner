import express from 'express';
import { sendOTPEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * POST /api/otp/send
 * Send OTP to user's email
 */
router.post('/send', async (req, res) => {
  try {
    const { email, otp, name } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits',
      });
    }

    // Send OTP email
    const result = await sendOTPEmail(email, otp, name);

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP email. Please try again.',
      error: error.message,
    });
  }
});

export default router;
