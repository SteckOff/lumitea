#!/usr/bin/env bash
# Run the Flutter app in debug mode with all required --dart-define values.
# Usage: ./run_dev.sh [device-id]
#   e.g. ./run_dev.sh  (uses default connected device)
#        ./run_dev.sh emulator-5554
set -e

SUPABASE_URL="https://wewoixzvgcufopgjwpuk.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indld29peHp2Z2N1Zm9wZ2p3cHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjYyMzgsImV4cCI6MjA5NDQ0MjIzOH0.iVLOjbEKkvWy1uQLDuUINzaOdQfge4bLVovVWOEaglQ"
STRIPE_PK="pk_test_51RU5upQuiZH39Uf8nXoLNWMGBrQ2r8zUkHoCErfQs5cawWRKkNzsthEi0CCvt43y1AlvevcuB7jOqj5HPAq6WvA800GPLrkddU"

DEVICE_ARGS=""
if [ -n "$1" ]; then
  DEVICE_ARGS="-d $1"
fi

flutter run $DEVICE_ARGS \
  --dart-define=SUPABASE_URL="$SUPABASE_URL" \
  --dart-define=SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  --dart-define=STRIPE_PK="$STRIPE_PK"
