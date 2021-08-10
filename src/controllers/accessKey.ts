import { AccessKeyModel, Prisma } from '@prisma/client';
import { $$$, Database, InternalError, Joi, OPCODE } from '../tools';

const { prisma } = Database;

export class AccessKey {
  public static async createAccessKey(props: {
    name: string;
    description?: string;
  }): Promise<() => Prisma.Prisma__AccessKeyModelClient<AccessKeyModel>> {
    const schema = Joi.object({
      name: Joi.string().min(2).max(32).required(),
      description: Joi.string().allow(null).optional(),
    });

    const { name, description } = await schema.validateAsync(props);
    return () =>
      prisma.accessKeyModel.create({
        data: {
          name,
          description,
        },
      });
  }

  public static async getAccessKey(
    accessKeyId: string,
    secretAccessKey?: string
  ): Promise<() => Prisma.Prisma__AccessKeyModelClient<AccessKeyModel | null>> {
    return () =>
      prisma.accessKeyModel.findFirst({
        where: { accessKeyId, secretAccessKey },
      });
  }

  public static async getAccessKeyOrThrow(
    accessKeyId: string,
    secretAccessKey?: string
  ): Promise<AccessKeyModel> {
    const accessKey = await $$$(
      AccessKey.getAccessKey(accessKeyId, secretAccessKey)
    );

    if (!accessKey) {
      throw new InternalError(
        '액세스 키가 올바르지 않습니다.',
        OPCODE.INVALID_ACCESS_KEY
      );
    }

    return accessKey;
  }
}
