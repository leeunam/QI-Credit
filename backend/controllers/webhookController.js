const webhookHandler = require('../services/webhookHandler');

// Process QITech webhook
const processQitechWebhook = async (req, res) => {
  try {
    // Get the raw body for signature verification
    const rawBody = req.rawBody || JSON.stringify(req.body);
    
    // Extract event type and payload from request
    const eventType = req.headers['qitech-event-type'] || req.body.event_type || 'unknown';
    const payload = req.body;
    
    // Get signature for verification (QITech sends this in 'signature' header)
    const signature = req.headers['signature'] || req.headers['x-signature'] || req.body.signature;
    
    // Process the webhook
    const result = await webhookHandler.processWebhook(eventType, payload, rawBody);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in QITech webhook controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Process blockchain event webhook
const processBlockchainWebhook = async (req, res) => {
  try {
    // Extract event type and data from request
    const eventType = req.body.event_type;
    const eventData = req.body.data;
    
    // Process the blockchain event
    const result = await webhookHandler.processBlockchainEvent(eventType, eventData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in blockchain webhook controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  processQitechWebhook,
  processBlockchainWebhook
};