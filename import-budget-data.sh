#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting budget data import process..."

# --- Configuration ---
# Assuming Neo4j is running locally via Docker Compose on default ports
# and credentials are set in the .env file of the open-budget-api project.
# We will pass these to the data importer's .env file.

# Check if .env exists in the current directory (open-budget-api project)
if [ ! -f .env ]; then
    echo "Error: .env file not found in the current directory. Please create it based on .env.example."
    exit 1
fi

# Load Neo4j credentials from the current project's .env file
source .env

NEO4J_URI=${NEO4J_URI:-"neo4j://localhost:7687"}
NEO4J_USER=${NEO4J_USER:-"neo4j"}
NEO4J_PASSWORD=${NEO4J_PASSWORD:-"password"}

# --- Clone and Prepare Data Importer Repository ---
DATA_IMPORTER_DIR="../data-importer"
OPEN_BUDGET_DATA_REPO="https://github.com/bettergovph/open-budget-data.git"

if [ ! -d "$DATA_IMPORTER_DIR" ]; then
    echo "Cloning open-budget-data repository into $DATA_IMPORTER_DIR..."
    git clone "$OPEN_BUDGET_DATA_REPO" "$DATA_IMPORTER_DIR"
else
    echo "open-budget-data repository already exists. Pulling latest changes..."
    (cd "$DATA_IMPORTER_DIR" && git pull)
fi

echo "Navigating to data importer directory: $DATA_IMPORTER_DIR"
cd "$DATA_IMPORTER_DIR"

# --- Setup Python Environment ---
echo "Setting up Python virtual environment and installing dependencies..."
python3 -m venv venv
source venv/bin/activate

# Always recreate requirements.txt to ensure it's up-to-date
echo "Creating/updating requirements.txt with known dependencies (neo4j, pandas, openpyxl, requests)."
cat << EOF_REQ > requirements.txt
neo4j
pandas
openpyxl
requests
EOF_REQ

pip install --upgrade pip # Ensure pip is up-to-date
pip install -r requirements.txt

# --- Create .env for Data Importer ---
echo "Creating .env file for data importer with Neo4j credentials..."
cat << EOF > .env
NEO4J_URI=$NEO4J_URI
NEO4J_USER=$NEO4J_USER
NEO4J_PASSWORD=$NEO4J_PASSWORD
EOF

# --- Data Conversion ---
echo "Starting UACS data conversion..."
UACS_TYPES=("funding-source" "location" "mfo-pap" "object-code" "organization")
for UACS_TYPE in "${UACS_TYPES[@]}"; do
    UACS_SCRIPT=""
    if [ "$UACS_TYPE" == "object-code" ]; then
        UACS_SCRIPT="scripts/uacs/${UACS_TYPE}/analyze.py" # Specific for object-code
    else
        UACS_SCRIPT="scripts/uacs/${UACS_TYPE}/converter.py" # Default for others
    fi

    if [ ! -f "$UACS_SCRIPT" ]; then
        echo "Error: UACS converter script not found for $UACS_TYPE at $UACS_SCRIPT."
        echo "Please verify the structure of the open-budget-data repository."
        exit 1
    fi
    echo "  Converting UACS type: $UACS_TYPE"
    python3 "$UACS_SCRIPT"
done

NEP_GAA_CONVERTER_SCRIPT="scripts/nep-gaa/converter.py"
SYNC_SCRIPT="sync.py"

# Check if NEP/GAA converter script exists
if [ ! -f "$NEP_GAA_CONVERTER_SCRIPT" ]; then
    echo "Error: NEP/GAA converter script not found at $NEP_GAA_CONVERTER_SCRIPT."
    echo "Please verify the structure of the open-budget-data repository."
    exit 1
fi

echo "Starting NEP/GAA budget data conversion..."
python3 "$NEP_GAA_CONVERTER_SCRIPT"

# Check if sync script exists
if [ ! -f "$SYNC_SCRIPT" ]; then
    echo "Error: Sync script not found at $SYNC_SCRIPT."
    echo "Please verify the structure of the open-budget-data repository."
    exit 1
fi

echo "Waiting for Neo4j to be fully ready before syncing..."
sleep 10 # Give Neo4j a bit more time after conversions

echo "Syncing all converted data to Neo4j..."
# Explicitly pass Neo4j credentials as environment variables
NEO4J_URI=$NEO4J_URI \
NEO4J_USER=$NEO4J_USER \
NEO4J_PASSWORD=$NEO4J_PASSWORD \
python3 "$SYNC_SCRIPT"

echo "Budget data import complete!"

# --- Cleanup ---
deactivate
echo "Deactivated Python virtual environment."
echo "You can now return to the open-budget-api project directory."
