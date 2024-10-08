import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers';
import { sendFeiShuNotificationWithPost } from '../common/feishu-notification';
import dayjs from 'dayjs';


const RPC_NODE_URL = 'https://arb-mainnet.g.alchemy.com/v2';
const CONTRACT_ADDRESS = '0x472b72925962fEDcf8E373770A3a08E3F66C7dE1';
const CONTRACT_INTERFACE = [
    'event SequencerBatchDelivered(uint256 indexed batchSequenceNumber, bytes32 indexed beforeAcc, bytes32 indexed afterAcc, bytes32 delayedAcc, uint256 afterDelayedMessagesRead, (uint64, uint64, uint64, uint64) timeBounds, uint8 dataLocation)',
];
// 如果超出MAX_DELAY_TIME，说明出块异常
const MAX_DELAY_TIME = 7200;

let provider: ethers.JsonRpcProvider | null = null;
let contract: ethers.Contract | null = null;



async function _getLastTransactionEvent() {
    const filter = contract.filters.SequencerBatchDelivered();
    const latestBlock = await provider.getBlockNumber();
    const blockRange = 10000;
    // 限制最大的查询次数，防止查询时间过长
    let maxQueryTimes = 10;
    // 从最新的区块开始，逐步向过去的区块查询
    for (let endBlock = latestBlock; endBlock >= 0; endBlock -= blockRange) {
        if (maxQueryTimes < 0) {
            return null;
        }
        const startBlock = Math.max(endBlock - blockRange + 1, 0);
        const events = await contract.queryFilter(filter, startBlock, endBlock);
        if (events.length > 0) {
            return events[events.length - 1];
        }
        maxQueryTimes--;
    }
    return null;
}


async function _init(req: NextApiRequest,) {
    // const apiKey = req.headers['rpc-api-key'] as string || '';
    const apiKey = req.query.rpcApiKey as string || '';
    provider = new ethers.JsonRpcProvider(`${RPC_NODE_URL}/${apiKey}`);
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_INTERFACE, provider);
}


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        await _init(req);
        const lastTransactionEvent = await _getLastTransactionEvent();
        if (!lastTransactionEvent) {
            res.status(403).send("No events found");
        } else {
            const block = await provider.getBlock(lastTransactionEvent.blockNumber);
            const currentTime = Math.floor(Date.now() / 1000);
            if (currentTime - block.timestamp > MAX_DELAY_TIME) {
                res.status(403).send("Too long no block");

                await sendFeiShuNotificationWithPost(
                    {
                        title: "❌ Lumi Layer3 Rollup 出块异常",
                        content: [
                         [
                            {
                                "tag": "text",
                                "text": "上次出块时间：" + dayjs(block.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
                            },
                            {
                                "tag": "a",
                                "text": "GitHub Issue",
                                "href": "https://github.com/LumiterraCommunity/status-pages/issues"
                            }
                         ]
                        ]
                    }
                );
            } else {
                res.send("ok");
            }
        }
    } catch (error) {
        console.log("error:::", error);
        res.status(500).send("Internal server error");
        await sendFeiShuNotification(
            {
                title: "❌ Lumi Layer3 Rollup 监控API异常",
                content: [
                 [
                    {
                        "tag": "text",
                        "text": "error:" + String(error)
                    },
                 ]
                ]
            }
        );
    }
}
