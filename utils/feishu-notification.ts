import axios from 'axios';
import retry from 'async-retry';
import crypto from 'crypto';

const feiShuWebhook = 'https://open.feishu.cn/open-apis/bot/v2/hook/1e8d7ce6-a8d7-4dae-b33a-a7a5907b344e';
const secret = 'ZmV6XamWqJTmIgEQUvGgSh'; 

function genSign(secret: string, timestamp: number): string {
  const stringToSign = `${timestamp}\n${secret}`;
  const hmac = crypto.createHmac('sha256', stringToSign);
  const signature = hmac.digest('base64');
  return signature;
}

async function sendFeiShuNotificationWithPost(message: any): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = genSign(secret, timestamp);

  const payload = {
    timestamp: timestamp,
    sign: sign,
    msg_type: 'post',
    content: { post: {
        zh_cn: message
    } }
  };

  await retry(async () => {
    const response = await axios.post(feiShuWebhook,payload)

    if (response.status !== 200) {
      throw new Error(`Failed to send notification: ${response.statusText}`);
    }
  }, { retries: 3 });
}

async function sendFeiShuNotificationWithText(message: any): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000);
    const sign = genSign(secret, timestamp);
  
    const payload = {
      timestamp: timestamp,
      sign: sign,
      msg_type: 'text',
      content: { text: message }
    };
  
    await retry(async () => {
      const response = await axios.post(feiShuWebhook,payload)
  
      if (response.status !== 200) {
        throw new Error(`Failed to send notification: ${response.statusText}`);
      }
    }, { retries: 3 });
}

export { sendFeiShuNotificationWithPost, sendFeiShuNotificationWithText };