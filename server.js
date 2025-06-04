const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration for production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGIN 
        : 'http://localhost:3000',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static('public'));

// Ensure names.csv exists
const csvPath = path.join(__dirname, 'names.csv');
if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, 'Name\n');
}

app.post('/api/names', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        fs.appendFileSync(csvPath, `${name}\n`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error writing to CSV:', error);
        res.status(500).json({ error: 'Failed to save name' });
    }
});

app.get('/api/download', (req, res) => {
    try {
        res.download(csvPath);
    } catch (error) {
        console.error('Error downloading CSV:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 