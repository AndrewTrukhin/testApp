import { Router } from "express";
import { middleware as body } from "bodymen";
import { schema } from "./model";
export Comments, { schema } from "./model"
import { createComment } from "./controller";
import { token } from "../../services/passport";

const { text } = schema.tree;

const router = new Router();

router.post('/:postId/create-comment',
    token({ required: true }),
    body({ text }),
    createComment);

export default router;