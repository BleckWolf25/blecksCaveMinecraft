# 🛡️ Aetas Ferrea Mod - Realism & Combat Core

> _"Ferrum et Sanguis."_
> _(Iron and Blood.)_

`Aetas Ferrea Mod` is the core mechanics driver designed for hardcore medieval survival. It overhauls Minecraft's combat physics, armor weights, weapon material progression, animal AI, economic systems, and environmental behaviors to inject mechanical friction and realism into every encounter.

Compatible with both players and mobs, this mod ensures that combat is tactical, equipment choice is critical, and survival is earned.

**THIS MOD IS MAINLY FOR AETAS FERREA MODPACK!!!**

<details>
<summary>⭐ Feature Overview</summary>

### ⚒️ Golden Dulling & Innate Enchantments

Gold is heavy, soft, and naturally fragile.

- **Golden Dulling:** Golden weapons, tools, and armor dynamically lose attack damage, attack speed, and block break speed as their durability drops.
- **Innate Enchanting:** To balance their fragility, gold items instantly receive custom Level II enchantments (Looting II, Fortune II, or Protection II) when obtained or spawned on mobs.
- **Hero of the Village:** Wearing a full set of golden armor constantly applies the _Hero of the Village_ status effect.
- **Grindstone Lock:** Innate golden enchantments and custom fantasy armor sets are locked and cannot be disenchanted or processed using a grindstone.

### 🛡️ Physical Armor Realism Matrix

Armor is no longer a simple defense number. Materials now behave like their real-world counterparts under data-driven tags:

- **Arrow Deflection:** Projectiles have a scaling chance to bounce off heavier plates instead of dealing damage (up to **20%** for full Iron, and **60%** for full Diamond).
- **Slashing Immunity:** Heavy iron and diamond armor sets neutralize slash and cut damage from bladed weapons.
- **Blunt/High-Mass Bypass:** Axes and heavy blunt weapons bypass chainmail and iron protections, dealing extra armor-penetrating damage to the wearer.
- **Durability Immunities:** High-tier armors do not lose durability when struck by weak, low-tier weapons (e.g., Diamond vs Wood/Gold).
- **Combat Roll Weight:** Fully integrates with the _Combat Roll_ mod. Heavy armor penalizes your roll count and recharge speed, while leather and light armor grant nimble agility bonuses.
- **Primitive Durability Penalties:** Striking heavy armor plates with wooden or stone weapons inflicts massive durability damage on the attacking primitive weapon.
- **Fist Immunity:** Punching certain heavy armors bare-handed deals exactly **zero** damage to the defender, applying to both players and mobs.

### 🏃 Leather Agility

- **Agricola's Speed:** Leather armor is lightweight and silent. Each piece worn grants **+1.25% movement speed**, capping at a clean **+5%** for a full set.

### 🐎 Equine & Mounted Combat Overhaul

Horses are no longer identical, generic mounts. They are now tactical assets.

- **Class-Based Breeds:** Wild horses are split into five distinct classes: _Wild, Rouncey, Destrier, Courser, and Palfrey_ each with unique attribute caps and distinct stat scaling.
- **Realistic Riding Controls:** Features a sigmoid throttle-based acceleration system, walk-mode speed caps, actual reversing mechanics, and severe fall damage if you jump off at high speeds.
- **Hand-Feeding Taming:** Wild horses and donkeys cannot be broken instantly. They must be leashed and hand-fed daily up to four times using wheat, sugar, hay, apples, or golden carrots until broken.
- **Class Specializations:** Tamed Rounceys accumulate combat and agility XP through use, allowing them to promote and specialize into elite war Destriers, swift Coursers, or docile Palfreys.
- **Custom Saddlebags:** Palfreys, Rounceys, donkeys, and mules can carry chests for custom inventory storage, supporting **9, 27, and 54 slots** respectively.
- **Aquatic Buoyancy:** Mounts realistic sink when heavily loaded with armor or chests. Donkeys will panic and throw riders in deep water, while loyal mules will stay with you even as they drown.

### 🐺 Wolf AI & Pack Defense

Taming an army of wolves is a thing of the past. Wolves are now dangerous predators and strategic, limited companions.

- **Strict Follow Goal:** Replaces vanilla AI with quiet sneaking/stealth behaviors, dynamic target clearing, and anti-stuck teleportation.
- **Aggressive Predators:** Wild wolves have a **25% chance** to spawn as player-hostile predators that actively hunt players within range.
- **Tactical Retreat:** Wolves retreat and gain Speed II when health falls below **30%**. Their combat attacks apply stuns on alternate strikes with brief post-attack slows.
- **Pack Limits:** You are capped at **two active tamed wolves**. Any excess tamed wolves will actively reject the pack, turn into wild predators, and target the owner.
- **Friendly Fire & Prey Drive:** Prevents owner or pack friendly fire unless crouching, and restricts tamed wolves from attacking passive prey unless ordered.
- **Hound Threat Auto-Targeting:** Standing tamed hounds auto-target nearby hostile threats (excluding Creepers) within a 10-block radius.

### ⏳ Regional & Progression Difficulty Engine

The longer you survive, the harsher the world becomes.

- **World Age Mob Caps:** Hostile surface spawns scale based on world days, capping at a tight **12 mobs** early on and expanding to **60** after Day 31.
- **Equipment Progression:** Hostiles spawn completely gearless on Days 0–3, slowly adapt to use shields or stone tools on Days 6–7, and deploy in leather/chainmail scout variants from Day 11 onward.
- **Banishment & Conversion Limits:** Creepers and Witches are permanently banned from the world. Skeletons, Vindicators, and Drowned are banned on Day 0, and villagers cannot be converted to zombies before Day 5.
- **No Baby Zombies:** Automatically ages baby zombies to adults instantly upon spawning.
- **Dragon Progression Smithing Lock:** Prevents smithing legendary endgame gear (such as Ornstein and Dragonslayer armor) until the _Ender Dragon_ advancement is unlocked.
- **End Gate & Wither Catalyst:** The End is locked behind a Wither gate; players must carry a Nether Star or defeat the Wither once to permanently unlock End access.
- **Wither Rebalance:** The Wither receives custom health, explosion, regeneration, and heal-on-kill behavior, making the fight a true progression milestone.

### 🪵 Environmental Balance & Bare-Handed Restrictions

The environment responds realistically to exploitation.

- **Bare-Handed Trauma:** Punching or mining blocks that strictly require tools bare-handed inflicts _Mining Fatigue III_, causes direct health/limb damage, and shatters incorrect tools.
- **Knife Wood-Chopping:** Knives can be used as a slow, emergency alternative to axes to chop logs, consuming high durability but granting a brief burst of _Haste_.
- **Biome-Specific Fishing:** Caught fish drops are strictly locked to their native biomes (e.g., Cod/Salmon in oceans/rivers, Pufferfish in jungles). Fishing in incorrect biomes yields only junk.
- **Squid Protection:** Prevents squids from spawning in unrealistic shallow puddles and actively pushes accidentally beached squids back into water blocks.
- **Spider Spawning Limits:** Spiders can no longer spawn on open plains; they are strictly limited to surface spawns in forest and jungle biomes.
- **Avian & Marine Fatigue:** Pufferfish suffer from inflation stamina limits, forcing them to deflate and cool down. Chickens suffer from wing fatigue, losing their fall drag and taking actual fall damage when dropping more than 8 blocks.
- **Fox Holding Tags:** Wild and tamed foxes can only hold items explicitly specified in the custom `aetasferreamod:fox_holdable` item tag.

### 🪙 Medieval Barter & Progression Economy

Villager trading has been stripped of its modern exploits.

- **Currency Reforms:** Emeralds are completely removed from standard trading. Peasants deal in **Copper**, merchants deal in **Raw Iron**, and mystics or knights demand **Raw Gold** based on profession and level.
- **Material Tier Upgrades:** Villagers will not hand over high-tier gear for raw currency alone. They require you to provide the previous material tier of armor or tools (e.g., trading chainmail + currency to get iron).
- **Wandering Trader Overhaul:** The Wandering Trader is now a premium exotic merchant, offering rare items like saddles, blaze rods, and totems of undying exclusively for premium emeralds.

### 🌋 Thermodynamic Combat

- **Lava Quenching:** Submerging underwater while holding a filled lava bucket instantly quenches the heat, turning it into an empty bucket and spawning an obsidian block directly at your position.
- **Panic Speed:** Caught in flames? Being on fire triggers an adrenaline flight response, granting a temporary movement speed boost of _Speed I_.
- **Burning Weapons:** Designated items registered in the `aetasferreamod:burning_items` tag inflict 5 seconds of burning fire ticks upon targets when attacking.

### 🖥️ Client-Side HUD & Tooltips

- **Jade (Waila) Integration:** Displays detailed custom HUD tooltips for horses, including class name, temper/breaking progress, daily feed count, and specialization training progress.
- **Re-formatted Attribute Tooltips:** Polishes item attribute tooltips to align perfectly with vanilla standards, neatly sorting by slot and cleanly displaying absolute or delta values.

### 🧠 Performance-First Architecture

Designed from the ground up to eliminate overhead:

- All calculations are event-driven rather than ticking every frame.
- Durability checks utilize a `WeakHashMap` to prevent memory leaks.
- Tick events are strictly throttled to run only once per second.

---

## ⚙️ Configuration & GUI Support

Aetas Ferrea includes a dynamic configuration system (`aetasferreamod-common.toml`) to toggle individual modules and adjust deflection rates, speed bonuses, and caps.

**Seamless GUI Integration:**

- **Mod Menu & Configured:** If installed, the mod natively maps its settings to Configured's clean, searchable options menu.
- **YACL (Yet Another Config Lib):** Integrates dynamically to avoid screen handler conflicts.
- **Vanilla Fallback:** If no config UI mods are present, accessing the mod's configuration opens a fallback helper screen guiding you to edit the configuration file manually.

---

## 🛠️ Data-Driven Customization

All weapon categorizations and environmental properties are fully data-driven. Developers and pack makers can easily add custom modded items to the realism matrices by registering them to our item tags:

- `#aetasferreamod:slashing_weapons`
- `#aetasferreamod:high_mass_weapons`
- `#aetasferreamod:blunt_weapons`
- `#aetasferreamod:burning_items`
- `#aetasferreamod:fox_holdable`
- `#aetasferreamod:wooden_weapons`, `#aetasferreamod:iron_weapons`, etc.

---

## 🤝 Special Thanks & Compliance

Special thanks to the developers of the Forge framework and the creators of the libraries that made this mod possible.

- **Modpack Association:** This mod is the core companion developed specifically for the **[Aetas Ferrea Hardcore Medieval Survival Modpack](https://modrinth.com/modpack/aetas-ferrea)**.

---

THE FOLLOWING WEBSITES ARE THE ONLY OFFICIAL WEBSITES THAT HOST AETAS FERREA CONTENT. ALL OTHER WEBSITES ARE NOT ASSOCIATED WITH US AND ANY CLAIMS OF THEM BEING OFFICIAL ARE FALSE. PLEASE AVOID THEM AT ALL COSTS AS THEY MIGHT CONTAIN MALICIOUS CONTENT.

- **[Official GitHub Repository for Aetas Ferrea](https://github.com/BleckWolf25/Aetas-Ferrea)**
- **[Official Modpack Page on Modrinth](https://modrinth.com/modpack/aetas-ferrea)**
- **[Official Modpack Page on CurseForge](https://www.curseforge.com/minecraft/modpacks/aetas-ferrea)**

**Aetas Ferrea is NOT affiliated with or endorsed by Mojang, Microsoft, or any other third party. All other trademarks are the property of their respective owners.**

NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.
