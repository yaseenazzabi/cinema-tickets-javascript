function InvalidPurchaseException(code, message, stack) {
    this.code = code
    this.message = message
    this.stack = stack
}

InvalidPurchaseException.prototype = Object.create(Error.prototype)
InvalidPurchaseException.prototype.name = 'InvalidPurchaseException'
InvalidPurchaseException.prototype.constructor = InvalidPurchaseException

export {
    InvalidPurchaseException
}