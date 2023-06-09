const express = require('express');
const router = express.Router();
const multer = require('multer');
const isAdmin = require('../middlewares/isAdmin');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'img'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + '-' + Date.now() + ext;
        cb(null, filename);
    }
});
const upload = multer({ storage });


router.get('/', isAdmin, (req, res) => {
    res.render('realTimeProducts', {});
});

router.post('/', upload.single('thumbnail'), async (req, res) => {
    const { title, category, size, code, description, price, stock } = req.body;
    if (!title) {
        return res.status(400).send('El campo "title" es obligatorio');
    }

    const newProduct = new Product({
        title,
        category,
        size,
        status: true,
        code,
        description,
        price: parseInt(price),
        stock,
        thumbnail: `/img/${req.file.filename}`
    });

    try {
        await newProduct.save();            
        const product = await Product.find().lean();
        res.render('realtimeproducts', { product: product });

    } catch (err) {
        res.status(500).send('Error al guardar el producto en la base de datos');
    }
});


module.exports = router;
