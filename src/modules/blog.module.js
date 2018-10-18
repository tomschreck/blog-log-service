import { Observable } from 'rxjs/Rx';

const BlogManager = function(req)
{
  const blogModel = new req.blogModel( Object.assign(JSON.parse(req.body.data)) );
  blogModel.mediaAssetsList = [];

  let fileList = [];

  /*
  POPULATE fileList WITH FILES UPLOADED

  NOTE: files are placed in blogFile variable using multipartMiddleware middleware

  req.files.blogFile could be an array or an individual item depending on the number of files uploaded
  */
  const generateFileList = () =>
  {
    if (req.files)
    {
      if (req.files.blogFile instanceof Array)
      {
        fileList = req.files.blogFile;
      }
      else
      {
        fileList.push(req.files.blogFile);
      }
    } 
  };


  /*
  CREATE AN OBSERVABLE FOR WHEN FILE IS FINISHED UPLOADING TO CLOUDINARY
  THIS OBSERVABLE RETURNS blogModel TO THE NEXT CALL
  */
  const uploadFileToCloudinary = (file) =>
  {
    // console.log('DAS FILE', file);

    // for folder, replace spaces with '_' then replace any non-alphanumeric characters (retains '_')
    const folder = `${blogModel.title.split(' ').join('_').replace(/\W/g, '')}_${blogModel._id}`;
    const tags = (blogModel.tagList && blogModel.tagList.length > 0) ? blogModel.tagList.join(',') : '';

    // CREATE THUMB, SMALL, MEDIUM, & LARGE CONFIGURATIONS FOR IMAGE
    const upload_config =
      {
        resource_type: 'auto', 
        folder: folder,
        tags: tags,
        eager:
          [
            { width: 200, height: 200, crop: 'fit' },
            { width: 600, crop: 'fit', aspect_ratio: '16:9' },
            { width: 900, crop: 'fit', aspect_ratio: '16:9' },
            { width: 1200, crop: 'fit', aspect_ratio: '16:9' }
          ],       
        eager_async: true, 
        overwrite: true
      };

    return Observable.create(observer =>
    {
      req.cloudinary.v2.uploader.upload(
        file.path,
        upload_config,
        (error, result) =>
        {
          // console.log('CLOUDINARY RESULTS', result, error);

          if (error)
          {
            observer.error(error);
            observer.complete();
          }
          else
          {
            const mediaObject =
            {
              public_id: result.public_id,
              url: result.secure_url,
              thumb_url: (result.eager && result.eager.length > 0) ? result.eager[0].secure_url : result.secure_url,
              small_url: (result.eager && result.eager.length > 1) ? result.eager[1].secure_url : result.secure_url,
              medium_url: (result.eager && result.eager.length > 2) ? result.eager[2].secure_url : result.secure_url,
              large_url: (result.eager && result.eager.length > 3) ? result.eager[3].secure_url : result.secure_url
            };

            blogModel.mediaAssetsList.push(mediaObject);

            observer.next(blogModel);
            observer.complete();
          }
        });
    });
  };


  /*
  SAVE BLOG MODEL TO MONGO...
  */
  const saveBlog = (observer) =>
  {
    // SAVE TO DATABASE
    blogModel
      .save()
      .then((newItem) =>
      {
        console.log('MONGO BLOG FINALLY:', newItem);
        observer.next(newItem);
        observer.complete();        
      })
      .catch((error) =>
      {
        observer.error(error);
        observer.complete();        
      });
  };


  /*
  PROCESS BLOG ENTRY FROM FORM SUBMISSION FROM CLIENT.
  DOES THE FOLLOWING:
  
  1. GENERATE FILE LIST FROM FILES UPLOADED (IMAGES)
  2. FOR EACH FILE, UPLOAD TO CLOUDINARY
  3. SAVE BLOG MODEL TO MONGO DB
  */
  const processBlogEntry = () =>
  {
    return Observable.create(observer =>
    {
      generateFileList();

      // PROCESS EACH IMAGE UPLOADED
      if (fileList && fileList.length > 0)
      {
        /*
        PROCESS EACH FILE IN SUBMISSION (Observable.from):
        1. UPLOAD TO CLOUDINARY (uploadFileToCloudinary)
        2. SAVE BLOG MODEL IN MONGO DB (saveBlog)
        */
        Observable.from(fileList)
          .mergeMap((file) => uploadFileToCloudinary(file))
          .subscribe
          (
            (blogModel) =>
            {
              // console.log('FINISHED A FILE:', blogModel);
            },
            error =>
            {
              // console.log('onError: %s', error);
              observer.error(error);
              observer.complete();              
            },
            () =>
            {
              blogModel.hasMediaAssetsBeenProcessed = true;
              blogModel.mediaAssetsProcessedTimestamp = new Date();

              saveBlog(observer);
            }
          );
      }
      else
      {
        saveBlog(observer);
      }      
    });
  };


  return {
    processBlogEntry: processBlogEntry
  }
};

export default BlogManager;
