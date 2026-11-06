#!/bin/bash
cd /workspace/fee-now
while true; do
  node alerts.mjs >> /workspace/fee-now/alerts.out 2>&1
  echo "$(date -Is) tick_exit $?" >> /workspace/fee-now/alerts.out
  sleep 180
done
