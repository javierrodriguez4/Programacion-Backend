const express = require('express');
const router = express.Router();
const Chat = require('../dao/models/messages.model');


router.get('/', async (req, res) => {
    try {
        const messages = await Chat.find();
        res.render('chat', { messages });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los mensajes');
    }
});


router.post('/', async (req, res) => {
    try {
        const { user, message } = req.body; 
        const newMessage = new Chat({ user, message });
        await newMessage.save(); 
        res.redirect('/chat');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al guardar el mensaje');
    }
});

module.exports = router;
