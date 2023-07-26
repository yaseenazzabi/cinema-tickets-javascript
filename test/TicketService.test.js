import { jest } from '@jest/globals'
import TicketService from "../src/pairtest/TicketService"
import constants from '../src/pairtest/lib/constants'
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest'
import { InvalidPurchaseException } from '../src/pairtest/lib/InvalidPurchaseException'

describe('TicketService tests', () => {
    afterEach(() => {
        jest.resetModules()
    })

    describe('validateAccountId tests', () => {
        afterEach(() => {
            jest.resetModules()
        })

        test('should accept positive naturals', () => {
            const ts = new TicketService()
            const id = 1
            expect(ts.validateAccountId(id)).toBe(true)
        })

        test('should accept positive naturals in string format', () => {
            const ts = new TicketService()
            const id = '1'
            expect(ts.validateAccountId(id)).toBe(true)
        })
    })

    describe('validateTicketTypeRequests tests', () => {
        afterEach(() => {
            jest.resetModules()
        })

        test('should accept array of TicketTypeRequests', () => {
            const ts = new TicketService()
            const ttr1 = new TicketTypeRequest(constants.ADULT_TICKET_FIELDNAME, 20)
            expect(ts.validateTicketTypeRequests([ttr1])).toBe(true)
        })

        test('should reject individual TicketTypeRequests', () => {
            const ts = new TicketService()
            const ttr1 = new TicketTypeRequest(constants.ADULT_TICKET_FIELDNAME, 20)
            expect(ts.validateTicketTypeRequests(ttr1)).toBe(false)
        })

        test('should reject invalid TicketTypeRequests', () => {
            const ts = new TicketService()
            const ttr1 = {invalid: true}
            expect(ts.validateTicketTypeRequests([ttr1])).toBe(false)
        })

        test('should reject null TicketTypeRequests', () => {
            const ts = new TicketService()
            expect(ts.validateTicketTypeRequests(null)).toBe(false)
        })

        test('should reject undefined TicketTypeRequests', () => {
            const ts = new TicketService()
            expect(ts.validateTicketTypeRequests(undefined)).toBe(false)
        })
    })

    describe('validateTicketCount tests', () => {

        afterEach(() => {
            jest.resetModules()
        })

        test('should accept ticket count <= 20 when set to do so', () => {
            const ts = new TicketService()
            ts.setMaxTickets(20)
            expect(ts.validateTicketCount(20)).toBe(true)
        })

        test('should reject ticket count of 20 when max is set to 10', () => {
            const ts = new TicketService()
            ts.setMaxTickets(10)
            expect(ts.validateTicketCount(20)).toBe(false)
        })
    })

    describe('computeTicketsToBuy tests', () => {

        afterEach(() => {
            jest.resetModules()
        })

        test('should correctly compute tickets to buy', () => {
            const ts = new TicketService()
            const ticketData = {
                [constants.ADULT_TICKET_FIELDNAME]: 20,
                [constants.CHILD_TICKET_FIELDNAME]: 0,
                [constants.INFANT_TICKET_FIELDNAME]: 0
            }
            expect(ts.computeTicketsToBuy(ticketData)).toBe(20)
        })

        test('should correctly compute tickets to buy and work with missing fields', () => {
            const ts = new TicketService()
            const ticketData = {
                [constants.ADULT_TICKET_FIELDNAME]: 20,
            }
            expect(ts.computeTicketsToBuy(ticketData)).toBe(20)
        })
    })

    describe('computePriceData tests', () => {

        afterEach(() => {
            jest.resetModules()
        })

        test('should correctly compute price data', () => {
            const ts = new TicketService()
            const ticketData = {
                [constants.ADULT_TICKET_FIELDNAME]: 20,
                [constants.CHILD_TICKET_FIELDNAME]: 0,
                [constants.INFANT_TICKET_FIELDNAME]: 0
            }
            expect(ts.computePriceData(ticketData)).toBe(400)
        })

        test('should correctly compute price data and work with missing fields', () => {
            const ts = new TicketService()
            const ticketData = {
                [constants.ADULT_TICKET_FIELDNAME]: 20
            }
            expect(ts.computePriceData(ticketData)).toBe(400)
        })

        test('should correctly compute and add price data', () => {
            const ts = new TicketService()
            const ticketData = {
                [constants.ADULT_TICKET_FIELDNAME]: 20,
                [constants.CHILD_TICKET_FIELDNAME]: 10,
                [constants.INFANT_TICKET_FIELDNAME]: 0
            }
            expect(ts.computePriceData(ticketData)).toBe(500)
        })

        test('should correctly compute and add price data, and value infant tickets at 0', () => {
            // Similar to TicketService.setMaxTickets(), methods could easily be implemented that set the value of tickets for a TicketService implementation.
            const ts = new TicketService()
            const ticketData = {
                [constants.ADULT_TICKET_FIELDNAME]: 20,
                [constants.CHILD_TICKET_FIELDNAME]: 10,
                [constants.INFANT_TICKET_FIELDNAME]: 1000
            }
            expect(ts.computePriceData(ticketData)).toBe(500)
        })
    })

    describe('purchaseTickets tests', () => {

        afterEach(() => {
            jest.resetModules()
        })

        test('should correctly purchase tickets given one TicketTypeRequest', () => {
            const ts = new TicketService()
            const ttr1 = new TicketTypeRequest(constants.ADULT_TICKET_FIELDNAME, 20)
            const res = ts.purchaseTickets(1, [ttr1])
            expect(res.code).toBe(200)
            expect(res.ticketsToBuy).toBe(20)
            expect(res.totalAmountToPay).toBe(400)
        })

        test('should correctly purchase tickets given several TicketTypeRequests', () => {
            const ts = new TicketService()
            const ttr1 = new TicketTypeRequest(constants.ADULT_TICKET_FIELDNAME, 10)
            const ttr2 = new TicketTypeRequest(constants.CHILD_TICKET_FIELDNAME, 5)
            const ttr3 = new TicketTypeRequest(constants.INFANT_TICKET_FIELDNAME, 5)
            const res = ts.purchaseTickets(1, [ttr1, ttr2, ttr3])
            expect(res.code).toBe(200)
            expect(res.ticketsToBuy).toBe(20)
            expect(res.totalAmountToPay).toBe(250)
        })

        test('should decline requests without passing TicketTypeRequests as an array', () => {
            try {
                const ts = new TicketService()
                const ttr1 = new TicketTypeRequest(constants.ADULT_TICKET_FIELDNAME, 20)
                const res = ts.purchaseTickets(1, ttr1)
                throw({code: 500, message: 'Unit test failed to catch the error'})
            }
            catch (e) {
                expect(e instanceof InvalidPurchaseException).toBe(true)
                expect(e.message).toBe('ticketTypeRequests received are invalid')
            }
        })

        test('should decline requests passing invalid data as TicketTypeRequests', () => {
            try {
                const ts = new TicketService()
                const res = ts.purchaseTickets(1, {invalid: true})
                throw({code: 500, message: 'Unit test failed to catch the error'})
            }
            catch (e) {
                expect(e instanceof InvalidPurchaseException).toBe(true)
                expect(e.message).toBe('ticketTypeRequests received are invalid')
            }
        })

        test('should decline requests with an invalid accountId', () => {
            try {
                const ts = new TicketService()
                const ttr1 = new TicketTypeRequest(constants.ADULT_TICKET_FIELDNAME, 20)
                const ttr2 = new TicketTypeRequest(constants.CHILD_TICKET_FIELDNAME, 5) // error should be thrown before max count is reached.
                const ttr3 = new TicketTypeRequest(constants.INFANT_TICKET_FIELDNAME, 5)
                const res = ts.purchaseTickets(0, [ttr1, ttr2, ttr3])
                throw({code: 500, message: 'Unit test failed to catch the error'})
            }
            catch (e) {
                expect(e instanceof InvalidPurchaseException).toBe(true)
                expect(e.message).toBe('Account ID is invalid')
            }
        })

        test('should decline requests with over 20 tickets (the default value)', () => {
            try {
                const ts = new TicketService()
                const ttr1 = new TicketTypeRequest(constants.ADULT_TICKET_FIELDNAME, 20)
                const ttr2 = new TicketTypeRequest(constants.CHILD_TICKET_FIELDNAME, 5)
                const ttr3 = new TicketTypeRequest(constants.INFANT_TICKET_FIELDNAME, 5)
                const res = ts.purchaseTickets(1, [ttr1, ttr2, ttr3])
                throw({code: 500, message: 'Unit test failed to catch the error'})
            }
            catch (e) {
                expect(e instanceof InvalidPurchaseException).toBe(true)
                expect(e.message).toBe('Too many tickets purchased (maximum of 20 per transaction)')
            }
        })
    })
})
