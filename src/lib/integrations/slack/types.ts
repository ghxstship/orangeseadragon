export interface SlackBlock {
  type: 'section' | 'divider' | 'header' | 'context' | 'actions' | 'image';
  text?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
    emoji?: boolean;
  };
  fields?: Array<{
    type: 'plain_text' | 'mrkdwn';
    text: string;
  }>;
  accessory?: Record<string, unknown>;
  elements?: Array<Record<string, unknown>>;
  image_url?: string;
  alt_text?: string;
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: SlackBlock[];
  thread_ts?: string;
  unfurl_links?: boolean;
  unfurl_media?: boolean;
}

export interface SlackMessageResult {
  success: boolean;
  ts?: string;
  channel?: string;
  error?: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
}
