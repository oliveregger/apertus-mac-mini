# 4. Benchmarks

Status: **planned**. No measurements yet.

## Method

- Same prompt set for every build: one short question, one ~2k-token summarisation, one image description.
- Record what `mlx_vlm.generate` reports: prompt tokens/s, generation tokens/s, peak memory.
- Three runs each, report the median. Nothing else heavy running on the machine.

## Results

| Date | Build | Runtime + version | Prompt tok/s | Gen tok/s | Peak memory | Notes |
|---|---|---|---|---|---|---|
| | 8B MLX 8-bit | | | | | |
| | 8B MLX 8-bit, thinking off | | | | | |
| | 8B GGUF Q4_K_M | | | | | |
| | 70B MLX 4-bit | | | | | |

## Quality spot checks

A small fixed set of prompts in German, French, Italian, Romansh and English, with the answers saved under `samples/`, so that quantizations can be compared side by side.
