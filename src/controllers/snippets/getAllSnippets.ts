import { Response, NextFunction } from 'express';
import { asyncWrapper } from '../../middleware';
import { SnippetModel, TagModel } from '../../models';
import { UserInfoRequest } from '../../typescript/interfaces';

/**
 * @description Get all snippets
 * @route /api/snippets
 * @request GET
 */
export const getAllSnippets = asyncWrapper(
  async (
    req: UserInfoRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let where = req.user.isAdmin ? {} : { createdBy: req.user.id };

    const snippets = await SnippetModel.findAll({
      include: {
        model: TagModel,
        as: 'tags',
        attributes: ['name'],
        through: {
          attributes: []
        }
      },
      where
    });

    const populatedSnippets = snippets.map(snippet => {
      const rawSnippet = snippet.get({ plain: true });
      let tags: string[] = [];

      if (rawSnippet.tags) {
        // @ts-ignore
        const rawTags = rawSnippet.tags as { name: string }[];
        tags = rawTags.map(tag => tag.name);
      }

      return {
        ...rawSnippet,
        tags
      };
    });

    res.status(200).json({
      data: populatedSnippets
    });
  }
);
