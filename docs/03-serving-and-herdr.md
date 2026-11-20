# 3. Serving, tool calling and herdr

Status: **done on 2026-11-20**. The reboot test of the login service is still open.

The target is chat and tool calling, reachable through [herdr](https://herdr.dev). herdr is a terminal multiplexer for agent CLIs, so the chain is:

```
herdr pane  ->  Pi (agent CLI)  ->  http://127.0.0.1:8080/v1  ->  mlx_vlm.server  ->  Apertus 1.5 8B
```

## 3.1 Server

`mlx_vlm.server` is used rather than `mlx_lm.server`, because the `apertus1p5` architecture lives in mlx-vlm.

```sh
~/apertus/.venv/bin/mlx_vlm.server \
  --model m1rkocasu/Apertus-v1.5-8B-MLX-8bit --host 127.0.0.1 --port 8080
```

It exposes `/v1/chat/completions`, `/v1/models` and `/health`. It is bound to localhost and has no API key. To open it to the network later, add `--api-key` and change `--host`.

## 3.2 Login service

[`launchd/ch.apertus.mlx-server.plist`](../launchd/ch.apertus.mlx-server.plist) starts the server at login and restarts it if it exits. It sets `HF_HUB_OFFLINE=1` so the server never contacts Hugging Face at startup. Log: `~/apertus/logs/server.log`.

```sh
mkdir -p ~/Library/LaunchAgents
cp launchd/ch.apertus.mlx-server.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/ch.apertus.mlx-server.plist
```

Stop and remove:

```sh
launchctl bootout gui/$(id -u)/ch.apertus.mlx-server
```

The model stays loaded, so about 10 GB of memory is in use permanently.

## 3.3 Tool calling

The build's chat template makes the model emit `<tool_call>{"name": …, "arguments": …}</tool_call>`, which the server turns into OpenAI `tool_calls`.

With stock mlx-vlm 0.8.0 this is unreliable:

| Request type | Stock behaviour |
|---|---|
| Non-streaming | The call comes back as plain text in `content` with `tool_calls: null`. Reproduced 5 out of 5 times. |
| Streaming | Often works, but some calls abort the stream with a JSON error (`Expecting ',' delimiter`), and Pi then hangs waiting. |

Cause, as far as traced: the text the server hands to its tool parser has one closing brace missing, for example `{"name": "x", "arguments": {"a": 1}`. The model emits valid JSON; generating directly with `stream_generate` shows the final `}}` token, and the server's parser classes work when fed that text. Where the server's batched generation path loses the brace was **not found**.

Workaround: [`patches/json_tools.py`](../patches/json_tools.py) replaces `mlx_vlm/tools/parsers/json_tools.py` and re-adds missing closing braces before parsing.

```sh
cp patches/json_tools.py ~/apertus/.venv/lib/python3.12/site-packages/mlx_vlm/tools/parsers/json_tools.py
launchctl kickstart -k gui/$(id -u)/ch.apertus.mlx-server
```

With the patch, non-streaming and streaming tool calls both return proper `tool_calls`. Like the architecture copy, it has to be re-applied after an mlx-vlm upgrade. Not reported upstream yet.

A second, unpatched weakness: the model sometimes writes a call in Apertus's native format (`<|tools_prefix|>[…]`), mostly when retrying after a poor tool result. The server does not recognise that, and the call is shown as text.

## 3.4 Pi

```sh
brew install pi-coding-agent      # 1.5.2
herdr integration install pi
```

Config files, copied to `~/.pi/agent/`:

- [`pi/models.json`](../pi/models.json) declares the local endpoint as provider `apertus-local`. It sets the sampling values, maps Pi's thinking switch to `chat_template_kwargs.enable_thinking`, and limits the context to 32,768 tokens.
- [`pi/settings.json`](../pi/settings.json) makes Apertus the default model.

End-to-end test, with only the `read` tool enabled:

```sh
pi -p --no-session --thinking off --tools read \
  "Lies die Datei notiz.txt und sag mir, was der Hauptort ist."
```

Result: Pi called `read` on `notiz.txt`, received the content and answered "Der Hauptort ist Bern."

## 3.5 Use from herdr

Start `pi` in any herdr pane. It opens with Apertus selected; `/model` switches models and `/thinking` toggles reasoning. The herdr integration reports Pi's state (working, waiting, done) to the herdr sidebar.

A recorded session is in [07-demo](07-demo.md).

## 3.6 Context size

The model supports 262,144 tokens. Pi is told 32,768 for now, so that it compacts early and memory stays predictable. Raise `contextWindow` in `models.json` once longer sessions have been observed.

## 3.7 Checklist

- [x] Server answers chat requests
- [x] Tool calls work, with the parser patch
- [x] Pi completes a tool round trip
- [x] herdr integration for Pi installed
- [x] launchd agent installed and running
- [ ] launchd agent survives a reboot
- [x] Interactive Pi session in a herdr pane ([demo](07-demo.md))
- [ ] Multimodal request over the API
- [ ] Report the non-streaming tool-call bug to mlx-vlm
