import constants from "./constants.js";

export default class TicketTypeRequest {
  #type;

  #noOfTickets;

  constructor(type, noOfTickets) {
    if (!this.#Type.includes(type)) {
      throw new TypeError(`type must be ${this.#Type.slice(0, -1).join(', ')}, or ${this.#Type.slice(-1)}`);
    }

    if (!Number.isInteger(noOfTickets)) {
      throw new TypeError('noOfTickets must be an integer');
    }

    this.#type = type;
    this.#noOfTickets = noOfTickets;
  }

  getNoOfTickets() {
    return this.#noOfTickets;
  }

  getTicketType() {
    return this.#type;
  }

  #Type = [constants.ADULT_TICKET_FIELDNAME, constants.CHILD_TICKET_FIELDNAME, constants.INFANT_TICKET_FIELDNAME];
}
