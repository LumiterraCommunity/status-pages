// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { sendFeiShuNotificationWithPost,sendFeiShuNotificationWithText } from '../common/feishu-notification';
import dayjs from 'dayjs';
import { json } from 'stream/consumers';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.send("hello,lumiterra");

    const {message} = req.body;
    console.log("message:",req.query)

    const blockTime = 1717200000;
    await sendFeiShuNotificationWithPost(
        {
            title: "❌ Lumi Layer3 Rollup 出块异常",
            content: [
             [
                {
                    "tag": "text",
                    "text": "上次出块时间：" + dayjs(blockTime * 1000).format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    "tag": "a",
                    "text": "\nGitHub Issue",
                    "href": "https://github.com/LumiterraCommunity/status-pages/issues"
                }
             ]
            ]
        }
    );

    await sendFeiShuNotificationWithText(
        JSON.stringify(req.query)
    );
}