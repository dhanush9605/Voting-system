// Vercel Serverless Function Bridge
let app;

console.log('Vercel Bridge: Starting load sequence...');

try {
    console.log('Vercel Bridge: Requiring backend index...');
    // We use require to trap errors that occur during the loading phase
    const backend = require('../server/src/index');
    app = backend.app;
    console.log('Vercel Bridge: Backend index loaded successfully');
} catch (error) {
    console.error('CRITICAL ERROR during Vercel bridge initialization:');
    console.error(error);
    
    // In case of error, we export a simple error-reporting app
    const express = require('express');
    app = express();
    app.all('*', (req, res) => {
        res.status(500).json({
            error: 'Backend failed to initialize',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    });
}

module.exports = app;
