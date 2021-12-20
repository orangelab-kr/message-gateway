import {
  AlimtalkButtonModel,
  AlimtalkButtonType,
  Prisma,
} from '@prisma/client';
import got, { Agents, Got } from 'got';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';
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

export interface AligoKakaoResult {
  code: number;
  message: string;
  info?: {
    type: string;
    mid: number;
    current: string;
    unit: number;
    total: number;
    scnt: number;
    fcnt: number;
  };
}

export interface AligoKakaoTokenResult {
  code: number;
  message: string;
  token?: string;
  urlencode?: string;
}

export interface AligoSMSResult {
  result_code: string;
  message: string;
  msg_id: number;
  success_cnt: number;
  error_cnt: number;
  msg_type: string;
}

export class AligoProvider implements ProviderInterface {
  private apiKey: string;
  private userId: string;
  private senderKey: string;
  private sender: string;
  private proxy: string | null;
  private token: string | null = null;
  private got: Got;

  private smsEndpoint = 'https://apis.aligo.in';
  private kakaoEndpoint = 'https://kakaoapi.aligo.in/akv10';
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
    this.got = got.extend({
      headers: { 'User-Agent': 'Message Gateway' },
      agent: this.getProxyAgentForGot(),
    });
  }

  private getProxyAgentForGot(): Agents | undefined {
    if (!this.proxy) return;
    return {
      http: new HttpProxyAgent({
        proxy: this.proxy,
      }),
      https: new HttpsProxyAgent({
        proxy: this.proxy,
      }),
    };
  }

  private async getToken(expiry = 1): Promise<string | null> {
    if (this.token) return this.token;
    const res = await this.got({
      method: 'POST',
      url: `${this.kakaoEndpoint}/token/create/${expiry}/h`,
      form: { apikey: this.apiKey, userid: this.userId },
    }).json<AligoKakaoTokenResult>();
    if (res.code !== 0) throw Error(`오류가 발생하였습니다.`);
    if (!res.token) throw Error('서버에서 토큰을 반환하지 않았습니다.');
    setTimeout(() => (this.token = null), expiry * 3600 * 900);
    this.token = res.token;
    return this.token;
  }

  private static transferButtons(
    buttons: AlimtalkButtonModel[]
  ): AligoButton[] {
    const changeToButtonLink = (
      properties: Prisma.JsonValue
    ): AligoButtonLink => <AligoButtonLink>properties;

    return buttons.map((button) => ({
      name: button.name,
      ...this.AligoButtonType[button.type],
      ...changeToButtonLink(button.properties),
    }));
  }

  public sendMessage(props: {
    phone: string;
    template: TemplateIncluded;
  }): Promise<boolean> {
    return props.template.alimtalk
      ? this.sendMessageWithAlimtalk(props)
      : this.sendMessageWithSMS(props);
  }

  private async sendMessageWithAlimtalk(props: {
    phone: string;
    template: TemplateIncluded;
  }): Promise<boolean> {
    const { template } = props;
    if (!template.alimtalk) return false;
    const { alimtalk, message } = template;

    await this.getToken();
    const subject = '메세지가 도착했습니다.';
    const hasFailover = message ? 'Y' : 'N';
    const phone = `0${props.phone.substring(3)}`;
    const { templateId } = <any>alimtalk.properties;
    const button = JSON.stringify({
      button: AligoProvider.transferButtons(alimtalk.buttons),
    });

    const res = await this.got({
      method: 'POST',
      url: `${this.kakaoEndpoint}/alimtalk/send`,
      form: {
        // Credentials
        apikey: this.apiKey,
        userid: this.userId,
        token: this.token,
        senderkey: this.senderKey,
        sender: this.sender,

        // Subjects
        subject_1: subject,
        fsubject_1: subject,

        // Messages
        fmessage_1: message,
        message_1: alimtalk.message,

        receiver_1: phone,
        button_1: button,
        tpl_code: templateId,

        // Options
        failover: hasFailover,
        testmode_yn: 'N',
      },
    }).json<AligoKakaoResult>();
    return res.code === 0;
  }

  private async sendMessageWithSMS(props: {
    phone: string;
    template: TemplateIncluded;
  }): Promise<boolean> {
    const { template } = props;
    if (!template.message) return false;
    const phone = `0${props.phone.substring(3)}`;
    const res = await this.got({
      method: 'POST',
      url: `${this.smsEndpoint}/send`,
      form: {
        // Credentials
        key: this.apiKey,
        user_id: this.userId,
        sender: this.sender,

        // SMS
        receiver: phone,
        msg: template.message,

        // Options
        testmode_yn: 'N',
      },
    }).json<AligoSMSResult>();
    return res.result_code === '1';
  }
}
