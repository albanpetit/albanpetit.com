---
title: "Utiliser PlatformIO dans l'éditeur Zed"
slug: platformio-zed
lang: fr
date: 2026-10-28
description: "Pas d'extension PlatformIO pour Zed ? Pas grave : clangd, un compile_commands.json et quelques tâches suffisent pour coder, compiler et flasher un ESP32."
tags:
  - Firmware
  - ESP32
  - PlatformIO
category: Tutorials
---

PlatformIO est surtout connu comme extension de VS Code, mais tout le travail est fait par sa ligne de commande, `pio`. Zed n'a pas d'extension PlatformIO officielle : il a juste besoin de deux choses pour être confortable sur un firmware ESP32 comme celui de [PaperFlux](/fr/post/paperflux/) :

- **clangd**, le serveur de langage C/C++ que Zed utilise déjà, nourri par un fichier `compile_commands.json` généré par PlatformIO ;
- des **tâches** Zed qui appellent `pio` pour compiler, flasher et ouvrir le moniteur série.

Comptez une dizaine de minutes. On part d'un projet PlatformIO existant (un `platformio.ini` à la racine) et de `pio` installé et accessible dans le `PATH`.

## Ce qui existe côté Zed

Zed gère le C et le C++ nativement avec clangd : complétion, navigation, diagnostics, formatage. Il prend le clangd du système s'il en trouve un, sinon il télécharge le sien.

Côté extensions, la seule qui porte le nom de PlatformIO est une extension communautaire qui ajoute la coloration syntaxique de `platformio.ini`. Elle est utile, mais elle ne lance ni compilation ni upload : pour ça, on passe par les tâches.

## Générer compile_commands.json

Sans base de compilation, clangd ne connaît ni les includes d'Arduino ou d'ESP-IDF, ni les `-D` définis dans `platformio.ini`, et l'éditeur se couvre d'erreurs. PlatformIO sait générer cette base :

```bash
pio run -t compiledb
```

Le fichier `compile_commands.json` est écrit à la racine du projet, là où clangd le cherche par défaut. Relancez la commande à chaque nouvelle bibliothèque dans `lib_deps`, à chaque nouveau fichier source, ou si vous changez d'environnement (`pio run -e esp32-c3 -t compiledb`).

Le fichier contient des chemins absolus propres à votre machine : il n'a rien à faire dans git, pas plus que le cache d'index de clangd.

```gitignore
.pio/
compile_commands.json
.cache/
```

## Brancher clangd sur la toolchain

La compilation passe par le GCC fourni par PlatformIO (`xtensa-esp32-elf-g++`, `riscv32-esp-elf-g++`…), pas par Clang. Pour que clangd trouve les en-têtes système de cette toolchain et la bonne architecture cible, il faut l'autoriser à interroger ce compilateur avec `--query-driver`. Comme cette option fait exécuter le binaire, on la restreint aux toolchains de PlatformIO.

Dans les réglages utilisateur de Zed (`zed: open settings`, fichier `~/.config/zed/settings.json`) :

```json
{
  "lsp": {
    "clangd": {
      "binary": {
        "path": "/opt/homebrew/opt/llvm/bin/clangd",
        "arguments": [
          "--background-index",
          "--query-driver=/Users/moi/.platformio/packages/toolchain-*/bin/*"
        ]
      }
    }
  }
}
```

Remplacez `/Users/moi` par votre dossier personnel : les chemins doivent être absolus, sans `~`. Sur macOS, clangd s'installe avec `brew install llvm` ; sur Linux, c'est souvent `/usr/bin/clangd` après un `apt install clangd`. `which clangd` vous donnera le bon chemin. Je règle `path` explicitement pour être sûr que les `arguments` sont bien pris en compte.

Si vous ne voulez pas toucher aux arguments de clangd, PlatformIO peut aussi écrire les chemins de la toolchain directement dans `compile_commands.json`, via un script ajouté au projet. C'est plus verbeux, mais tout reste dans le dépôt :

```python
# extra_script.py
Import("env")
env.Replace(COMPILATIONDB_INCLUDE_TOOLCHAIN=True)
```

```ini
; platformio.ini
[env:esp32-c3]
extra_scripts = pre:extra_script.py
```

## Faire taire les options GCC inconnues

clangd lit les mêmes options que GCC, et certaines lui sont inconnues : sur ESP32, `-mlongcalls` ou `-fstrict-volatile-bitfields` provoquent une erreur `unknown argument` en tête de chaque fichier. Un fichier `.clangd` à la racine du projet les retire, pour l'éditeur uniquement (la compilation ne change pas) :

```yaml
CompileFlags:
  Remove:
    - -mlongcalls
    - -fstrict-volatile-bitfields
    - -fno-tree-switch-conversion
    - -mtext-section-literals
```

La liste dépend de la puce et du framework : ajoutez-y les options que clangd signale. Pour les appliquer à tous vos projets, le même contenu peut aller dans `~/.config/clangd/config.yaml` (`~/Library/Preferences/clangd/config.yaml` sur macOS).

Après un `editor: restart language server`, la complétion sur `WiFi.`, `Serial.` ou les API d'ESP-IDF fonctionne, et `F12` mène jusqu'aux sources du framework dans `~/.platformio/packages/`.

## Compiler, flasher et surveiller avec des tâches

Reste à piloter `pio` sans quitter l'éditeur. Zed lit les tâches du projet dans `.zed/tasks.json` :

```json
[
  {
    "label": "PIO: Build",
    "command": "pio run",
    "cwd": "$ZED_WORKTREE_ROOT"
  },
  {
    "label": "PIO: Upload",
    "command": "pio run -t upload",
    "cwd": "$ZED_WORKTREE_ROOT"
  },
  {
    "label": "PIO: Upload & Monitor",
    "command": "pio run -t upload -t monitor",
    "cwd": "$ZED_WORKTREE_ROOT",
    "use_new_terminal": true
  },
  {
    "label": "PIO: Monitor",
    "command": "pio device monitor",
    "cwd": "$ZED_WORKTREE_ROOT",
    "use_new_terminal": true
  },
  {
    "label": "PIO: Test",
    "command": "pio test",
    "cwd": "$ZED_WORKTREE_ROOT"
  },
  {
    "label": "PIO: Refresh compile_commands.json",
    "command": "pio run -t compiledb",
    "cwd": "$ZED_WORKTREE_ROOT",
    "hide": "on_success"
  }
]
```

`task: spawn` (`alt-shift-t` par défaut) ouvre la liste des tâches et `task: rerun` relance la dernière. Le moniteur série tourne dans un terminal à part (`use_new_terminal`), pour garder sa sortie pendant qu'on recompile. Sur un projet à plusieurs environnements, ajoutez `-e <nom>` dans les commandes ou dupliquez les tâches par cible.

Pour les tâches les plus fréquentes, un raccourci dans `keymap.json` (`zed: open keymap`) évite même la liste :

```json
[
  {
    "context": "Workspace",
    "bindings": {
      "cmd-alt-b": ["task::Spawn", { "task_name": "PIO: Build" }],
      "cmd-alt-u": ["task::Spawn", { "task_name": "PIO: Upload & Monitor" }]
    }
  }
]
```

<!-- À COMPLÉTER : capture d'écran de Zed avec la complétion clangd et la tâche Upload & Monitor ouverte (servira aussi de main.jpg) -->

## Ce qui manque encore

- **Le débogage** : Zed sait déboguer avec GDB ou CodeLLDB, mais rien ne fait le lien avec les sondes et la configuration de `pio debug`. Pour un pas-à-pas sur la carte, il faut repasser par VS Code ou par `pio debug --interface=gdb` dans un terminal.
- **Le rafraîchissement automatique** : contrairement à l'extension VS Code, rien ne régénère `compile_commands.json` quand `platformio.ini` change. Si clangd ne trouve plus un include, le premier réflexe est la tâche `PIO: Refresh compile_commands.json`.
- **Les fichiers `.ino`** : clangd ne les comprend pas. Mieux vaut un `src/main.cpp` avec `#include <Arduino.h>`, ce qui est de toute façon la structure par défaut d'un projet PlatformIO.

Pour le reste, c'est un éditeur rapide, une complétion qui connaît le framework et trois raccourcis pour compiler, flasher et lire la sortie série : tout ce dont j'ai besoin au quotidien sur un firmware.
