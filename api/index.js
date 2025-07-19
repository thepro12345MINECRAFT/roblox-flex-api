const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.post('/getValue', async (req, res) => {
    const ids = req.body.assetIds;
    let total = 0;
    let details = [];
    try {
        const chunks = [];
        for (let i = 0; i < ids.length; i += 50) {
            chunks.push(ids.slice(i, i + 50));
        }
        for (const chunk of chunks) {
            const resp = await axios.get(
                `https://catalog.roblox.com/v1/catalog/items/details?itemIds=${chunk.join(",")}`
            );
            for (const item of resp.data.data) {
                let price = item.price || item.lowestResalePrice || 0;
                total += price;
                details.push({ name: item.name, price, id: item.id });
            }
        }
    } catch (e) {}
    res.json({ total, details });
});

app.get('/', (req, res) => {
    res.send('Roblox Flex Value API is running!');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
