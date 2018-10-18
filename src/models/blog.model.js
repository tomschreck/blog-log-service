import mongoose from "mongoose";
import { BlogTypeEnum } from "./enum.model";

const blogSchema = new mongoose.Schema({
  title:
    {
      type: String,
      required: true,
      minlength: 1,
      trim: true
    },
  blogTypeId:
    {
      type: Number,
      enum: Object.values(BlogTypeEnum),
      required: false,
      trim: true
    },
  shortDescription:
    {
      type: String,
      required: false,
      minlength: 1,
      trim: true
    },
  longDescription:
    {
      type: String,
      required: false,
      trim: true
    },
  tagList:
    {
      type: Object,
      required: false,
      trim: true
    },
  hasMediaAssetsBeenProcessed:
    {
      type: Boolean,
      required: true,
      default: false
    },
  mediaAssetsProcessedTimestamp:
    {
      type: Date,
      required: false,
      default: undefined
    },
  hasBlogEntryBeenPublished:
    {
      type: Boolean,
      required: true,
      default: false
    },
  blogEntryPublishedTimestamp:
    {
      type: Date,
      required: false,
      default: undefined
    },
  mediaAssetsList:
    [
      {
        public_id: String,
        url: String,
        thumb_url: String,
        small_url: String,
        medium_url: String,
        large_url: String
      }
    ]
}, { timestamps: {} });


// INSTANCE METHODS...

// MODEL METHODS...

// const BlogModel = mongoose.model('blog', schema);

module.exports = { blogSchema };
