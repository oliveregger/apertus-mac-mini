# Apertus 1.5 on a Mac mini

Setup notes for running the quantized [Apertus 1.5](https://huggingface.co/swiss-ai/Apertus-v1.5-8B) model (ETH Zurich / EPFL / CSCS, Apache 2.0) locally on a Mac mini.

> **Status (2026-11-20):** Apertus 1.5 8B at 8-bit runs on this machine, is served on `http://127.0.0.1:8080/v1`, and is usable for chat and tool calling from Pi inside herdr. Image and audio input, the benchmarks and the 70B model are still open.

## Machine

| | |
|---|---|
| Model | Mac mini, Apple M5 Pro (18 cores) |
| Memory | 64 GB unified |
| Disk | 926 GB, ~849 GB free |
| OS | macOS 27.2.1 |
| Tools | Homebrew, git, gh, uv, Python 3.12 (mise), herdr 0.9.5, Pi 1.5.2, Ollama 0.40.16 (not used) |
| Model runtime | mlx-vlm 0.8.0 and mlx-lm 0.32.2 in `~/apertus/.venv` |

## Decision

Start with **Apertus 1.5 8B at 8-bit on MLX**. It is a 10 GB download, needs no Hugging Face account, uses about 9 GB of the 64 GB, and is the closest quantization to the original weights. The 70B model is a later, optional phase because no ready-made quantization fits this machine.

Details and alternatives: [docs/01-model-selection.md](docs/01-model-selection.md).

## Plan

| # | Step | Doc | Status |
|---|---|---|---|
| 1 | Pick model, quantization and runtime | [01-model-selection](docs/01-model-selection.md) | decided |
| 2 | Install MLX runtime, download 8B 8-bit, first text prompt | [02-setup-mlx](docs/02-setup-mlx.md) | done |
| 3 | Thinking mode on/off | [02-setup-mlx](docs/02-setup-mlx.md) | done |
| 3b | Image and audio input | [02-setup-mlx](docs/02-setup-mlx.md) | open |
| 4 | Serve an API, start at login, tool calling, Pi in herdr | [03-serving-and-herdr](docs/03-serving-and-herdr.md) | done, reboot test open |
| 4b | Demo video: chat and web search tool call in Pi | [07-demo](docs/07-demo.md) | done |
| 5 | Measure tokens/s and memory, record results | [04-benchmarks](docs/04-benchmarks.md) | first numbers only |
| 6 | Optional: GGUF route with llama.cpp or Ollama | [05-gguf-llama-cpp-ollama](docs/05-gguf-llama-cpp-ollama.md) | planned |
| 7 | Optional: Apertus 1.5 70B, self-quantized to 4-bit | [06-apertus-70b](docs/06-apertus-70b.md) | planned |

## Known issues

- mlx-vlm 0.8.0 loses a closing brace in tool-call JSON, which breaks tool calls. A local parser patch works around it; the root cause is not found. Details in [03-serving-and-herdr](docs/03-serving-and-herdr.md#33-tool-calling).
- The `web_search` tool searches Wikipedia only unless a Brave Search API key is set.
- The `apertus1p5` architecture code and the parser patch have to be copied into mlx-vlm again after every mlx-vlm upgrade.

## Open questions

- Is the 70B model wanted? It needs a Hugging Face account with the gate accepted and a 145 GB download.

## Sources

- [Apertus 1.5 announcement (CSCS)](https://www.cscs.ch/science/computer-science-hpc/2026/apertus-15-building-the-next-generation-of-open-ai-infrastructure)
- [swiss-ai/Apertus-v1.5-8B](https://huggingface.co/swiss-ai/Apertus-v1.5-8B) and [swiss-ai/Apertus-v1.5-70B](https://huggingface.co/swiss-ai/Apertus-v1.5-70B)
- [m1rkocasu/Apertus-v1.5-8B-MLX-8bit](https://huggingface.co/m1rkocasu/Apertus-v1.5-8B-MLX-8bit)
- [faruk-zahiragic/Apertus-v1.5-8B-GGUF](https://huggingface.co/faruk-zahiragic/Apertus-v1.5-8B-GGUF)
- [Liip: 6 ways to try Apertus 1.5](https://www.liip.ch/en/blog/apertus-1-5-6-ways-to-try-out-switzerland-s-updated-ai-model)
