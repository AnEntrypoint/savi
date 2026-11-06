#!/usr/bin/env bash
# GET-only probe of Spawn doors. Writes raw bodies under reference/http/raw and prints status and key names.
B=https://www.spawn.co
RAW=/workspace/savi/.spawn/reference/http/raw
ENGINE=/workspace/savi/.spawn/engine
TOKEN_FILE=/config/.spawn/token

probe() {
  local slug=$1 url=$2
  local bodyA="$RAW/$slug.bearer.body" bodyN="$RAW/$slug.noauth.body"
  local sA sN
  sA=$(curl -sS -m 30 -o "$bodyA" -w '%{http_code}' -H "Authorization: Bearer $(cat "$TOKEN_FILE")" -H 'Accept: application/json, text/plain, */*' "$url")
  sN=$(curl -sS -m 30 -o "$bodyN" -w '%{http_code}' -H 'Accept: application/json, text/plain, */*' "$url")
  echo "== $slug $url bearer=$sA noauth=$sN bytes_bearer=$(wc -c < "$bodyA") bytes_noauth=$(wc -c < "$bodyN")"
  echo "   bearer: $(python3 -I "$ENGINE/keys.py" "$bodyA")"
  echo "   noauth: $(python3 -I "$ENGINE/keys.py" "$bodyN")"
}

probe api-types "$B/api/agent/v1/api"
probe agent-v1-me "$B/api/agent/v1/me"
probe agent-v1-worlds "$B/api/agent/v1/worlds"
probe agent-v1-access "$B/api/agent/v1/access"
probe agent-v1-me-numbers "$B/api/agent/v1/me/numbers"
probe agent-v1-chat-inbox "$B/api/agent/v1/chat/inbox"
probe notifications-unread "$B/api/notifications?unread=1"
probe invites "$B/api/invites"
probe social-me "$B/api/social/me"
probe feed "$B/api/feed"
probe resolve-adventure "$B/api/resolve-adventure?address=@lanmower/game-6"
probe games-comments "$B/api/games/d21d322b-4572-4710-a8d5-eaef4e6daa1f/comments"
probe games-folio "$B/api/games/d21d322b-4572-4710-a8d5-eaef4e6daa1f/folio"
probe sdk-agent-rooms "$B/api/sdk/v1/26f64424-cc19-43af-a9c3-666e4559bb05/agent/rooms"
probe sdk-agent-logs "$B/api/sdk/v1/26f64424-cc19-43af-a9c3-666e4559bb05/agent/logs"
probe sdk-agent-health "$B/api/sdk/v1/26f64424-cc19-43af-a9c3-666e4559bb05/agent/health"

sL=$(curl -sS -m 30 -o "$RAW/llms-txt.noauth.body" -w '%{http_code}' "$B/llms.txt")
echo "== llms-txt $B/llms.txt noauth=$sL bytes=$(wc -c < "$RAW/llms-txt.noauth.body")"
echo "   noauth: $(python3 -I "$ENGINE/keys.py" "$RAW/llms-txt.noauth.body")"
