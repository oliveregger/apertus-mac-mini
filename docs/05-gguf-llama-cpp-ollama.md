# 5. Optional: GGUF with llama.cpp or Ollama

Status: **planned**, and optional. Only worth doing if a tool in the chain needs Ollama or llama.cpp specifically.

## Why this is the second choice

- The only multimodal 1.5 GGUF found is [faruk-zahiragic/Apertus-v1.5-8B-GGUF](https://huggingface.co/faruk-zahiragic/Apertus-v1.5-8B-GGUF), in Q4_K_M only. That is a lower-quality quantization than the 8-bit MLX build.
- Its card says it needs an Apertus-compatible llama.cpp fork at commit `442b0444168a0f72788b40a16c8289bd1eb217f5` and does not say where that fork lives. Stock llama.cpp and Ollama may not load it.
- The card states there are no measured Apple Silicon results.

## Things to try, in order

1. Ollama, already installed (0.40.16):

   ```sh
   brew services start ollama
   ollama run hf.co/faruk-zahiragic/Apertus-v1.5-8B-GGUF:Q4_K_M
   ```

   If it fails with an unknown-architecture error, Ollama's bundled llama.cpp lacks Apertus 1.5 support. Record the error and stop here.

2. Stock llama.cpp:

   ```sh
   brew install llama.cpp
   llama-server -hf faruk-zahiragic/Apertus-v1.5-8B-GGUF:Q4_K_M
   ```

3. Text-only at higher quality: [andreasmartin/apertus-v1.5-8b-text-Q8_0-GGUF](https://huggingface.co/andreasmartin/apertus-v1.5-8b-text-Q8_0-GGUF) (8.6 GB), which drops the vision and audio towers and so may load in stock llama.cpp.

4. Image and audio need the second file, `apertus-v1.5-8b-mmproj-F32.gguf`, passed with `--mmproj`. The card refers to `docs/MULTIMODAL.md` in its source repository for details.

## Checklist

- [ ] Ollama result recorded (works / error text)
- [ ] llama.cpp result recorded
- [ ] If working: numbers added to [04-benchmarks](04-benchmarks.md)
