const express = require("express");
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// Endpoint to generate YAML file
app.post("/generate", (req, res) => {
    const { id, shapeless, permission, result, lockedLore, ingredients } = req.body;
    
    if (!id) {
        return res.status(400).json({ error: "Recipe ID is required" });
    }

    const yamlData = {
        recipes: [
            {
                id,
                shapeless,
                permission,
                result,
                "locked-lore": lockedLore,
                ingredients: (ingredients || []).map(ingredient => ingredient === "" ? "" : ingredient)
            }
        ]
    };    

    // YAML formatting options to avoid quoting keys and ensure proper structure
    const yamlString = YAML.stringify(yamlData, {
        defaultKeyType: "PLAIN",       // Prevent quotes around keys
        defaultStringType: "QUOTE_DOUBLE"  // Use double quotes only where needed
    });

    const filePath = path.join(__dirname, "storage", `${id}.yml`);

    fs.writeFileSync(filePath, yamlString);
    res.json({ message: "YAML file generated successfully", downloadUrl: `/download/${id}` });
});

// Endpoint to download the YAML file
app.get("/download/:id", (req, res) => {
    const filePath = path.join(__dirname, "storage", `${req.params.id}.yml`);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: "File not found" });
    }
});

// Ensure storage directory exists
if (!fs.existsSync(path.join(__dirname, "storage"))) {
    fs.mkdirSync(path.join(__dirname, "storage"));
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
