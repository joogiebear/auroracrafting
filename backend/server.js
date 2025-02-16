const express = require("express");
const YAML = require("yaml");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors({
    origin: "https://fruit.slicie.cloud",
    methods: "POST",
    allowedHeaders: ["Content-Type"],
}));

// Endpoint to generate YAML and send it to the user immediately
app.post("/api/generate", (req, res) => {
    const { id, shapeless, permission, result, lockedLore = [], ingredients = [] } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Recipe ID is required" });
    }

    const yamlData = {
        recipes: [{ id, shapeless, permission, result, "locked-lore": lockedLore, ingredients }]
    };

    const yamlString = YAML.stringify(yamlData, {
        defaultKeyType: "PLAIN",
        defaultStringType: "QUOTE_DOUBLE"
    });

    res.setHeader("Content-Disposition", `attachment; filename="${id}.yml"`);
    res.setHeader("Content-Type", "application/x-yaml");
    res.send(yamlString);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
