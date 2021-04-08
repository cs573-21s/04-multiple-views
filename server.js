const express = require('express');
const path = require('path');

const app = express();

app.listen(7171, () => console.log('http://localhost:7171'));

app.use(express.static(path.join(__dirname, 'public')));
