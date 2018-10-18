import multipart from 'connect-multiparty';
import BlogManager from '../modules/blog.module';

const multipartMiddleware = multipart();

module.exports = (app) =>
{
  /*
  RETRIEVE A LIST OF BLOG LOGS
  */
  app.get('/', (req, res, next) =>
  {
    // req.galleryModel.find({}).sort({'created_at': -1}).exec((err, images) => res.json(images))
    req.blogModel
      .find(
        {
          'hasBlogEntryBeenPublished': false
        }
      )
      .then(results => res.status(200).send(results))
      .catch(next);
  });


  /*
  UPLOAD BLOG SUBMISSION CONTAINING:
  - BLOG META DATA (Title, Description, etc)
  - REFERENCE: https://cloudinary.com/blog/serverless_tutorial_file_storage_with_webtask_and_cloudinary
  */
  app.post('/', multipartMiddleware, (req, res, next) =>
  {
    const blogManager = new BlogManager(req);

    blogManager
      .processBlogEntry()
      .subscribe
      (
        (blogModel) =>
        {
          res.status(200).send(blogModel);
        },
        (error) =>
        {
          res.status(500).send(error);
          next();
        },
        () => {}
      );
  
  });
}