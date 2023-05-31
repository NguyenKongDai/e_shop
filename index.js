'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5000; //process.env.PORT: khi triển khai lên host thuê hay host free thì k biết port bao nhiêu thì sẽ dùng biến môi trường được cung cấp
const expressHandlebars = require('express-handlebars');
const { createStarList } = require('./controllers/handlebarsHelper');
const { createPagination } = require('express-handlebars-paginate');
const session = require('express-session');
const redisStore = require('connect-redis').default;
const { createClient } = require('redis');
const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.connect().catch(console.error);

// cấu hình public static folder
app.use(express.static(__dirname + '/public'));

// cấu hình sử dụng express-handlebars
app.engine('hbs', expressHandlebars.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true
    },
    helpers: {
        createStarList,
        createPagination
    }
}));

app.set('view engine', 'hbs');


// cau hinh doc du lieu post tu body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// cau hinh su dung session
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: new redisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 20 * 60 * 1000
    }
}));


// middleware khoi tao gio hang
app.use((req, res, next) => {
    let Cart = require('./controllers/cart');
    req.session.cart = new Cart(req.session.cart ? req.session.cart : {});
    res.locals.quantity = req.session.cart.quantity;

    next();
})

// routes
app.use('/', require('./routes/indexRouter'));
app.use('/products', require('./routes/productsRouter'));
app.use('/users', require('./routes/usersRouter'));

app.use((req, res, next) => {
    res.status(404).render('error', { message: 'File not Found!' });
})

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).render('error', { message: 'Internal Server Error!' });
})

// khởi động server
app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
});

