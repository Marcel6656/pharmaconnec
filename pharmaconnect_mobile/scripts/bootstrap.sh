#!/usr/bin/env bash
set -euo pipefail

if ! command -v flutter >/dev/null 2>&1; then
  echo "Flutter SDK introuvable. Installez Flutter stable puis relancez ce script."
  exit 1
fi

# Generate Android/iOS runner folders around this prepared Flutter source tree.
flutter create --platforms=android,ios --project-name pharmaconnect_mobile .
flutter pub get

echo "Socle PharmaConnect Mobile initialisé. Lancez : flutter run"
