const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    items: [
        {
            producto: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Product', 
                required: true 
            },
            cantidad: { 
                type: Number, 
                required: true 
            }
        }
    ],
    default:[]
}, {
    timestamps: true
});

cartSchema.pre('findOne', function(next) {
    this.populate('items.producto');
    next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
