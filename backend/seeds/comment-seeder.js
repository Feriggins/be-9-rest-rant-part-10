const mongoose = require('mongoose');
const { Comment, Place } = require('../models');

require('dotenv').config();
const db = require('../config/connection');

const seedComments = async () => {
    const comments = [
        {
            author: 'John Doe',
            rant: false,
            stars: 5,
            content: 'Fantastic place! Loved the ambiance and the food was excellent.'
        },
        {
            author: 'Jane Smith',
            rant: true,
            stars: 2,
            content: 'Not great, service was slow and the food was cold.'
        },
        {
            author: 'Sam Wilson',
            rant: false,
            stars: 4,
            content: 'Great place for a family outing. Will visit again!'
        },
        {
            author: 'Emily Davis',
            rant: false,
            stars: 3,
            content: 'Good place but could improve on cleanliness.'
        },
        {
            author: 'Michael Brown',
            rant: true,
            stars: 1,
            content: 'Worst experience ever. Would not recommend.'
        },
        {
            author: 'Linda Johnson',
            rant: false,
            stars: 5,
            content: 'Absolutely loved it! Best food in town.'
        },
        {
            author: 'David Lee',
            rant: false,
            stars: 4,
            content: 'Very nice place, good service, and decent prices.'
        },
        {
            author: 'Sophia Martinez',
            rant: false,
            stars: 4,
            content: 'A pleasant experience overall. Nice staff and good food.'
        },
        {
            author: 'Lucas Garcia',
            rant: true,
            stars: 2,
            content: 'Disappointed with the service. Food was okay, but not worth the price.'
        },
        {
            author: 'Mia Hernandez',
            rant: false,
            stars: 3,
            content: 'Average place. Some dishes were good, others were just okay.'
        }
    ];

    try {
        // Connect to the database
        await db;

        const places = await Place.find({});
        if (places.length === 0) {
            console.log('No places found. Please seed places first.');
            mongoose.connection.close();
            return;
        }

        await Comment.deleteMany({});
        console.log('Existing comments cleared.');

        for (let place of places) {
            const placeComments = [];

            for (let i = 0; i < 2; i++) {
                const commentData = comments[Math.floor(Math.random() * comments.length)];
                const comment = new Comment(commentData);
                await comment.save();
                placeComments.push(comment._id);
            }

            place.comments.push(...placeComments);
            await place.save();
        }

        const remainingComments = comments.length - (places.length * 2);
        for (let i = 0; i < remainingComments; i++) {
            const commentData = comments[i];
            const comment = new Comment(commentData);
            await comment.save();

            // Randomly select a place to attach the comment
            const randomPlace = places[Math.floor(Math.random() * places.length)];
            randomPlace.comments.push(comment._id);
            await randomPlace.save();
        }

        console.log(`Comments successfully added and associated with places.`);

        // Disconnect from the database
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding comments:', error);
        mongoose.connection.close();
    }
};

seedComments();
