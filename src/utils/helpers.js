const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}${month}${day}-${random}`;
};

const calculateTotal = (items) => {
    let subtotal = 0;
    for (const item of items) {
        subtotal += item.quantity * item.price;
    }
    const tax = subtotal * 0.1; // 10% tax
    const deliveryFee = subtotal > 100 ? 0 : 20;
    const total = subtotal + tax + deliveryFee;
    
    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        total: parseFloat(total.toFixed(2))
    };
};

const sanitizeUser = (user) => {
    const { password_hash, ...sanitized } = user.toJSON ? user.toJSON() : user;
    return sanitized;
};

const paginate = (page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    return {
        offset,
        limit: parseInt(limit),
        page: parseInt(page)
    };
};

module.exports = {
    generateOrderNumber,
    calculateTotal,
    sanitizeUser,
    paginate
};