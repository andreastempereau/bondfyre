#!/bin/bash

# Script to fix common React Native iOS build issues for newer Xcode versions

echo "Fixing Folly C++ compatibility issues..."

# Find the Folly header and apply the fix
find ./Pods -name "New.h" | while read file; do
    echo "Fixing $file..."
    sed -i '' 's/FOLLY_HAVE_ALIGNED_NEW/FOLLY_HAVE_ALIGNED_NEW_DISABLED/g' "$file"
done

# Fix CoreText warnings
find ./Pods -name "*.mm" -o -name "*.cpp" | xargs grep -l "CoreText/" | while read file; do
    echo "Fixing CoreText imports in $file..."
    sed -i '' 's|CoreText/|CoreText.framework/Headers/|g' "$file"
done

echo "All fixes applied!"
