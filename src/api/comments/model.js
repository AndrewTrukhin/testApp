import mongoose, { Schema } from "mongoose";
import mongooseKeywords from "mongoose-keywords"

const ObjectId = Schema.ObjectId;

const commentSchema = new Schema({
    author: {
        type: ObjectId,
        required: true,
        ref: 'User',
    },
    text: {
        type: String,
        required: true,
    },
    likesCount: {
        type: Number,
        default: 0,
    },
    dislikesCount: {
        type: Number,
        default: 0,
    },
    post: {
        type: ObjectId,
        required: true,
        ref: 'Posts',
    },
}, {
    timestamps: true,
},);

commentSchema.methods = {
    view(full) {
        const view = {};
        let fields = ['author', 'text', 'likesCount', 'dislikesCount', 'post', 'timestamps'];

        if (full) {
            fields = [...fields, 'createdAt'];
        }

        fields.forEach((field) => { view[field] = this[field] });

        return view;
    }
};

commentSchema.plugin(mongooseKeywords, { paths: ['author'] });

const model = mongoose.model('Comments', commentSchema);
export const schema = model.schema;
export default model;