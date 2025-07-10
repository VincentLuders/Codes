#!/bin/bash

# Format Python files with Black and isort
echo "Formatting Python files..."

# Format imports with isort
echo "Sorting imports..."
isort --profile black --line-length 100 --check-only --diff Python/

# Format code with Black  
echo "Formatting code with Black..."
black --check --diff --line-length 100 Python/

echo "To actually format the files, run:"
echo "  isort --profile black --line-length 100 Python/"
echo "  black --line-length 100 Python/" 