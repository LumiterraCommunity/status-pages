// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { sendFeiShuNotificationWithPost,sendFeiShuNotificationWithText } from '../../utils/feishu-notification';
import dayjs from 'dayjs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.send("hello,lumiterra");
}
