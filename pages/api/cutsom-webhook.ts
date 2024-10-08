import type { NextApiRequest, NextApiResponse } from 'next'
import { sendFeiShuNotificationWithText } from '../../utils/feishu-notification';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log("req.body:::",req.body)
    res.send("hello,lumiterra");
    await sendFeiShuNotificationWithText(
       JSON.stringify(req.query)
    );

    if(req.body){
        await sendFeiShuNotificationWithText(
            JSON.stringify(req.body)
        );
    }

}