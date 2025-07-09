#!/bin/bash

# Cleanup script for production deployment
# This script removes development files, debug code, and test files

# Set up log file
LOG_FILE="cleanup.log"
echo "CRM Accent Cleanup for Production - $(date)" > $LOG_FILE

# Function to log and display messages
log_message() {
  echo "$1" | tee -a $LOG_FILE
}

log_message "Starting cleanup process..."

# 1. Remove debug files and directories
log_message "Removing debug files and directories..."

# Remove debug API endpoints
rm -rf src/pages/api/debug
log_message "✅ Removed src/pages/api/debug"

# Remove debug components
rm -rf src/components/debug
log_message "✅ Removed src/components/debug"

# Remove debug app routes
rm -rf src/app/debug
log_message "✅ Removed src/app/debug"

# 2. Remove test files
log_message "Removing test files..."

# Remove test API endpoints
rm -f src/pages/api/test-*.js
log_message "✅ Removed test API files from src/pages/api/"

# Remove root test files
rm -f test-*.js
rm -f test_*.csv
log_message "✅ Removed test files from root directory"

# 3. Remove clients API (replaced by companies API)
log_message "Removing deprecated clients API..."
rm -rf src/pages/api/clients
log_message "✅ Removed src/pages/api/clients"

# 4. Log completion
log_message "Cleanup completed successfully!"
log_message "Please review cleanup.log for details."
