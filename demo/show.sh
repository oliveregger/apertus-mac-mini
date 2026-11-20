#!/bin/bash
printf '\033[2J\033[H\033[?25l'
printf '%s' "$(cat "frames/$1")"
read -r _
