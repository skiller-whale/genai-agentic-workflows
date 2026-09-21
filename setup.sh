#!/usr/bin/env bash
# Runs on every boot of the hosted environment, so keep it idempotent.

# First, get the directory of the current script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set git to use 'main' as the default branch name to avoid warnings
git config --global init.defaultBranch main

# Go into the app directory to set up git
cd "$DIR/app"
git init

if ! grep -q '# agentic_workflows shell setup' /home/learner/.zshrc 2>/dev/null; then
cat << 'EOF' >> /home/learner/.zshrc
# agentic_workflows shell setup
# the adam1 theme would overwrite PROMPT before every prompt
prompt off
export PROMPT=$'%{\e[1m%}🐳 %{\e[1;32m%}%n@%{\e[0m%}:%{\e[1;34m%}%1~%{\e[0m%} $ '
export PATH="$HOME/.local/bin:$PATH"
alias python='python3'
EOF
fi

curl -fsSL https://bun.sh/install | bash

# Install `checkpoint` as a command, and hide it from the learner's repo
mkdir -p /home/learner/.local/bin
git -C "$DIR" show HEAD:checkpoint > /home/learner/.local/bin/checkpoint
chmod +x /home/learner/.local/bin/checkpoint
rm -f "$DIR/checkpoint"

# Skip Claude's first-launch prompts; "trust this folder?" defaults to "No, exit"
python3 - "$DIR/app" << 'EOF'
import json, os, sys
path = os.path.expanduser("~/.claude.json")
config = json.load(open(path)) if os.path.exists(path) else {}
config["hasCompletedOnboarding"] = True
config.setdefault("shiftEnterKeyBindingInstalled", True)
config.setdefault("projects", {}).setdefault(sys.argv[1], {})["hasTrustDialogAccepted"] = True
json.dump(config, open(path, "w"), indent=4)
EOF

# Tell learners who type `checkpoint` into Claude to run it in the terminal
mkdir -p /home/learner/.claude/hooks
cat << 'EOF' > /home/learner/.claude/hooks/checkpoint-guard.py
import json, re, sys

prompt = json.load(sys.stdin).get("prompt", "")
match = re.fullmatch(r"\s*(?:run\s+|/)?checkpoint(?:\s+(\d+))?\s*[.!]?\s*", prompt, re.IGNORECASE)
if match:
    number = match.group(1) or "<number>"
    print(json.dumps({"decision": "block", "reason": f"""`checkpoint` is a terminal command, not something to ask Claude.
  1. Exit Claude: press Ctrl+D twice.
  2. In the terminal, run:  checkpoint {number}
  3. Answer y, then start claude again."""}))
EOF

# Start learners in auto mode. This has to be user settings — `auto` is
# ignored from a project's .claude/settings.json.
cat << 'EOF' > /home/learner/.claude/settings.json
{
    "permissions": {
        "defaultMode": "auto"
    },
    "hooks": {
        "UserPromptSubmit": [
            {
                "hooks": [
                    {
                        "type": "command",
                        "command": "python3 /home/learner/.claude/hooks/checkpoint-guard.py"
                    }
                ]
            }
        ]
    }
}
EOF
