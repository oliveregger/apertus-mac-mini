#!/bin/bash
# Drive Pi in a herdr pane and sample the pane as ANSI frames.
# usage: capture.sh <pane_id> <agent_name> <frames_dir>
PANE=$1; AGENT=$2; OUT=$3
nap() { perl -e "select(undef,undef,undef,$1)"; }
typed() { # type text word by word
  local text=$1 w
  for w in $text; do herdr pane send-text "$PANE" "$w " >/dev/null; nap 0.13; done
}
( i=0; while [ ! -e "$OUT/.stop" ]; do
    printf -v n '%04d' $i
    herdr pane read "$PANE" --source visible --format ansi > "$OUT/f_$n.ansi" 2>/dev/null
    i=$((i+1)); nap 0.25
  done ) &
SAMPLER=$!
nap 2
typed "Grüezi! Erkläre mir in zwei Sätzen, was das Matterhorn ist."
nap 1
herdr pane send-keys "$PANE" Enter >/dev/null
nap 1
herdr agent wait "$AGENT" --until idle --until done --timeout 90000 >/dev/null
nap 3
typed "Search the web: who developed the Apertus language model, and when was it first released?"
nap 1
herdr pane send-keys "$PANE" Enter >/dev/null
nap 1.5
herdr agent wait "$AGENT" --until idle --until done --timeout 120000 >/dev/null
nap 4
touch "$OUT/.stop"; wait $SAMPLER
ls "$OUT" | wc -l
