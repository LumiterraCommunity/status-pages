import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

// ERC20 标准接口 - balanceOf 函数
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // 从环境变量获取配置
        const rpcUrl = process.env.MONAD_RPC_URL;
        let accountAddress = "";
        if (req.query.monadGameRollupAccountAddress) {
            accountAddress = req.query.monadGameRollupAccountAddress as string;
        } else {
            accountAddress = "0xa11dB99124828BA7a71BB1347b85Aa705E5CE2e3";
        }

        if (!rpcUrl) {
            return res.status(500).json({ 
                error: 'Missing required environment variable: MONAD_RPC_URL' 
            });
        }

        if (!accountAddress) {
            return res.status(400).json({ 
                error: 'Missing required parameter: accountAddress' 
            });
        }

        const network = {
            chainId: 143,
            name: 'monad'
        };
        const provider = new ethers.JsonRpcProvider(rpcUrl, network);
        const balance = await provider.getBalance(accountAddress);

        // 格式化余额（考虑小数位）
        const formattedBalance = ethers.formatEther(balance);

        // 如果低于指定阈值，返回 error
        if (Number(formattedBalance) < 500) {
            return res.status(422).json({ 
                error: 'Balance is below the required threshold' 
            });
        }

        // 返回结果
        res.status(200).json({
            account: accountAddress,
            balance: formattedBalance,
        });
    } catch (error) {
        console.error('Error querying token balance:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: (error as Error).message 
        });
    }
}