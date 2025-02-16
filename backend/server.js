const express = require("express");
const YAML = require("yaml");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors({
    origin: "https://fruit.slicie.cloud",  // Allow frontend domain
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type"],
    credentials: true
}));

// Endpoint to generate YAML file (direct response, no storage)
app.post("/generate", (req, res) => {
    const {
        id = "",
        shapeless = false,
        permission = "",
        result = "",
        lockedLore = [],
        ingredients = []
    } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Recipe ID is required" });
    }

    // Ensure ingredients is an array and properly formatted
    const formattedIngredients = Array.isArray(ingredients)
        ? ingredients.map(ingredient => ingredient === "" ? '""' : ingredient)
        : [];

    const yamlData = {
        recipes: [
            {
                id, // ✅ Unquoted ID
                shapeless,
                permission,
                result,
                "locked-lore": lockedLore,
                ingredients: formattedIngredients
            }
        ]
    };

    // Convert to YAML, ensuring unquoted ID
    const yamlString = YAML.stringify(yamlData, {
        defaultKeyType: "PLAIN", // ✅ Prevents quoting keys like `id`
        defaultStringType: "QUOTE_DOUBLE" // Ensures double quotes only when needed
    });

    res.setHeader("Content-Disposition", `attachment; filename="${id}.yml"`);
    res.setHeader("Content-Type", "application/x-yaml");
    res.send(yamlString); // ✅ Sends the YAML directly for download
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
