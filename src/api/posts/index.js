import { Router } from "express";
import { middleware as query } from "querymen";
import { middleware as body } from "bodymen";
import { getAllPosts, getPostById, createPost, updatePost, deletePost, approvePost, getCurrentUserPosts, getPostWithComments } from "./controller";
import { schema } from "./model"; 
export Posts, { schema } from "./model";
import { token } from "../../services/passport";

const { name, description, picture, text } = schema.tree;

const router = new Router();

router.get('/',
    token({ required: true }),
    query(),
    getAllPosts);

router.get('/myPosts',
    token({ required: true }),
    getCurrentUserPosts);

router.get('/:id', query(), getPostById);

router.get('/:id/comments',
    token({ required: true }),
    query(),
    getPostWithComments);

router.post('/',
    token({ required: true }),
    body({ name, description, picture, text }),
    createPost);

router.put('/:id', body({ name, picture }), updatePost);

router.put('/approve-post/:id',
    token({ required: true, users: ['admin'] }),
    query(),
    approvePost);

router.delete('/:id', deletePost);

export default router;