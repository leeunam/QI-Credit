// Onboarding API routes
const express = require('express');
const router = express.Router();
const onboardingController = require('./controllers/onboardingController');

// Register a new user
router.post('/register', onboardingController.registerUser);

// Verify user identity
router.post('/verify', onboardingController.verifyIdentity);

// Complete onboarding process
router.post('/complete', onboardingController.completeOnboarding);

// Get onboarding status
router.get('/status/:userId', onboardingController.getOnboardingStatus);

module.exports = router;