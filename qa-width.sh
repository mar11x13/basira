#!/bin/bash
# BASIRA mobile QA matrix — navigates every view via JS-driven clicks and
# checks horizontal overflow + page errors. Usage: ./qa-width.sh <session> <w> <h>
SESSION=$1; W=$2; H=$3

agent-browser set viewport $W $H --session $SESSION >/dev/null 2>&1
sleep 1.2

echo "== ${W}x${H} =="
for view in "Home" "Qur" "Hadith" "Ask BASIRA" "Dua" "Dhikr" "Salah" "Seerah" "Calendar" "Learn" "Glossary" "Bookmarks" "Settings"; do
  agent-browser eval "
(() => {
  const label = '$view';
  // bottom nav / sidebar first
  const navBtn = Array.from(document.querySelectorAll('nav button')).find(b => (b.textContent || '').startsWith(label));
  if (navBtn) { navBtn.click(); return 'nav'; }
  const more = Array.from(document.querySelectorAll('button')).find(b => (b.getAttribute('aria-label') || '').includes('More sections'));
  if (more) { more.click(); return 'more-opened'; }
  return 'not-found';
})()" --session $SESSION >/dev/null 2>&1
  sleep 0.9
  agent-browser eval "
(() => {
  const label = '$view';
  const btns = Array.from(document.querySelectorAll('button'));
  const target = btns.find(b => (b.textContent || '').trim().startsWith(label) && !b.closest('nav'));
  if (target) { target.click(); return 'sheet'; }
  return 'no-sheet';
})()" --session $SESSION >/dev/null 2>&1
  sleep 2.2
  RESULT=$(agent-browser eval "JSON.stringify({ov: document.documentElement.scrollWidth > window.innerWidth, sw: document.documentElement.scrollWidth, iw: window.innerWidth, h: (document.querySelector('main h1') || document.querySelector('main h2') || {textContent:''}).textContent.trim().slice(0,24)})" --session $SESSION 2>/dev/null | tail -1)
  echo "  $view → $RESULT"
done
echo "-- errors:"
agent-browser errors --session $SESSION 2>/dev/null | tail -4
echo "-- end ${W}x${H}"
