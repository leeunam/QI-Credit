const { MarketplaceOffer, User } = require('../../database/models/indexModel');
const db = require('../config/database');

const createOffer = async (req, res) => {
  try {
    const { investor_id, amount, rate, term_days, risk_profile } = req.body;
    
    // Validar oferta usando model
    const offer = new MarketplaceOffer({
      investor_id,
      amount,
      rate,
      term_days,
      risk_profile
    });
    
    const validation = offer.validate();
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Offer validation failed',
        details: validation.errors
      });
    }
    
    // Verificar se investidor existe
    const investor = await db('users').where('id', investor_id).first();
    if (!investor) {
      return res.status(404).json({
        success: false,
        error: 'Investor not found'
      });
    }
    
    const user = new User(investor);
    if (!user.canInvest()) {
      return res.status(400).json({
        success: false,
        error: 'User is not eligible to invest'
      });
    }
    
    // Salvar oferta
    const [savedOffer] = await db('marketplace_offers')
      .insert(offer.toDatabase())
      .returning('*');
    
    const createdOffer = new MarketplaceOffer(savedOffer);
    
    res.status(201).json({
      success: true,
      data: {
        ...createdOffer.toJSON(),
        totalReturn: createdOffer.getTotalReturn(),
        interestAmount: createdOffer.getInterestAmount()
      }
    });
  } catch (error) {
    console.error('Error creating marketplace offer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getActiveOffers = async (req, res) => {
  try {
    const { risk_profile, min_amount, max_rate } = req.query;
    
    let query = db('marketplace_offers').where('status', 'OPEN');
    
    if (risk_profile) {
      query = query.where('risk_profile', risk_profile);
    }
    
    if (min_amount) {
      query = query.where('amount', '>=', parseFloat(min_amount));
    }
    
    if (max_rate) {
      query = query.where('rate', '<=', parseFloat(max_rate));
    }
    
    const offersData = await query.select('*').orderBy('rate', 'asc');
    
    const enrichedOffers = offersData.map(offerData => {
      const offer = new MarketplaceOffer(offerData);
      return {
        ...offer.toJSON(),
        totalReturn: offer.getTotalReturn(),
        interestAmount: offer.getInterestAmount(),
        isActive: offer.isActive()
      };
    });
    
    res.json({
      success: true,
      data: enrichedOffers,
      count: enrichedOffers.length
    });
  } catch (error) {
    console.error('Error getting active offers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createOffer,
  getActiveOffers
};