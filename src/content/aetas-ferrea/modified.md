## ⚖️ Modified Mod Distribution & Compliance

To integrate specific mechanics and resolve upstream locale errors, this compilation includes modified, custom-patched open-source binaries. In absolute compliance with open-source transparency guidelines, the exact modifications are outlined here:

### ⚙️ Patched Binaries Directory

* **Shield Overhaul** *(Author: ElocinDev)*
  * **Patch Applied:** Fixed an exploitative velocity-stacking calculation bug within the shield bashing physics loop that allowed players to achieve permanent aerial flight states.
* **Legendary Survival Overhaul** *(Author: Legendary_Workshop)*
  * **Patch Applied:** Written and injected a custom Java API compatibility bridge allowing internal mod elements to securely receive and send data manipulation requests directly through KubeJS scripts.
* **Medieval Paintings** *(Author: TheGreatZin)*
  * **Patch Applied:** Resolved a critical JSON formatting syntax error inside the localization manifest that caused all paintings to render as raw unreadable system keys (\