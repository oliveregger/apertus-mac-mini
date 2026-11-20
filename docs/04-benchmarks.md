# 4. Benchmarks

Status: **first numbers only**, from single API requests on 2026-11-20. The three-run method below has not been applied yet.

## Method

- Same prompt set for every build: one short question, one ~2k-token summarisation, one image description.
- Record what `mlx_vlm.generate` reports: prompt tokens/s, generation tokens/s, peak memory.
- Three runs each, report the median. Nothing else heavy running on the machine.

## Results

| Date | Build | Runtime + version | Prompt tok/s | Gen tok/s | Peak memory | Notes |
|---|---|---|---|---|---|---|
| 2026-11-20 | 8B MLX 8-bit, tool call | mlx-vlm 0.8.0 server | 485 (278 tokens) | 33.5 | 10.4 GB | single request |
| 2026-11-20 | 8B MLX 8-bit, thinking off | mlx-vlm 0.8.0 server | 592 (77 tokens) | 33.3 | 10.4 GB | single request |
| | 8B GGUF Q4_K_M | | | | | |
| | 70B MLX 4-bit | | | | | |

## Quality spot checks

A small fixed set of prompts in German, French, Italian, Romansh and English, with the answers saved under `samples/`, so that quantizations can be compared side by side.
