import mongoose from "mongoose";
import { blogSchema } from "../models/blog.model";

module.exports =
  {
    // Connect/Disconnect middleware
    connectDisconnect: (req, res, next) =>
    {
      // Create connection using Mongo Lab URL
      // available in Webtask context
      const connection = mongoose.createConnection(req.webtaskContext.secrets.MONGO_DB_URL, { useNewUrlParser: true });

      // Create a mongoose model using the Schema
      req.blogModel = connection.model('Blog', blogSchema);

      req.on('end', () =>
      {
        // Disconnect when request
        // processing is completed
        mongoose.connection.close();
      })

      // Call next to move to
      // the next Express middleware
      next()
    },
  }