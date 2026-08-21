# Surface primitive

This directory will hold shared Material surface rendering behavior.

Compose uses `Surface` as a broad primitive that can combine background, content color, shape, border, elevation, clipping, interaction, and semantics. The web port should preserve the visual/material responsibilities without forcing every component through one generic clickable wrapper.

Expected responsibilities:

- shared surface background/content-role resolution;
- shape and border application;
- elevation rendering;
- reusable visual surface styles for Cards, containers, and related components.

Native interactive semantics remain with the correct element or React Aria primitive (`button`, checkbox, link, etc.). Do not make `Surface` own interaction semantics for every public component.
