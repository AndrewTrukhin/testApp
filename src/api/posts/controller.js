import mongoose from 'mongoose';
import { Posts } from '.';


export const getAllPosts = async (req, res) => {
    try {
        const query = req.query;
        if (req.user.role !== 'admin') {
            query.isApproved = true;
        }
        const postCount = await Posts.count(query);
        const posts = await Posts.find(query, req.select, req.cursor).populate({ path: 'author', select: 'name' });
        const rows = posts.map((post) => post.view());
        const data = { rows, postCount };
        return res.status(200).json(data);

    } catch (error) {
        console.log(`WARNING: ${error}`);
        return res.status(500).json({ Error: 'Server error' });
    }
};


export const getPostById = async (req, res) => {
    try {
        const post = await Posts.findById(req.params.id).populate({ path: 'author', select: 'name' });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        return res.status(200).json(post.view())
    }
    catch (error) {
        console.log(`An ${error} when finding post by id`);
        return res.status(500).json({ Error: 'Server error' });
    }
};


export const getPostWithComments = async (req, res) => {
    try {
        console.log('REQ.PARAMS.ID-------CHECK TYPE\n', req.params.id, typeof req.params.id);

        const pipeline = [
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author',
                }
            },
            {
                $unwind: { path: '$author' }
            },
            {
                $project: {
                    _id: 1,
                    author: {
                        _id: 1,
                        name: 1,
                    },
                    likesCount: 1,
                    isApproved: 1,
                    name: 1,
                    description: 1,
                    pictureUrl: 1,
                    text: 1,
                    createdAt: 1,
                    updatedAt: 1,
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'post',
                    as: 'comments',
                }
            },
            {
                $unwind: {
                    path: '$comments'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'comments.author',
                    foreignField: '_id',
                    as: 'comments.author'
                }
            },
            {
                $unwind: {
                    path: '$comments.author'
                }
            },
            {
                $project: {
                    _id: 1,
                    author: 1,
                    likesCount: 1,
                    isApproved: 1,
                    name: 1,
                    description: 1,
                    pictureUrl: 1,
                    text: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    comments: {
                        _id: 1,
                        text: 1,
                        likesCount: 1,
                        dislikesCount: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        author: {
                            _id: 1,
                            name: 1,
                        },
                    },
                },
            },
            {
                $group: {
                    _id: '$_id',
                    author: { $first: '$author' },
                    likesCount: { $first: '$likesCount' },
                    isApproved: { $first: '$isApproved' },
                    name: { $first: '$name' },
                    description: { $first: '$description' },
                    pictureUrl: { $first: '$pictureUrl' },
                    text: { $first: '$text' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                    comments: { $push: '$comments' }
                }
            },
              {
                $replaceRoot: {
                    newRoot: {
                        _id: "$_id",
                        author: "$author",
                        likesCount: "$likesCount",
                        isApproved: "$isApproved",
                        name: "$name",
                        description: "$description",
                        pictureUrl: "$pictureUrl",
                        text: "$text",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                        comments: "$comments"
                    }
                }
            },
        ];

        const post = await Posts.aggregate(pipeline);

        if (!post[0]) {
            return res.status(404).json({ message: 'Post not found' });
        }

        return res.status(200).json(...post);
    } catch (error) {
        console.log(`WARNING: ${error}`);
    }
};


export const getCurrentUserPosts = async (req, res) => {
    try {
        const approvedCondition = req.query.isApproved;
        const currentUser = req.user._id;
        let userQuery = { author: currentUser }
        if (approvedCondition === 'true') {
            userQuery.isApproved = true;
        }
        else if (approvedCondition === 'false') {
            userQuery.isApproved = false;
        }
        const posts = await Posts.find(userQuery).populate({ path: 'author', select: 'name' });
        const postsCount = await Posts.count(userQuery);
        const rows = posts.map((post) => post.view());
        const data = { rows, postsCount };
        return res.status(200).json(data);
    } catch (error) {
        console.log(`An ${error} when finding posts by current user`);
        return res.status(500).json({ "Error": error.message });
    }
};


export const createPost = async ({ user, body }, res) => {
    try {
        if (user.role === 'admin') {
            body.isApproved = true;
        }
        body.author = user._id;
        const post = await Posts.create(body);
        return res.status(200).json(post.view());
    } catch (error) {
        console.log(`An ${error} when creating post`);
        return res.status(500).json({ Error: error.message });
    }
};


export const updatePost = async (req, res) => {
    try {
        const result = await Posts.findById(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Post not found' });
        }
        Object.assign(result, req.body).save();
        return res.status(200).json({
            _id: `${result._id}`,
            isApproved: `${result.isApproved}`,
            message: `Post ${result._id} was succesfully updated, new status 'isApproved': ${result.isApproved}`
        });
    } catch (error) {
        console.log(`An ${error} when updating post`);
        return res.status(500).json({ Error: 'Server error' });
    }
};


export const approvePost = async ({ user, body, params }, res) => {
    try {
        if (user.role !== 'admin') {
            return res.status(401).json('You can\'t approve other user\'s posts');
        }
        const result = await Posts.findById(params.id).populate({ path: 'author', select: 'name' });
        if (!result) {
            return res.status(404).json({ message: 'Post not found' });
        }
        Object.assign(result, body).save();
        return res.status(200).json({
            _id: `${params.id}`,
            isApproved: `${body.isApproved}`,
            message: `Post ${params.id} was succesfully updated, new status 'isApproved': ${body.isApproved}`
        });
    } catch (error) {
        console.log(`Error: ${error}`);
        return res.status(500).json({ Error: "Server error" });
    }
};


export const deletePost = async (req, res) => {
    try {
        const post = await Posts.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        post.remove();
        return res.status(204).json({ message: 'Post was deleted succesfully' });
    } catch (error) {
        console.log(`An ${error} when deleting post`);
        return res.status(500).json({ Error: 'Server error' });
    }
};