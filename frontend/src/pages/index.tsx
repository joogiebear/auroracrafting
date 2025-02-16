import { useState } from "react";
import axios from "axios";

interface RecipeData {
  id: string;
  shapeless: boolean;
  permission: string;
  result: string;
  lockedLore: string[];
  ingredients: string[];
}

const resultOptions = {
  "EcoItems": "eco:ecoitems:item_id",
  "MythicMobs (Crucible)": "mythicmobs:item_id",
  "MMOItems": "mmoitems:type:id",
  "ExecutableItems": "ei:item_id",
  "ExecutableBlocks": "eb:item_id",
  "Nexo": "nexo:item_id",
  "Oraxen": "oraxen:item_id",
  "ItemsAdder": "ia:ia_namespace:item_id",
  "HeadDatabase": "hdb:id",
  "CustomFishing": "customfishing:id",
  "EcoArmor": "eco:ecoarmor:armor_id",
  "Talismans": "eco:talismans:talisman_id",
  "EcoScrolls": "eco:ecoscrolls_scoll_scrollid"
};

export default function Home() {
  const [id, setId] = useState<string>("");
  const [shapeless, setShapeless] = useState<boolean>(false);
  const [permission, setPermission] = useState<string>("");
  const [selectedResult, setSelectedResult] = useState<string>("");
  const [customResult, setCustomResult] = useState<string>("");
  const [lockedLore, setLockedLore] = useState<string>("");
  const [ingredients, setIngredients] = useState<string>("");

  const handleResultChange = (option: keyof typeof resultOptions) => {
    setSelectedResult(option);
    setCustomResult(resultOptions[option] ?? ""); // Autofill or fallback to empty string
  };

  const formatIngredients = (input: string): string[] => {
    // Ensure there are always 9 lines, even if empty
    const lines = input.split("\n");
    while (lines.length < 9) {
      lines.push(""); // Add empty lines if less than 9
    }
    return lines.slice(0, 9); // Only keep 9 lines max
  };
  
  const handleGenerate = async () => {
    const formattedIngredients = formatIngredients(ingredients);
  
    const recipeData: RecipeData = {
      id,
      shapeless,
      permission,
      result: customResult,
      lockedLore: lockedLore ? lockedLore.split("\n") : [],
      ingredients: formattedIngredients
    };
  
    try {
      const response = await axios.post(
        "https://fruit.slicie.cloud/api/generate",
        recipeData,
        { responseType: "blob" }
      );
  
      // Create a temporary URL for downloading
      const blob = new Blob([response.data], { type: "application/x-yaml" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `${id}.yml`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error generating YAML:", error);
    }
  };
  


  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">Minecraft YAML Generator</h1>

        <div className="mb-3">
          <label className="block text-sm">Recipe ID:</label>
          <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" value={id} onChange={(e) => setId(e.target.value)} />
        </div>

        <div className="mb-3 flex items-center">
          <label className="text-sm mr-2">Shapeless:</label>
          <button
            className={`px-3 py-1 rounded ${shapeless ? "bg-green-500" : "bg-red-500"}`}
            onClick={() => setShapeless(!shapeless)}
          >
            {shapeless ? "Yes" : "No"}
          </button>
        </div>

        <div className="mb-3">
          <label className="block text-sm">Permission:</label>
          <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" value={permission} onChange={(e) => setPermission(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="block text-sm">Select Result Type:</label>
          <select className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            onChange={(e) => handleResultChange(e.target.value as keyof typeof resultOptions)}
            value={selectedResult}
          >
            <option value="">-- Select an option (optional) --</option>
            {Object.keys(resultOptions).map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm">Result Item:</label>
          <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" value={customResult} onChange={(e) => setCustomResult(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="block text-sm">Locked Lore (one per line):</label>
          <textarea className="w-full p-2 rounded bg-gray-700 border border-gray-600 h-20" value={lockedLore} onChange={(e) => setLockedLore(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="block text-sm">Ingredients (one per line, up to 9):</label>
          <textarea
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 h-32"
            value={ingredients}
            onChange={(e) => setIngredients(formatIngredients(e.target.value).join("\n"))}
            placeholder='Enter ingredients, leave empty slots for ""'
            style={{
              lineHeight: "1.5",
              whiteSpace: "pre-wrap"
            }}
          />
        </div>
        F

        <button onClick={handleGenerate} className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded font-bold mt-4">
          Generate YAML
        </button>
      </div>
    </div>
  );
}
