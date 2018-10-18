import cloudinary from 'cloudinary';

module.exports =
  {
    config_cloudinary: (req, res, next) =>
    {
      // CONFIGURE CLOUDINARY FOR IMAGE/VIDEO STORAGE...
      cloudinary.config({
        cloud_name: req.webtaskContext.secrets.CLOUDINARY_NAME,
        api_key: req.webtaskContext.secrets.CLOUDINARY_API_KEY,
        api_secret: req.webtaskContext.secrets.CLOUDINARY_API_SECRET
      });

      req.cloudinary = cloudinary;

      next()
    },
  }