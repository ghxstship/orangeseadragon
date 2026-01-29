import type { SlackMessage, SlackMessageResult, SlackChannel, SlackBlock } from './types';

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_API_URL = 'https://slack.com/api';

export class SlackService {
  private getHeaders(): HeadersInit {
    if (!SLACK_BOT_TOKEN) {
      throw new Error('SLACK_BOT_TOKEN environment variable is not set');
    }
    return {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }

  async sendMessage(params: SlackMessage): Promise<SlackMessageResult> {
    try {
      const response = await fetch(`${SLACK_API_URL}/chat.postMessage`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          channel: params.channel,
          text: params.text,
          blocks: params.blocks,
          thread_ts: params.thread_ts,
          unfurl_links: params.unfurl_links ?? false,
          unfurl_media: params.unfurl_media ?? true,
        }),
      });

      const data = await response.json() as { ok: boolean; ts?: string; channel?: string; error?: string };

      if (data.ok) {
        return { success: true, ts: data.ts, channel: data.channel };
      }

      return { success: false, error: data.error || 'Unknown error' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendNotification(
    channel: string,
    title: string,
    message: string,
    color?: 'good' | 'warning' | 'danger'
  ): Promise<SlackMessageResult> {

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: { type: 'plain_text', text: title, emoji: true },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: message },
      },
    ];

    if (color) {
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Status: ${color === 'good' ? '✅' : color === 'warning' ? '⚠️' : '❌'}`,
          },
        ],
      } as SlackBlock);
    }

    return this.sendMessage({
      channel,
      text: `${title}: ${message}`,
      blocks,
    });
  }

  async sendApprovalRequest(
    channel: string,
    title: string,
    description: string,
    approveUrl: string,
    rejectUrl: string
  ): Promise<SlackMessageResult> {
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: { type: 'plain_text', text: `🔔 ${title}`, emoji: true },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: description },
      },
      { type: 'divider' },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Approve', emoji: true },
            style: 'primary',
            url: approveUrl,
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '❌ Reject', emoji: true },
            style: 'danger',
            url: rejectUrl,
          },
        ],
      },
    ];

    return this.sendMessage({
      channel,
      text: `Approval Request: ${title}`,
      blocks,
    });
  }

  async getChannels(): Promise<{ channels: SlackChannel[]; error?: string }> {
    try {
      const response = await fetch(
        `${SLACK_API_URL}/conversations.list?types=public_channel,private_channel&limit=200`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      const data = await response.json() as {
        ok: boolean;
        channels?: Array<{ id: string; name: string; is_private: boolean; is_member: boolean }>;
        error?: string;
      };

      if (data.ok && data.channels) {
        return {
          channels: data.channels.map((ch) => ({
            id: ch.id,
            name: ch.name,
            is_private: ch.is_private,
            is_member: ch.is_member,
          })),
        };
      }

      return { channels: [], error: data.error || 'Unknown error' };
    } catch (error) {
      return {
        channels: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async updateMessage(
    channel: string,
    ts: string,
    text: string,
    blocks?: SlackBlock[]
  ): Promise<SlackMessageResult> {
    try {
      const response = await fetch(`${SLACK_API_URL}/chat.update`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ channel, ts, text, blocks }),
      });

      const data = await response.json() as { ok: boolean; ts?: string; channel?: string; error?: string };

      if (data.ok) {
        return { success: true, ts: data.ts, channel: data.channel };
      }

      return { success: false, error: data.error || 'Unknown error' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async deleteMessage(channel: string, ts: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${SLACK_API_URL}/chat.delete`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ channel, ts }),
      });

      const data = await response.json() as { ok: boolean; error?: string };

      return { success: data.ok, error: data.ok ? undefined : data.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const slackService = new SlackService();
