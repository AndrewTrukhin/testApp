import mongoose, { Schema } from 'mongoose';
import mongooseKeywords from 'mongoose-keywords';

const ObjectId = Schema.ObjectId;

const postSchema = new Schema({
    name: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    pictureUrl: {
        type: String,
        trim: true,
    },
    text: {
        type: String,
        trim: true,
    },
    author: { 
        type: ObjectId,
        required: true, 
        ref: 'User',
    },
    likesCount: {
        type: Number,
        default: 0,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
 }, {
    timestamps: true,
},);

postSchema.methods = {
    view(full) {
        const view = {};
        let fields = ['name', 'description', 'pictureUrl', 'text', 'author', 'likesCount', 'timestamps', 'isApproved'];

        if (full) {
            fields = [...fields, 'createdAt'];
        }

        fields.forEach((field) => { view[field] = this[field] });

        return view;
    }
};

postSchema.plugin(mongooseKeywords, { paths: ['name', 'description', 'author'] });

const model = mongoose.model('Posts', postSchema);  // create mangoose with name and schema object, which structure was defined above

export const schema = model.schema;                 // export schema object from Posts model. Its a property of model and contains structure
export default model;                               // export model. Imported value will be Posts model