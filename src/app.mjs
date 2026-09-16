import express from 'express'
import helmet from 'helmet';
import cors from 'cors'
import morgan from 'morgan';
import cookieParser from 'cookie-parser'

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_URL || '*',
        credentials: true,
    })
)   
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// app.use('/api')

export default app