# index-optimization
This repository focuses on index adding effect on performance.
This repo provides examples of local index.

## MongoDB Index Types:​
Single-field, compound, text, hashed indexes​
Here we have used Single-field and compound indexes.

### Example of single-field index
db.comments.createIndex({ blog_id: 1 });
### Example of compound index
db.comments.createIndex({ blog_id: 1, createdAt: -1 });

## Strategy:​
`explain()` has been used to analyze query performance.​

## Performance Results:​
Faster query execution.​
Reduced full-collection scans.