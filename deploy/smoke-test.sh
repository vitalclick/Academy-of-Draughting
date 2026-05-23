#!/usr/bin/env bash
# Smoke-test a deployed Academy of Advanced Draughting instance.
#
# Usage: bash deploy/smoke-test.sh https://academydraughting.com
#
# Exits non-zero if any check fails. Designed to be safe against any env —
# uses no auth and posts only to no-side-effect endpoints. The lead capture
# and chat tests fire a real request, so don't run repeatedly against prod
# (rate-limited per IP anyway).

set -u
BASE="${1:-https://academydraughting.com}"
BASE="${BASE%/}"
echo "Smoke-testing $BASE"
echo

FAIL=0
ok=0
total=0

check() {
  local desc="$1"
  local expected="$2"
  local actual="$3"
  total=$((total + 1))
  if [ "$actual" = "$expected" ]; then
    printf "  \e[32m✓\e[0m %-50s %s\n" "$desc" "$actual"
    ok=$((ok + 1))
  else
    printf "  \e[31m✗\e[0m %-50s expected=%s actual=%s\n" "$desc" "$expected" "$actual"
    FAIL=1
  fi
}

contains() {
  local desc="$1"
  local needle="$2"
  local haystack="$3"
  total=$((total + 1))
  if echo "$haystack" | grep -q "$needle"; then
    printf "  \e[32m✓\e[0m %s\n" "$desc"
    ok=$((ok + 1))
  else
    printf "  \e[31m✗\e[0m %s (needle: %s)\n" "$desc" "$needle"
    FAIL=1
  fi
}

# --- Public routes ---
echo "== Public routes =="
for route in / /about /courses /courses/mddop /courses/bridging /courses/autocad /courses/revit /courses/inventor /courses/civil /career /career/quiz /apply /contact /blog /privacy /terms /popia /data-rights /sitemap.xml /robots.txt; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' "$BASE$route")
  check "$route" "200" "$code"
done

# --- Auth-gated routes ---
echo
echo "== Auth-gated routes (expect 307 redirects) =="
for route in /admin /admin/applications /admin/content /portal /portal/courses/abc; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' "$BASE$route")
  check "$route" "307" "$code"
done

# --- Login pages (should be 200) ---
echo
echo "== Login pages =="
for route in /admin/login /portal/login; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' "$BASE$route")
  check "$route" "200" "$code"
done

# --- API endpoints ---
echo
echo "== Health =="
HEALTH=$(curl -sS "$BASE/api/health?check=ready")
contains "responds OK" '"status":"ok"' "$HEALTH"
contains "supabase reachable" '"supabase":true' "$HEALTH"
contains "ai configured" '"ai":true' "$HEALTH"
contains "resend configured" '"resend":true' "$HEALTH"

echo
echo "== /api/events accepts valid JSON =="
EVENT=$(curl -sS -X POST "$BASE/api/events" -H 'Content-Type: application/json' -d '{"name":"smoke_test","payload":{"source":"smoke-test.sh"}}')
contains "events ok" '"ok":true' "$EVENT"

echo
echo "== /api/applications/documents rejects bad UUID =="
SIGN=$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$BASE/api/applications/documents" -H 'Content-Type: application/json' -d '{"applicationId":"not-uuid","kind":"id","filename":"x.pdf","bytes":100}')
check "documents 400 on bad input" "400" "$SIGN"

echo
echo "== /api/data-rights rejects bad email =="
DR=$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$BASE/api/data-rights" -H 'Content-Type: application/json' -d '{"email":"not-an-email","kind":"access"}')
check "data-rights 400 on bad email" "400" "$DR"

# --- Security headers ---
echo
echo "== Security headers (on /) =="
HEADERS=$(curl -sSI "$BASE/")
contains "CSP set" "Content-Security-Policy" "$HEADERS"
contains "no script-src unsafe-inline" "script-src 'self'" "$HEADERS"
contains "frame-ancestors none" "frame-ancestors 'none'" "$HEADERS"
contains "X-Frame-Options DENY" "X-Frame-Options: DENY" "$HEADERS"
contains "HSTS 2 years" "max-age=63072000" "$HEADERS"
contains "Referrer-Policy set" "Referrer-Policy: strict-origin-when-cross-origin" "$HEADERS"
contains "Permissions-Policy set" "Permissions-Policy" "$HEADERS"

echo
echo "== /admin noindex header =="
ADMIN_HEADERS=$(curl -sSI "$BASE/admin")
contains "X-Robots-Tag noindex on admin" "noindex" "$ADMIN_HEADERS"

# --- SEO ---
echo
echo "== SEO =="
SITEMAP=$(curl -sS "$BASE/sitemap.xml")
URL_COUNT=$(echo "$SITEMAP" | grep -oE '<loc>' | wc -l | tr -d ' ')
if [ "$URL_COUNT" -gt 15 ]; then
  printf "  \e[32m✓\e[0m %-50s %s URLs\n" "sitemap.xml" "$URL_COUNT"
  ok=$((ok + 1))
else
  printf "  \e[31m✗\e[0m sitemap.xml only has %s URLs (expected >15)\n" "$URL_COUNT"
  FAIL=1
fi
total=$((total + 1))

ROBOTS=$(curl -sS "$BASE/robots.txt")
contains "robots disallows /api" "/api/" "$ROBOTS"
contains "robots references sitemap" "sitemap.xml" "$ROBOTS"

HOME=$(curl -sS "$BASE/")
contains "Organization JSON-LD" '"@type":"EducationalOrganization"' "$HOME"

COURSE=$(curl -sS "$BASE/courses/mddop")
contains "Course JSON-LD on detail page" '"@type":"Course"' "$COURSE"
contains "FAQ JSON-LD on detail page" '"@type":"FAQPage"' "$COURSE"

echo
echo "== Summary =="
if [ "$FAIL" -eq 0 ]; then
  printf "\e[32m✓ %s/%s checks passed\e[0m\n" "$ok" "$total"
  exit 0
else
  printf "\e[31m✗ %s/%s checks passed — %s failures\e[0m\n" "$ok" "$total" "$((total - ok))"
  echo
  echo "If the failures are all in the Health section (supabase/ai/resend not true),"
  echo "the integrations aren't fully configured yet — check vercel-env.md."
  echo "Failures elsewhere are real bugs."
  exit 1
fi
