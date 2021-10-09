import {
  AlimtalkButtonModel,
  AlimtalkModel,
  Prisma,
  ProviderModel,
  TemplateModel,
} from '@prisma/client';
import { $$$, prisma, RESULT } from '..';

export type TemplateIncluded = TemplateModel & {
  alimtalk?: AlimtalkModel & { buttons: AlimtalkButtonModel[] };
  provider: ProviderModel;
};

export const TemplateIncludeOptions: Prisma.TemplateModelInclude = {
  alimtalk: { include: { buttons: true } },
  provider: true,
};

export class Template {
  public static async getTemplate(
    templateId: string
  ): Promise<
    () => Prisma.Prisma__TemplateModelClient<TemplateIncluded | null>
  > {
    return () =>
      prisma.templateModel.findFirst({
        where: { templateId },
        include: TemplateIncludeOptions,
      }) as Prisma.Prisma__TemplateModelClient<TemplateIncluded | null>;
  }

  public static async getTemplateOrThrow(
    templateId: string
  ): Promise<TemplateIncluded> {
    const template = await $$$(Template.getTemplate(templateId));
    if (!template) throw RESULT.CANNOT_FIND_TEMPLATE();
    return template;
  }

  public static async getTemplateByName(
    name: string
  ): Promise<
    () => Prisma.Prisma__TemplateModelClient<TemplateIncluded | null>
  > {
    return () =>
      prisma.templateModel.findFirst({
        where: { name },
        include: TemplateIncludeOptions,
      }) as Prisma.Prisma__TemplateModelClient<TemplateIncluded | null>;
  }

  public static async getTemplateByNameOrThrow(
    name: string
  ): Promise<TemplateIncluded> {
    const template = await $$$(Template.getTemplateByName(name));
    if (!template) throw RESULT.CANNOT_FIND_TEMPLATE();
    return template;
  }
}
