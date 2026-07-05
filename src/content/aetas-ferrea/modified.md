## ⚖️ Modified Mod Distribution & Compliance

To specific mechanics integration, and resolve upstream locale errors, this compilation includes modified, custom-patched open-source binaries. In absolute compliance with open-source transparency guidelines, the exact modifications are outlined here:

### ⚙️ Patched Binaries Directory

* **Shield Overhaul** *(Author: ElocinDev)*
  * **Patch Applied:** Fixed an exploitative velocity-stacking calculation bug within the shield bashing physics loop that allowed players to achieve permanent aerial flight states. (This wasn't possible to do with KubeJS)

* **Legendary Survival Overhaul** *(Author: Legendary_Workshop)*
  * **Patch Applied:** Written and injected a custom Java API compatibility bridge allowing internal mod elements to securely receive and send data manipulation requests directly through KubeJS scripts.

* **Medieval Paintings** *(Author: TheGreatZin)*
  * **Patch Applied:** Resolved a critical JSON formatting syntax error inside the `assets/medieval_paintings/lang/en_us.json` localization manifest that caused all paintings to render as raw unreadable system keys (`paint.etc`) rather than localized medieval titles.

* **Combat Roll** *(Author: ZsoltMolnarrr)*
  * **Patch Applied:** Written and injected a custom Java API compatibility bridge, allowing other mods and kubejs manipulation.

> ### 🛑 Legal Disclaimer & Support Notice
> 
> 
> These modifications are maintained independently by the *Aetas Ferrea* development pack author purely to support compatibility. **None of these modifications are endorsed, sponsored, or supported by the original mod authors.** >
> If you encounter crashes, item visual bugs, or script errors involving these MODS, **DO NOT contact or submit bug tracking tickets to the original creators.** All bugs, logs, and issue diagnostics must be submitted exclusively to the *Aetas Ferrea* GitHub Repository.