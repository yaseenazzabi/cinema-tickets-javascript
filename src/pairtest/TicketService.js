import TicketTypeRequest from './lib/TicketTypeRequest.js';
import { InvalidPurchaseException } from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
import constants from './lib/constants.js';

export default class TicketService {
    ADULT_TICKET_PRICE = 20
    CHILD_TICKET_PRICE = 10
    INFANT_TICKET_PRICE = 0
    MAX_TICKETS = 20
    ticketPaymentService = new TicketPaymentService()
    seatReservationService = new SeatReservationService()

    setMaxTickets(max) {
        this.MAX_TICKETS = max
    }

    validateAccountId(accountId) {
        try {
            return parseInt(accountId) > 0
        }
        catch (e) {
            return false
        }
    }

    validateTicketTypeRequests(ticketTypeRequests) {
        if(!Array.isArray(ticketTypeRequests)) {
            return false
        }
        for(let i = 0; i < ticketTypeRequests.length; i++) {
            if(!(ticketTypeRequests[i] instanceof TicketTypeRequest)) {
                return false
            }
        }
        return true
    }

    validateTicketCount(ticketsToBuy) {
        return ticketsToBuy <= this.MAX_TICKETS
    }

    validateChildrenAndInfants(ticketData) {
        const { 
            [constants.ADULT_TICKET_FIELDNAME]: adults, 
            [constants.CHILD_TICKET_FIELDNAME]: children, 
            [constants.INFANT_TICKET_FIELDNAME]: infants 
        } = ticketData

        if(((children > 0) || (infants > 0)) && adults === 0) {
            return false
        }
        return true
    }
    
    computeTicketsToBuy(ticketData) {
        const { 
            [constants.ADULT_TICKET_FIELDNAME]: adults, 
            [constants.CHILD_TICKET_FIELDNAME]: children, 
            [constants.INFANT_TICKET_FIELDNAME]: infants 
        } = ticketData
        return ((adults || 0) + (children || 0) + (infants || 0))
    }

    computePriceData(ticketData) {
        const { 
            [constants.ADULT_TICKET_FIELDNAME]: adults, 
            [constants.CHILD_TICKET_FIELDNAME]: children, 
            [constants.INFANT_TICKET_FIELDNAME]: infants 
        } = ticketData
        return (((adults || 0) * this.ADULT_TICKET_PRICE) + ((children || 0) * this.CHILD_TICKET_PRICE) + ((infants || 0) * this.INFANT_TICKET_PRICE))
    }

    purchaseTickets(accountId, ticketTypeRequests) {
        if(!this.validateAccountId(accountId)) {
            throw (new InvalidPurchaseException(400, 'Account ID is invalid', [accountId]))
        }

        if(!this.validateTicketTypeRequests(ticketTypeRequests)) {
            throw (new InvalidPurchaseException(400, 'ticketTypeRequests received are invalid', [ticketTypeRequests]))
        }

        const ticketData = {
            [constants.ADULT_TICKET_FIELDNAME]: 0,
            [constants.CHILD_TICKET_FIELDNAME]: 0,
            [constants.INFANT_TICKET_FIELDNAME]: 0
        }
        
        for(let i = 0; i < ticketTypeRequests.length; i++) {
            const ttr = ticketTypeRequests[i]
            const type = ttr.getTicketType()
            ticketData[type] = ticketData[type] + ttr.getNoOfTickets()
        }
        
        if(!this.validateChildrenAndInfants(ticketData)) {
            throw (new InvalidPurchaseException(400, 'Cannot purchase child / infant tickets without an accompanying adult', [ticketData]))
        }

        const ticketsToBuy = this.computeTicketsToBuy(ticketData)
        if(!this.validateTicketCount(ticketsToBuy)) {
            throw (new InvalidPurchaseException(400, 'Too many tickets purchased (maximum of 20 per transaction)', [ticketData]))
        }

        const totalAmountToPay = this.computePriceData(ticketData)
        this.ticketPaymentService.makePayment(parseInt(accountId), totalAmountToPay)
        this.seatReservationService.reserveSeat(parseInt(accountId), ticketsToBuy)
        
        return ({
            code: 200,
            totalAmountToPay: totalAmountToPay, 
            ticketsToBuy: ticketsToBuy
        })
    }
}
