const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

function chunkArray(arr, size) {
    const results = [];
    for (let i = 0; i < arr.length; i += size) {
        results.push(arr.slice(i, i + size));
    }
    return results;
}

app.post('/getValue', async (req, res) => {
    const ids = req.body.assetIds || [];
    let total = 0;
    let details = [];

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.json({ total: 0, details: [] });
    }

    // Remove duplicates
    const seen = {};
    const cleanIds = ids.filter(id => {
        if (seen[id]) return false;
        seen[id] = true;
        return true;
    });

    // Query in batches (API supports up to 100 at once)
    const chunks = chunkArray(cleanIds, 50);

    try {
        for (const chunk of chunks) {
            // Modern API endpoint (works for UGC, layered, and classic!)
            const resp = await axios.get(
                `https://catalog.roblox.com/v1/catalog/items/details?itemIds=${chunk.join(",")}`
            );
            if (resp.data && resp.data.data) {
                for (const item of resp.data.data) {
                    // Use price for UGC, lowestResalePrice for limiteds, fallback 0
                    let price = item.price || item.lowestResalePrice || 0;
                    // Try to get more readable info for modern items
                    details.push({
                        name: item.name || "Unknown",
                        price,
                        id: item.id,
                        type: item.itemType || "Unknown",
                        creator: item.creator && item.creator.name || undefined,
                        assetType: item.assetType || undefined
                    });
                    total += price;
                }
            }
        }
    } catch (e) {
        // Robust error handling (item may be offsale, deleted, or API may block)
        // No crash, just skip missing data
    }

    res.json({ total, details });
});

app.get('/', (req, res) => {
    res.send('Roblox Flex Value API is running!');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
