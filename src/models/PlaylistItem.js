import mongoose from 'mongoose';
import { createSchema } from 'mongoose-model-decorators';

const Types = mongoose.Schema.Types;

export default () => {
  class PlaylistItem {
    static schema = {
      media: { type: Types.ObjectId, ref: 'Media', required: true },
      artist: { type: String, max: 128, required: true },
      title: { type: String, max: 128, required: true },
      start: { type: Number, min: 0, default: 0 },
      end: { type: Number, min: 0, default: 0 }
    };
  }

  return createSchema({ minimize: false })(PlaylistItem);
};
