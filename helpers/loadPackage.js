// Import the required S3Client from the @aws-sdk/client-s3 package
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Create the S3 client using S3Client from AWS SDK v3
const s3Client = new S3Client({
    region: process.env.AWS_REGION, // Replace with your region, e.g., 'us-east-1'
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY_ID,
    },
    requestTimeout: 300000
});

module.exports = {
    s3: s3Client,
    // Upload the image to S3
    uploadSankalpTaruImages: async function (localFilePath, key) {
        const fileStream = fs.createReadStream(localFilePath);

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME, // S3 bucket name
            Key: key, // File name in the S3 bucket
            Body: fileStream,
            ACL: 'public-read', // Permission for public access
        };

        try {
            // Use the S3Client to send a PutObjectCommand with the parameters
            const command = new PutObjectCommand(params);
            const data = await s3Client.send(command);

            const output = {
                location: `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,  // Public URL
                key: params.Key,           // S3 file key
                originalName: path.basename(localFilePath), // Original file name
                cloudfront_url: process.env.AWS_CLOUDFRONT_DISTRIBUTION_URL+path.basename(localFilePath)
            }
            // return {
                //     location: `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,  // Public URL
                //     key: params.Key,           // S3 file key
                //     originalName: path.basename(localFilePath), // Original file name
                // };
                fs.writeFileSync('data.json', JSON.stringify(output, null, 2));
        } catch (err) {
            console.error("Error uploading file: ", err);
            throw err;
        }
    },
}