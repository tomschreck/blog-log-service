'use latest';

import express from 'express';
import { fromExpress } from 'webtask-tools';
import bodyParser from 'body-parser';
import cors from 'cors';
import { config_cloudinary } from './middleware/cloudinary';
import { connectDisconnect } from './middleware/db';

const app = express();

// MIDDLEWARES
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(connectDisconnect);
app.use(config_cloudinary);

// ROUTES
require('./routes/index')(app);

module.exports = fromExpress(app);
