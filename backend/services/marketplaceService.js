const { MarketplaceOffer, User, Loan } = require('../../database/models/indexModel');
const db = require('../config/database');

class MarketplaceService {
  async createOffer(investorId, offerData) {
    const userData = await db('users').where('id', investorId).first();
    if (!userData) throw new Error('Investor not found');
    
    const investor = new User(userData);
    if (!investor.canInvest()) {
      throw new Error('User is not eligible to invest');
    }
    
    const offer = new MarketplaceOffer({
      investor_id: investorId,
      ...offerData
    });
    
    const validation = offer.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid offer: ${validation.errors.join(', ')}`);
    }
    
    await db('marketplace_offers').insert(offer.toDatabase());
    
    return offer;
  }
  
  async matchOffer(offerId, loanRequestData) {
    const offerData = await db('marketplace_offers').where('id', offerId).first();
    if (!offerData) throw new Error('Offer not found');
    
    const offer = new MarketplaceOffer(offerData);
    
    if (!offer.canMatch(loanRequestData)) {
      throw new Error('Offer cannot match this loan request');
    }
    
    const loan = new Loan({
      borrower_id: loanRequestData.borrower_id,
      marketplace_offer_id: offerId,
      amount: loanRequestData.amount,
      rate: offer.rate,
      term_days: offer.term_days,
      status: 'PENDING'
    });
    
    offer.markAsMatched();
    
    await db.transaction(async (trx) => {
      await trx('marketplace_offers')
        .where('id', offerId)
        .update(offer.toDatabase());
      
      await trx('loan_contracts').insert(loan.toDatabase());
    });
    
    return { offer, loan };
  }
}

module.exports = new MarketplaceService();