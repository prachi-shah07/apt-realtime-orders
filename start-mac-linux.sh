#!/bin/bash
echo "======================================================="
echo "   APT Real-Time Order System - Startup Script (Mac/Linux)"
echo "======================================================="
echo ""
echo "[1/2] Installing dependencies..."
cd backend
npm install
echo ""
echo "[2/2] Starting server and creating database (if needed)..."
npm start
