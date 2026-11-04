const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const testRoutes = require('./routes/testRoutes');
app.use('/api', testRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to ShareSpace Backend!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`ShareSpace server running on port ${PORT}`);
});