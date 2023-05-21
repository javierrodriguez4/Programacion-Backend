const express = require('express');
const router = express.Router();
const Product = require('../dao/models/products.model');
const Cart = require('../dao/models/carts.model');
const Handlebars = require('handlebars');
const Swal = require('sweetalert2');



Handlebars.registerHelper('reduce', function (array, prop) {
    return array.reduce((acc, item) => acc + item[prop], 0);
});

Handlebars.registerHelper('multiply', function (a, b) {
    return a * b;
});

async function getOrCreateCart() {
    let cart = await Cart.findOne();

    if (!cart) {
        cart = new Cart();
        await cart.save();
    }

    return cart;
}

router.get('/', async (req, res) => {
    try {
        const { sortOption } = req.query;

        const carrito = await Cart.findOne()
            .lean();

        if (!carrito || carrito.items.length === 0) {
            req.flash('info', 'No hay productos en el carrito');
            return res.redirect('/');
        }

        let sortedItems = [...carrito.items];

        if (sortOption === 'asc') {
            sortedItems.sort((a, b) => a.producto.price - b.producto.price);
        } else if (sortOption === 'desc') {
            sortedItems.sort((a, b) => b.producto.price - a.producto.price);
        }

        const totalPriceAggregate = await Cart.aggregate([
            { $match: { _id: carrito._id } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.producto',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$_id',
                    totalPrice: {
                        $sum: { $multiply: ['$product.price', '$items.cantidad'] },
                    },
                },
            },
        ]);

        const totalPrice = totalPriceAggregate.length > 0 ? totalPriceAggregate[0].totalPrice : 0;


        res.render('carts', { carrito: { ...carrito, items: sortedItems }, totalPrice });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener el carrito');
    }
});

// Vaciar el carrito por su ID
router.post('/:cartId/vaciar', async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const cart = await Cart.findById(cartId);

        if (!cart) {
            req.flash('error', 'No se encontró el carrito');
            return res.redirect('/');
        }

        cart.items = [];
        await cart.save();
        req.flash('success', 'Carrito vaciado exitosamente');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al vaciar el carrito');
    }
});

// Eliminar el carrito de la base de datos
router.post('/:cartId/eliminar', async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const result = await Cart.deleteOne({ _id: cartId });

        if (result.deletedCount === 0) {
            req.flash('error', 'No se encontró el carrito');
            return res.redirect('/');
        }

        req.flash('success', 'Carrito vaciado exitosamente');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al vaciar el carrito');
    }
});


// Actualizar la cantidad de un producto en el carrito
router.post('/:cartId/:itemId', async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const itemId = req.params.itemId;
        const { cantidad } = req.body;

        const cart = await Cart.findById(cartId);

        if (!cart) {
            req.flash('error', 'No se encontró el carrito');
            return res.redirect('/');
        }

        const item = cart.items.find(item => item._id.toString() === itemId);

        if (!item) {
            req.flash('error', 'No se encontró el producto en el carrito');
            return res.redirect('/carts');
        }

        item.cantidad = cantidad;
        await cart.save();
        req.flash('success', 'Cantidad actualizada exitosamente');
        res.redirect('/carts');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar la cantidad del producto');
    }
});


// Agregar productos al carrito
router.post('/:pid', async (req, res) => {
    try {
        const { cantidad } = req.body;
        const productId = req.params.pid;
        const producto = await Product.findOne({ _id: productId });

        let cart = await getOrCreateCart();

        // Verificar si el producto ya está en el carrito
        const itemExists = cart.items.some(item => item.producto.toString() === productId);
        if (itemExists) {

            Swal.fire({
                icon: 'warning',
                text: 'El producto ya está en el carrito',
                confirmButtonText: 'Aceptar'
            });
        } else {
            cart.items.push({ producto: producto, cantidad: cantidad });
            await cart.save();
            const referer = req.header('Referer');
            res.redirect(referer || '/');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al agregar producto al carrito');
    }
});


module.exports = router;
