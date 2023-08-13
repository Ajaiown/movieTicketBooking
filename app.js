const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const MongoClient = require('mongodb').MongoClient;
const expressLayouts = require('express-ejs-layouts');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

const mongoURL = 'mongodb://localhost:27017';
const dbName = 'movieTicketBooking';

async function fetchMoviesFromDB() {
    try {
        const client = new MongoClient(mongoURL);
        await client.connect();

        const db = client.db(dbName);
        const moviesCollection = db.collection('movies');
        const movies = await moviesCollection.find({}).toArray();

        client.close();

        return movies;
    } catch (error) {
        console.error('Error fetching movies:', error);
        throw error;
    }
}

app.get('/', async (req, res) => {
    try {
        const user = req.session.user || null;
        const movies = await fetchMoviesFromDB();
        
        // Pass the content for the 'home' view using the 'body' variable
        const homePageContent = '<h2>Welcome to Movie Ticket Booking</h2><p>Explore our latest movie offerings...</p>';
        
        res.render('home', { user, movies, body: homePageContent });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/login', (req, res) => {
    const user = req.session.user || null;
    res.render('login', { user, body: 'Your Login Page Content' });
});



app.get('/signup', (req, res) => {
    const user = req.session.user || null;
    res.render('signup', { user, body: 'Your Signup Page Content' });
});


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.render('logout');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const client = new MongoClient(mongoURL);
        await client.connect();

        const db = client.db(dbName);
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user;
        }

        client.close();
        res.redirect('/');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        const client = new MongoClient(mongoURL);
        await client.connect();

        const db = client.db(dbName);
        const usersCollection = db.collection('users');
        const existingUser = await usersCollection.findOne({ username });

        if (existingUser) {
            res.render('signup', { error: 'Username already taken' });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await usersCollection.insertOne({ username, password: hashedPassword });
            res.redirect('/');
        }

        client.close();
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Internal Server Error');
    }
});

// ... Add more routes here

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
