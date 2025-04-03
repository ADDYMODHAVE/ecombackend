const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// Configure AWS SDK
const configureAWS = (accessKeyId, secretAccessKey, region) => {
  AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region,
  });
};

// Initialize S3 client
const getS3Client = () => {
  return new AWS.S3();
};

// Upload image to S3
const uploadImageToS3 = async (base64Image, bucketName, folder = "products") => {
  try {
    // Remove header from base64 string
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const fileExtension = base64Image.split(";")[0].split("/")[1];
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    // Upload to S3
    const s3 = getS3Client();
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: `image/${fileExtension}`,
      ACL: "public-read", // Set to private for protected access
    };

    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    throw error;
  }
};

// Get signed URL for private S3 objects
const getSignedUrl = async (imageUrl, bucketName, expiresIn = 3600) => {
  try {
    const s3 = getS3Client();
    const key = imageUrl.split("/").slice(-2).join("/"); // Extract key from URL

    const params = {
      Bucket: bucketName,
      Key: key,
      Expires: expiresIn,
    };

    const signedUrl = await s3.getSignedUrlPromise("getObject", params);
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

// Upload multiple images
const uploadMultipleImages = async (base64Images, bucketName, folder = "products") => {
  try {
    const uploadPromises = base64Images.map((image) => uploadImageToS3(image, bucketName, folder));
    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls;
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
};

module.exports = {
  configureAWS,
  uploadImageToS3,
  getSignedUrl,
  uploadMultipleImages,
};
