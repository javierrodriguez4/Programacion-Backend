const express = require('express');
const router = express.Router();
const Cart = require('../dao/models/carts.model');

router.get('/:cartId/:itemId', async (req, res) => {
    const { cartId, itemId } = req.params
    try {

        const cart = await Cart.findById(cartId)
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        const itemIndex = cart.items.findIndex((item) => item._id.equals(itemId));

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }
        cart.items.splice(itemIndex, 1);
        await cart.save();
        return res.render('cartsDeleteById', { cartId, itemId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
    }
});

module.exports = router;
