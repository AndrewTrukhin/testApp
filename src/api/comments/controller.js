import { Comments } from '.';
import { Posts } from '../posts/';

export const createComment = async (req, res) => {
    try {
        const post = await Posts.findById(req.params.postId);
        if (!post) {
            return res.status(404).json('Post not found');
        }
        req.body.author = req.user._id;
        req.body.post = req.params.postId;
        try {
            await post.execPopulate({ path: 'author', select: 'name text' });
        } catch (error) {
            console.log(`WARNING: ${error}`);
        }
        const comment = await Comments.create(req.body);
        return res.status(200).json({
            comment: comment.view(true),
            post: post.view(),
            message: 'Comment was successfully created',
        });
    } catch (error) {
        console.log(`WARNING: ${error}`);
    }
};