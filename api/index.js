import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }
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
}
