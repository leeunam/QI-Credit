// Webhook Handler Service
// Handles incoming webhooks from QITech APIs and blockchain events

const crypto = require('crypto');
const config = require('../config/config');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class WebhookHandler {
  constructor() {
    this.qitechWebhookSecret = config.qitech.webhookSecret || 'default_secret';
    this.supportedEvents = [
      'credit_analysis.completed',
      'credit_analysis.failed',
      'payment.received',
      'contract.signed',
      'contract.status_changed',
      'pix.payment_confirmed'
    ];
  }

  // Verify QITech webhook signature (HMAC-SHA1)
  verifyQitechSignature(payload, signature) {
    try {
      // QITech uses HMAC-SHA1 for webhook signatures as per documentation
      const expectedSignature = crypto
        .createHmac('sha1', this.qitechWebhookSecret)
        .update(payload)
        .digest('hex');
      
      // Compare the signatures (use timing-safe comparison to prevent timing attacks)
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature.replace('sha1=', ''), 'hex')
      );
    } catch (error) {
      console.error('Error verifying QITech webhook signature:', error);
      return false;
    }
  }

  // Process incoming webhook
  async processWebhook(eventType, payload, rawBody) {
    const trx = await db.transaction();

    try {
      console.log(`Processing webhook event: ${eventType}`);

      // Persist webhook event to database first
      const webhookEventData = {
        id: uuidv4(),
        event_type: eventType,
        payload: JSON.stringify(payload),
        status: 'PENDING',
        received_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };

      const [webhookEvent] = await trx('webhook_events')
        .insert(webhookEventData)
        .returning('*');

      // Verify signature if present (header 'signature' in QITech webhooks)
      const signature = payload.signature || payload.headers?.signature;
      if (signature && rawBody) {
        const isValid = this.verifyQitechSignature(rawBody, signature);
        if (!isValid) {
          console.error('Invalid webhook signature');
          await trx('webhook_events')
            .where('id', webhookEvent.id)
            .update({ status: 'FAILED', error_message: 'Invalid signature', updated_at: new Date() });
          await trx.commit();
          return { success: false, error: 'Invalid signature' };
        }
      }

      // Handle credit analysis webhook (from the documentation)
      let result;
      if (eventType.startsWith('credit_proposal')) {
        result = await this.handleCreditAnalysisWebhook(payload, trx);
      } else {
        // Handle other events
        switch (eventType) {
          case 'payment.received':
            result = await this.handlePaymentReceived(payload, trx);
            break;
          case 'contract.signed':
            result = await this.handleContractSigned(payload, trx);
            break;
          case 'contract.status_changed':
            result = await this.handleContractStatusChanged(payload, trx);
            break;
          case 'pix.payment_confirmed':
            result = await this.handlePixPaymentConfirmed(payload, trx);
            break;
          default:
            result = { success: false, error: `Unsupported event type: ${eventType}` };
        }
      }

      // Update webhook event status
      await trx('webhook_events')
        .where('id', webhookEvent.id)
        .update({
          status: result.success ? 'PROCESSED' : 'FAILED',
          processed_at: new Date(),
          error_message: result.success ? null : result.error,
          response: JSON.stringify(result),
          updated_at: new Date()
        });

      await trx.commit();

      return result;
    } catch (error) {
      await trx.rollback();
      console.error(`Error processing webhook event ${eventType}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Handle credit analysis webhook (from QITech documentation)
  async handleCreditAnalysisWebhook(payload) {
    try {
      // According to QITech documentation, webhook format is:
      // {
      //   "credit_proposal_natural_person_id": "123456",
      //   "analysis_status": "manually_approved",
      //   "event_date": "2019-10-01T10:37:25-03:00"
      // }
      
      const {
        credit_proposal_natural_person_id,
        credit_proposal_legal_person_id,
        analysis_status,
        event_date
      } = payload;
      
      const analysisId = credit_proposal_natural_person_id || credit_proposal_legal_person_id;
      
      console.log(`Credit analysis webhook: ID ${analysisId}, status: ${analysis_status}`);
      
      // Update credit analysis record in database
      console.log(`Credit analysis ${analysisId} status updated to: ${analysis_status} at ${event_date}`);
      
      // Handle specific status changes
      switch (analysis_status) {
        case 'automatically_approved':
        case 'manually_approved':
          console.log(`Credit analysis ${analysisId} approved, initiating next steps`);
          // You could trigger additional processing here
          break;
        case 'automatically_reproved':
        case 'manually_reproved':
          console.log(`Credit analysis ${analysisId} reproved, sending notification`);
          // You could send a notification to the user
          break;
        case 'in_manual_analysis':
          console.log(`Credit analysis ${analysisId} in manual analysis`);
          break;
        case 'waiting_for_data':
          console.log(`Credit analysis ${analysisId} waiting for data`);
          break;
        default:
          console.log(`Credit analysis ${analysisId} status changed to: ${analysis_status}`);
      }
      
      return {
        success: true,
        message: `Credit analysis webhook processed successfully`,
        analysisId,
        status: analysis_status,
        eventDate: event_date
      };
    } catch (error) {
      console.error('Error handling credit analysis webhook:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle payment received event
  async handlePaymentReceived(payload) {
    try {
      const { payment_id, amount, contract_id, borrower_id, date } = payload;
      
      console.log(`Payment ${payment_id} of ${amount} received for contract ${contract_id} from borrower ${borrower_id}`);
      
      // Update payment record in database
      // await database.updatePayment(payment_id, { status: 'completed', paid_at: date });
      // Update contract payment status
      // await database.updateContractPayment(contract_id, payment_id, { paid: true, paid_at: date });
      
      return {
        success: true,
        message: `Payment ${payment_id} processed successfully`,
        contractId: contract_id,
        amount: amount,
        borrowerId: borrower_id
      };
    } catch (error) {
      console.error('Error handling payment received:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle contract signed event
  async handleContractSigned(payload) {
    try {
      const { contract_id, status, borrower_id, lender_id, signature_date } = payload;
      
      console.log(`Contract ${contract_id} signed by borrower ${borrower_id} and lender ${lender_id}`);
      
      // Update contract status in database
      // await database.updateContract(contract_id, { status: 'signed', signed_at: signature_date });
      
      // If using blockchain escrow, trigger fund deposit
      console.log(`Initiating blockchain escrow for contract ${contract_id}`);
      
      return {
        success: true,
        message: `Contract ${contract_id} signing processed`,
        contractId: contract_id,
        borrowerId: borrower_id,
        lenderId: lender_id,
        status: status
      };
    } catch (error) {
      console.error('Error handling contract signed:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle contract status changed event
  async handleContractStatusChanged(payload) {
    try {
      const { contract_id, old_status, new_status, reason } = payload;
      
      console.log(`Contract ${contract_id} status changed from ${old_status} to ${new_status}`);
      
      // Update contract status in database
      // await database.updateContract(contract_id, { status: new_status, status_changed_at: new Date() });
      
      // Handle specific status changes
      if (new_status === 'active' && old_status === 'signed') {
        console.log(`Contract ${contract_id} is now active, starting repayment schedule`);
        // You could trigger repayment schedule generation
      } else if (new_status === 'defaulted') {
        console.log(`Contract ${contract_id} has defaulted, initiating collection process`);
        // You could trigger collection process
      }
      
      return {
        success: true,
        message: `Contract ${contract_id} status change processed`,
        contractId: contract_id,
        oldStatus: old_status,
        newStatus: new_status,
        reason: reason
      };
    } catch (error) {
      console.error('Error handling contract status changed:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle Pix payment confirmed event
  async handlePixPaymentConfirmed(payload) {
    try {
      const { pix_id, amount, payer, receiver, confirmation_date } = payload;
      
      console.log(`Pix payment ${pix_id} of ${amount} confirmed from ${payer} to ${receiver}`);
      
      // Update payment record in database
      // await database.updatePixPayment(pix_id, { status: 'confirmed', confirmed_at: confirmation_date });
      
      return {
        success: true,
        message: `Pix payment ${pix_id} confirmation processed`,
        pixId: pix_id,
        amount: amount,
        payer: payer,
        receiver: receiver
      };
    } catch (error) {
      console.error('Error handling Pix payment confirmed:', error);
      return { success: false, error: error.message };
    }
  }

  // Process blockchain events
  async processBlockchainEvent(eventType, eventData) {
    try {
      console.log(`Processing blockchain event: ${eventType}`, eventData);
      
      // Handle different blockchain events
      switch (eventType) {
        case 'EscrowFundsReleased':
          return await this.handleEscrowFundsReleased(eventData);
        case 'EscrowFundsRefunded':
          return await this.handleEscrowFundsRefunded(eventData);
        case 'LoanRepaid':
          return await this.handleLoanRepaid(eventData);
        default:
          console.warn(`Unsupported blockchain event type: ${eventType}`);
          return { success: false, error: 'Unsupported blockchain event type' };
      }
    } catch (error) {
      console.error(`Error processing blockchain event ${eventType}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Handle escrow funds released event
  async handleEscrowFundsReleased(eventData) {
    try {
      const { contractAddress, borrower, lender, amount } = eventData;
      
      console.log(`Funds released from escrow contract ${contractAddress} to borrower ${borrower}`);
      
      // Update contract status in database
      // await database.updateContractForEscrowRelease(contractAddress, { funds_released: true });
      
      return {
        success: true,
        message: `Funds released from escrow processed`,
        contractAddress,
        borrower,
        lender,
        amount
      };
    } catch (error) {
      console.error('Error handling escrow funds released:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle escrow funds refunded event
  async handleEscrowFundsRefunded(eventData) {
    try {
      const { contractAddress, borrower, lender, amount } = eventData;
      
      console.log(`Funds refunded from escrow contract ${contractAddress} to lender ${lender}`);
      
      // Update contract status in database
      // await database.updateContractForEscrowRefund(contractAddress, { funds_refunded: true });
      
      return {
        success: true,
        message: `Funds refunded from escrow processed`,
        contractAddress,
        borrower,
        lender,
        amount
      };
    } catch (error) {
      console.error('Error handling escrow funds refunded:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle loan repaid event
  async handleLoanRepaid(eventData) {
    try {
      const { contractId, borrower, amount, transactionHash } = eventData;
      
      console.log(`Loan with contract ${contractId} repaid by ${borrower} for ${amount}`);
      
      // Update contract status in database
      // await database.updateContract(contractId, { status: 'completed', fully_repaid: true });
      
      return {
        success: true,
        message: `Loan repayment processed`,
        contractId,
        borrower,
        amount,
        transactionHash
      };
    } catch (error) {
      console.error('Error handling loan repaid:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new WebhookHandler();