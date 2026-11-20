# 3. Serving an API

Status: **planned**.

## 3.1 OpenAI-compatible server

```sh
source ~/apertus/.venv/bin/activate
mlx_lm.server --model m1rkocasu/Apertus-v1.5-8B-MLX-8bit --host 127.0.0.1 --port 8080
```

Smoke test:

```sh
curl -s http://127.0.0.1:8080/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [{"role": "user", "content": "Grüezi! Wer bist du?"}],
    "temperature": 0.8, "top_p": 0.9, "max_tokens": 256,
    "chat_template_kwargs": {"enable_thinking": false}
  }'
```

To verify: whether `mlx_lm.server` handles image and audio parts for this model, or whether `mlx_vlm.server` is needed for multimodal requests.

## 3.2 Context size

The model supports 262,144 tokens, but the cache for a long context costs memory on top of the weights. Start with a 32k limit and raise it while watching memory.

## 3.3 Network exposure

Bind to `127.0.0.1` unless other machines need access. The server has no authentication. If it has to be reachable on the LAN, put a reverse proxy with an API key in front of it rather than binding to `0.0.0.0` directly.

## 3.4 Start at login

A `launchd` user agent in `~/Library/LaunchAgents/` that runs the server command with `KeepAlive`. To be written once the command line in 3.1 is confirmed; the plist will be added to this repo under `launchd/`.

## 3.5 Alternative front ends

- [oMLX](https://github.com/jundot/omlx): a menu-bar server that the model card says works without configuration. Its server does not yet accept audio input.
- Open WebUI or any OpenAI-compatible client pointed at `http://127.0.0.1:8080/v1`.

## 3.6 Checklist

- [ ] Server answers the smoke test
- [ ] Multimodal request over the API tested
- [ ] Context limit chosen
- [ ] launchd agent installed and survives a reboot
