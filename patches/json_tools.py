# Local replacement for mlx_vlm/tools/parsers/json_tools.py (mlx-vlm 0.8.0).
#
# With Apertus 1.5 the server's text for a tool call arrives with one closing
# brace missing, e.g. {"name": "x", "arguments": {"a": 1}  -- the model itself
# emits valid JSON. The stock parser then fails: non-streaming requests return
# the call as plain text, and streaming requests can abort with a 500.
# This version retries with the missing closing braces appended.

import json

tool_call_start = "<tool_call>"

tool_call_end = "</tool_call>"


def parse_tool_call(text, tools=None):
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        missing = text.count("{") - text.count("}")
        if 0 < missing <= 2:
            return json.loads(text + "}" * missing)
        raise
