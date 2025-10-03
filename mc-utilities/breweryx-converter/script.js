document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("brewForm");
    const output = document.getElementById("output");

    // Ingredients
    const ingredientsContainer = document.getElementById("ingredientsContainer");
    const addIngredientBtn = document.getElementById("addIngredientBtn");

    addIngredientBtn.addEventListener("click", () => {
        const div = document.createElement("div");
        div.className = "ingredient-row";
        div.innerHTML = `
            <input type="text" class="ingredient-item" placeholder="Item Name (e.g. Apple)" required />
            <input type="number" class="ingredient-amount" placeholder="Amount" min="1" required />
            <button type="button" class="removeIngredientBtn" title="Remove ingredient">✖</button>
        `;
        ingredientsContainer.appendChild(div);
    });

    ingredientsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("removeIngredientBtn")) {
            e.target.parentElement.remove();
        }
    });

    // Lore lines
    const loreContainer = document.getElementById("loreContainer");
    const addLoreBtn = document.getElementById("addLoreBtn");

    addLoreBtn.addEventListener("click", () => {
        const div = document.createElement("div");
        div.className = "lore-row";
        div.innerHTML = `
            <select class="lore-quality">
                <option value="">(always)</option>
                <option value="+">Bad (+)</option>
                <option value="++">Normal (++ )</option>
                <option value="+++">Good (+++)</option>
            </select>
            <input type="text" class="lore-text" placeholder="Lore text" />
            <button type="button" class="removeLoreBtn" title="Remove lore line">✖</button>
        `;
        loreContainer.appendChild(div);
    });

    loreContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("removeLoreBtn")) {
            e.target.parentElement.remove();
        }
    });

    // Server commands
    const serverCommandsContainer = document.getElementById("serverCommandsContainer");
    const addServerCommandBtn = document.getElementById("addServerCommandBtn");

    addServerCommandBtn.addEventListener("click", () => {
        const div = document.createElement("div");
        div.className = "servercommand-row";
        div.innerHTML = `
            <select class="servercommand-quality">
                <option value="">(always)</option>
                <option value="+">Bad (+)</option>
                <option value="++">Normal (++ )</option>
                <option value="+++">Good (+++)</option>
            </select>
            <input type="text" class="servercommand-text" placeholder="Command text" />
            <button type="button" class="removeServerCommandBtn" title="Remove command">✖</button>
        `;
        serverCommandsContainer.appendChild(div);
    });

    serverCommandsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("removeServerCommandBtn")) {
            e.target.parentElement.remove();
        }
    });

    // Player commands
    const playerCommandsContainer = document.getElementById("playerCommandsContainer");
    const addPlayerCommandBtn = document.getElementById("addPlayerCommandBtn");

    addPlayerCommandBtn.addEventListener("click", () => {
        const div = document.createElement("div");
        div.className = "playercommand-row";
        div.innerHTML = `
            <select class="playercommand-quality">
                <option value="">(always)</option>
                <option value="+">Bad (+)</option>
                <option value="++">Normal (++ )</option>
                <option value="+++">Good (+++)</option>
            </select>
            <input type="text" class="playercommand-text" placeholder="Command text" />
            <button type="button" class="removePlayerCommandBtn" title="Remove command">✖</button>
        `;
        playerCommandsContainer.appendChild(div);
    });

    playerCommandsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("removePlayerCommandBtn")) {
            e.target.parentElement.remove();
        }
    });

    // Potion effects
    const effectsContainer = document.getElementById("effectsContainer");
    const addEffectBtn = document.getElementById("addEffectBtn");

    addEffectBtn.addEventListener("click", () => {
        const div = document.createElement("div");
        div.className = "effect-row";
        div.innerHTML = `
            <input type="text" class="effect-name" placeholder="Effect Name (e.g. FIRE_RESISTANCE)" required />
            <input type="text" class="effect-level" placeholder="Level or range (e.g. 1 or 1-3)" required />
            <input type="text" class="effect-duration" placeholder="Duration or range in seconds (e.g. 30 or 10-50)" required />
            <button type="button" class="removeEffectBtn" title="Remove effect">✖</button>
        `;
        effectsContainer.appendChild(div);
    });

    effectsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("removeEffectBtn")) {
            e.target.parentElement.remove();
        }
    });

    // Form submit
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const brewKey = form.brewKey.value.trim();
        const nameBad = form.nameBad.value.trim();
        const nameNormal = form.nameNormal.value.trim();
        const nameGood = form.nameGood.value.trim();
        const difficulty = form.difficulty.value.trim();
        const cookingtime = form.cookingtime.value.trim();

        if (!brewKey || !nameNormal || !difficulty || !cookingtime) {
            alert("Please fill in all required fields (Brew Key, Normal Name, Difficulty, Cooking Time).");
            return;
        }

        // Compose name field
        let nameField = "";
        if (nameBad || nameGood) {
            // Compose with slashes
            // Fill missing parts with nameNormal to avoid empty parts
            const bad = nameBad || nameNormal;
            const good = nameGood || nameNormal;
            nameField = `${bad}/${nameNormal}/${good}`;
        } else {
            // Only one name
            nameField = nameNormal;
        }


        // Ingredients
        const ingredientRows = ingredientsContainer.querySelectorAll(".ingredient-row");
        let ingredients = [];
        for (const row of ingredientRows) {
            let item = row.querySelector(".ingredient-item").value.trim();
            const amount = row.querySelector(".ingredient-amount").value.trim();
            if (item && amount) {
                item = item.toUpperCase();
                ingredients.push(`${item}/${amount}`);
            }
        }
        if (ingredients.length === 0) {
            alert("Please add at least one ingredient with item and amount.");
            return;
        }

        // Optional fields
        const distillruns = form.distillruns.value.trim();
        const distilltime = form.distilltime.value.trim();
        const wood = form.wood.value;
        const age = form.age.value.trim();
        const color = form.color.value.trim();
        const alcohol = form.alcohol.value.trim();
        const drinkmessage = form.drinkmessage.value.trim();
        const drinktitle = form.drinktitle.value.trim();
        const glint = form.glint.value;

        // Custom Model Data
        const cmdBad = form.cmdBad.value.trim();
        const cmdNormal = form.cmdNormal.value.trim();
        const cmdGood = form.cmdGood.value.trim();
        let customModelData = "";
        if (cmdBad || cmdNormal || cmdGood) {
            const bad = cmdBad || "0";
            const normal = cmdNormal || bad;
            const good = cmdGood || normal;
            customModelData = `${bad}/${normal}/${good}`;
        }

        // Lore lines
        const loreRows = loreContainer.querySelectorAll(".lore-row");
        let loreLines = [];
        for (const row of loreRows) {
            const quality = row.querySelector(".lore-quality").value;
            const text = row.querySelector(".lore-text").value.trim();
            if (text) {
                loreLines.push(`${quality} ${text}`.trim());
            }
        }

        // Server commands
        const serverCommandRows = serverCommandsContainer.querySelectorAll(".servercommand-row");
        let serverCommands = [];
        for (const row of serverCommandRows) {
            const quality = row.querySelector(".servercommand-quality").value;
            const text = row.querySelector(".servercommand-text").value.trim();
            if (text) {
                serverCommands.push(`${quality} ${text}`.trim());
            }
        }

        // Player commands
        const playerCommandRows = playerCommandsContainer.querySelectorAll(".playercommand-row");
        let playerCommands = [];
        for (const row of playerCommandRows) {
            const quality = row.querySelector(".playercommand-quality").value;
            const text = row.querySelector(".playercommand-text").value.trim();
            if (text) {
                playerCommands.push(`${quality} ${text}`.trim());
            }
        }

        // Effects
        const effectRows = effectsContainer.querySelectorAll(".effect-row");
        let effects = [];
        for (const row of effectRows) {
            const name = row.querySelector(".effect-name").value.trim();
            const level = row.querySelector(".effect-level").value.trim();
            const duration = row.querySelector(".effect-duration").value.trim();
            if (name && level && duration) {
                effects.push(`${name}/${level}/${duration}`);
            }
        }

        // Build YAML string
        let yml = `${brewKey}:\n`;

        // name
        yml += `  name: ${nameField}\n`;

        // ingredients
        yml += `  ingredients:\n`;
        for (const ing of ingredients) {
            yml += `    - ${ing}\n`;
        }

        // cookingtime
        yml += `  cookingtime: ${cookingtime}\n`;

        // distillruns (only if present or distilltime present)
        if (distillruns || distilltime) {
            yml += `  distillruns: ${distillruns ? distillruns : 0}\n`;
        }

        // distilltime
        if (distilltime) {
            yml += `  distilltime: ${distilltime}\n`;
        }

        // wood
        if (wood) {
            yml += `  wood: ${wood}\n`;
        }

        // age
        if (age) {
            yml += `  age: ${age}\n`;
        }

        // color
        if (color) {
            const isHex = /^[0-9a-fA-F]{6}$/.test(color);
            if (isHex) {
                yml += `  color: '${color}'\n`;
            } else {
                yml += `  color: ${color}\n`;
            }
        }

        // difficulty
        yml += `  difficulty: ${difficulty}\n`;

        // alcohol
        if (alcohol) {
            yml += `  alcohol: ${alcohol}\n`;
        }

        // lore
        if (loreLines.length > 0) {
            yml += `  lore:\n`;
            for (const line of loreLines) {
                // Escape quotes inside text
                const escapedLine = line.replace(/"/g, '\\"');
                yml += `    - "${escapedLine}"\n`;
            }
        }

        // servercommands
        if (serverCommands.length > 0) {
            yml += `  servercommands:\n`;
            for (const cmd of serverCommands) {
                yml += `    - ${cmd}\n`;
            }
        }

        // playercommands
        if (playerCommands.length > 0) {
            yml += `  playercommands:\n`;
            for (const cmd of playerCommands) {
                yml += `    - ${cmd}\n`;
            }
        }

        // drinkmessage
        if (drinkmessage) {
            yml += `  drinkmessage: "${drinkmessage.replace(/"/g, '\\"')}"\n`;
        }

        // drinktitle
        if (drinktitle) {
            yml += `  drinktitle: "${drinktitle.replace(/"/g, '\\"')}"\n`;
        }

        // glint
        if (glint === "true") {
            yml += `  glint: true\n`;
        } else if (glint === "false") {
            yml += `  glint: false\n`;
        }

        // customModelData
        if (customModelData) {
            yml += `  customModelData: ${customModelData}\n`;
        }

        // effects
        if (effects.length > 0) {
            yml += `  effects:\n`;
            for (const eff of effects) {
                yml += `    - ${eff}\n`;
            }
        }

        // Output with .yml code block
        output.textContent = `${yml}`;
    });
});
