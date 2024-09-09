import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch';
import retry from 'async-retry';

const urls = [
    'https://versions-dev.lumiterra.net/GameRes/Release/Android/VersionPolicy.json',
    'https://versions-dev.lumiterra.net/GameRes/Release/IOS/VersionPolicy.json',
    'https://versions-dev.lumiterra.net/GameRes/Release/MacOS/VersionPolicy.json',
    'https://versions-dev.lumiterra.net/GameRes/Release/Windows64/VersionPolicy.json'
];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const fetchWithRetry = async (url: string) => {
        try {
            await retry(async () => {
                const response = await fetch(url);
                if (response.status !== 200) throw new Error(`Status: ${response.status}`);
                await response.json();
                // 重试一次避免网络抖动带来的误差
            }, { retries: 1 });
            return { url, success: true };
        } catch (error) {
            return { url, success: false, error: (error as Error).message };
        }
    };

    const results = await Promise.all(urls.map(fetchWithRetry));
    const failures = results.filter(r => !r.success);

    if (failures.length > 0) {
        console.error("Failed URLs:", failures);
        res.status(500).json({ message: "Some URLs failed", failures });
    } else {
        res.status(200).json({ message: "All URLs succeeded" });
    }
}