// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { sendFeiShuNotificationWithPost,sendFeiShuNotificationWithText } from '../../utils/feishu-notification';
import dayjs from 'dayjs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
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
    
    res.send("hello,lumiterra");

    console.log("message:",req.query)
    console.log("env value:",process.env.FEISHU_SECRET_TEST)
}