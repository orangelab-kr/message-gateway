import {
  AlimtalkButtonModel,
  ProviderModel,
  ProviderType,
} from '@prisma/client';
import Joi from 'joi';
import { Liquid } from 'liquidjs';
import { AligoProvider, RESULT, Template, TemplateIncluded } from '../..';

export * from './aligo';

const liquid = new Liquid();
export interface ProviderInterface {
  sendMessage(props: {
    phone: string;
    template: TemplateIncluded;
  }): Promise<boolean>;
}

export class Provider {
  private static getProviderClass(provider: ProviderModel): ProviderInterface {
    const { providerType, properties } = provider;
    switch (providerType) {
      case ProviderType.Aligo:
        return new AligoProvider(properties);
      default:
        throw Error(`Unknown provider type ${providerType}`);
    }
  }

  public static async sendMessage(props: {
    phone: string;
    name: string;
    fields: any;
  }): Promise<void> {
    const schema = Joi.object({
      phone: Joi.string()
        .regex(/^\+.*$/)
        .required(),
      name: Joi.string().required(),
      fields: Joi.object(),
    });

    const { fields, name, phone } = await schema.validateAsync(props);
    const template = await Template.getTemplateByNameOrThrow(name);
    const { alimtalk, provider, message } = template;
    const providerClass = this.getProviderClass(provider);

    if (message) {
      template.message = await liquid.parseAndRender(message, fields);
    }

    if (alimtalk) {
      alimtalk.buttons = this.renderButtons(alimtalk.buttons, fields);
      alimtalk.message = await liquid.parseAndRender(alimtalk.message, fields);
    }

    const isSuccess = await providerClass.sendMessage({ phone, template });
    if (!isSuccess) throw RESULT.FAILED_SEND_MESSAGE();
  }

  private static renderButtons(
    buttons: AlimtalkButtonModel[],
    fields: any
  ): AlimtalkButtonModel[] {
    const replacePropertieValues = (props: any): any =>
      Object.fromEntries(
        Object.entries(props).map(([key, value]) => {
          key = liquid.parseAndRenderSync(key, fields);
          if (typeof value === 'object') {
            return [key, replacePropertieValues(value)];
          }

          if (typeof value !== 'string') return [key, value];
          return [key, liquid.parseAndRenderSync(value, fields)];
        })
      );

    return buttons.map((button) => {
      button.name = liquid.parseAndRenderSync(button.name, fields);
      button.properties = replacePropertieValues(button.properties);
      return button;
    });
  }
}
