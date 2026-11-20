# 6. Optional: Apertus 1.5 70B

Status: **planned**, and optional. Do this only after the 8B setup works.

## The problem

No published quantization of the 70B fits in 64 GB:

| Build | Size |
|---|---|
| [sbaechler/Apertus-v1.5-70B-FP8-mlx](https://huggingface.co/sbaechler/Apertus-v1.5-70B-FP8-mlx) | 77 GB |
| [sbaechler/Apertus-v1.5-70B-FP6-mlx](https://huggingface.co/sbaechler/Apertus-v1.5-70B-FP6-mlx) | 59 GB |
| SinclairSchneider W4A16, ninabot NVFP4 | vLLM / NVIDIA formats, not usable on a Mac |

A 4-bit MLX build would be about 41 GB (estimate from the 145 GB bf16 size at ~4.5 bits per weight). That fits under the default ~48 GB GPU limit with a few GB left for context, so the context window has to stay small.

## Steps

1. Create or use a Hugging Face account, accept the gate on [swiss-ai/Apertus-v1.5-70B](https://huggingface.co/swiss-ai/Apertus-v1.5-70B), then `hf auth login`.
2. Download the original weights: 145 GB. Disk has ~849 GB free, so this is fine.
3. Convert and quantize locally to 4-bit:

   ```sh
   mlx_vlm.convert --hf-path swiss-ai/Apertus-v1.5-70B \
     --mlx-path ~/apertus/models/Apertus-v1.5-70B-MLX-4bit -q --q-bits 4
   ```

   To verify: that the converter handles the `apertus1p5` architecture with the patch from step 2.3, and how much memory the conversion itself needs. Conversion streams the weights shard by shard, so it should not need all 145 GB in memory, but this has to be confirmed.
4. Run with a limited context (start at 8k) and watch memory pressure.
5. If memory is too tight, the GPU limit can be raised with `sudo sysctl iogpu.wired_limit_mb=<MB>`. This resets on reboot and leaves less for the rest of the system.
6. Delete the 145 GB original afterwards if disk space is wanted back.

## Expectations

- Generation will be much slower than the 8B, likely single-digit to low double-digit tokens per second. To be measured.
- 4-bit is a coarser quantization than the 8-bit used for the 8B. Whether 70B at 4-bit beats 8B at 8-bit for the intended use is the question this phase answers.

## Checklist

- [ ] Gate accepted, logged in
- [ ] Download complete
- [ ] Conversion succeeded, output size recorded
- [ ] Loads and answers with 8k context
- [ ] Numbers added to [04-benchmarks](04-benchmarks.md)
- [ ] Side-by-side quality comparison with the 8B
