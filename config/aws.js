const { configureAWS } = require('../helper/aws');

// Configure AWS SDK with credentials
const initAWS = () => {
  try {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';
    
    if (!accessKeyId || !secretAccessKey) {
      console.warn('AWS credentials not found. Image uploads will not work.');
      return false;
    }
    
    configureAWS(accessKeyId, secretAccessKey, region);
    console.log('AWS SDK configured successfully');
    return true;
  } catch (error) {
    console.error('Error configuring AWS SDK:', error);
    return false;
  }
};

module.exports = {
  initAWS
}; 