import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

// middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

const port = process.env.PORT || 3166;

app.listen(port, ()=> console.log(`Estate server listening on http://localhost:${port}`));