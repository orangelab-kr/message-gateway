import {
  AlimtalkButtonModel,
  AlimtalkButtonType,
  Prisma,
} from '@prisma/client';
import got, { Agents, Got } from 'got';
import { HttpsProxyAgent } from 'hpagent';
import { ProviderInterface, TemplateIncluded } from '..';

export type AligoButtonType = 'DS' | 'WL' | 'AL' | 'BK' | 'MD';
export type AligoButtonTypeName =
  | '배송조회'
  | '웹링크'
  | '앱링크'
  | '봇키워드'
  | '메세지전달';

export interface AligoButtonLink {
  linkMo?: string;
  linkPc?: string;
  linkIos?: string;
  linkAnd?: string;
}

export interface AligoButton {
  name: string;
  linkType: AligoButtonType;
  linkTypeName: AligoButtonTypeName;
  linkMo?: string;
  linkPc?: string;
  linkIos?: string;
  linkAnd?: string;
}

export class AligoProvider implements ProviderInterface {
  private apiKey: string;
  private userId: string;
  private senderKey: string;
  private sender: string;
  private proxy: string | null;
  private token: string | null = null;
  private got: Got;
  public static AligoButtonType: {
    [key: string]: {
      linkType: AligoButtonType;
      linkTypeName: AligoButtonTypeName;
    };
  } = {
    [AlimtalkButtonType.Delivery]: { linkType: 'DS', linkTypeName: '배송조회' },
    [AlimtalkButtonType.Weblink]: { linkType: 'WL', linkTypeName: '웹링크' },
    [AlimtalkButtonType.Applink]: { linkType: 'AL', linkTypeName: '앱링크' },
    [AlimtalkButtonType.Keyword]: { linkType: 'BK', linkTypeName: '봇키워드' },
    [AlimtalkButtonType.Forward]: {
      linkType: 'MD',
      linkTypeName: '메세지전달',
    },
  };

  public constructor(props: any) {
    this.apiKey = props.apiKey;
    this.userId = props.userId;
    this.senderKey = props.senderKey;
    this.sender = props.sender;
    this.proxy = props.proxy;

    let agent: Agents | undefined;
    if (this.proxy) {
      agent = {
        https: new HttpsProxyAgent({
          keepAlive: true,
          keepAliveMsecs: 1000,
          maxSockets: 256,
          maxFreeSockets: 256,
          scheduling: 'lifo',
          proxy: this.proxy,
        }),
      };
    }

    this.got = got.extend({
      prefixUrl: 'https://kakaoapi.aligo.in/akv10/',
      agent,
    });
  }

  private async getToken(expiry = 1): Promise<string | null> {
    if (this.token) return this.token;
    const res = await this.got({
      method: 'POST',
      url: `token/create/${expiry}/h`,
      form: { apikey: this.apiKey, userid: this.userId },
    }).json<{
      code: number;
      message: string;
      token?: string;
      urlencode?: string;
    }>();

    if (res.code !== 0) throw Error(`오류가 발생하였습니다.`);
    if (!res.token) throw Error('서버에서 토큰을 반환하지 않았습니다.');
    setTimeout(() => (this.token = null), expiry * 3600 * 900);
    this.token = res.token;
    return this.token;
  }

  private static transferButton(buttons: AlimtalkButtonModel[]): AligoButton[] {
    const changeToButtonLink = (
      properties: Prisma.JsonValue
    ): AligoButtonLink => <AligoButtonLink>properties;

    return buttons.map((button) => ({
      name: button.name,
      ...this.AligoButtonType[button.type],
      ...changeToButtonLink(button.properties),
    }));
  }

  public async sendMessage(props: {
    phone: string;
    template: TemplateIncluded;
  }): Promise<boolean> {
    console.log(JSON.stringify(props, null, 2));
    return true;
  }
}
