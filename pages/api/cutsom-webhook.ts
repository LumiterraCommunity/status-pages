import type { NextApiRequest, NextApiResponse } from 'next'
import { sendFeiShuNotificationWithText } from '../../utils/feishu-notification';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log("req.body:::",req.body)
    console.log("req.query:::",req.query)
    res.send("hello,lumiterra");
    if(req.query){
      await sendFeiShuNotificationWithText(
       JSON.stringify(req.query)
    );
    }

    if(req.body){
        await sendFeiShuNotificationWithText(
            JSON.stringify(req.body)
        );
    }

}