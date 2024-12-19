const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017"; // MongoDB is running locally
const client = new MongoClient(url);
const dbName = "testDB";

async function constrainedEnvironmentQuery() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const blogsCollection = db.collection('blogs');

        // Start time before running the query
        const start = Date.now();

        // Aggregation pipeline
        const pipeline = [
            // Lookup comments for each blog
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'blog_id',
                    as: 'blog_comments',
                },
            },
            // Flatten the comments array to increase intermediate document count
            {
                $unwind: '$blog_comments',
            },
            // Add a default conversion for invalid strings
            {
                $addFields: {
                    numericSubstring: {
                        $convert: {
                            input: { $substr: ['$blog_comments.content', 0, 2] },
                            to: 'int',
                            onError: 0, // Default value for invalid conversions
                            onNull: 0,  // Default value for null inputs
                        },
                    },
                },
            },
            // Group by blog ID to calculate total comments and random stats
            {
                $group: {
                    _id: '$_id',
                    totalComments: { $sum: 1 },
                    randomStat: { $avg: '$numericSubstring' },
                    blogTitle: { $first: '$title' },
                },
            },
            // Sort by total comments without an index
            {
                $sort: { totalComments: -1 },
            },
            // Add more processing to increase memory usage
            {
                $project: {
                    blogTitle: 1,
                    totalComments: 1,
                    randomStat: 1,
                    extraProcessing: { $concat: ['Title: ', '$blogTitle'] },
                },
            },
            // Limit results
            {
                $limit: 10,
            },
        ];

        console.log('Running aggregation with explain...');

        // Running the aggregation with explain() to see how MongoDB executes it
        const explainResult = await blogsCollection.aggregate(pipeline).explain("executionStats");

        // End time after running the query
        const end = Date.now();

        // Log the explain result
        console.log('Explain result:', JSON.stringify(explainResult, null, 2));

        // Log the execution time
        console.log('Time taken (including explain):', end - start, 'ms');
        
        // If you want to print the query result as well
        const result = await blogsCollection.aggregate(pipeline).toArray();
        console.log('Query executed successfully:', result.length);

    } catch (error) {
        console.error('Error during query execution:', error);
    } finally {
        await client.close();
    }
}

constrainedEnvironmentQuery().catch(console.error);
