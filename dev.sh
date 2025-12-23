#!/bin/bash

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 Iniciando Pentesting Assistant...${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${CYAN}🛑 Deteniendo servidores...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${GREEN}📡 Iniciando Backend...${NC}"
cd backend
py -m uvicorn api.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start Frontend
echo -e "${GREEN}🎨 Iniciando Frontend...${NC}"
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Servidores iniciados!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${CYAN}Frontend: http://localhost:3000${NC}"
echo -e "${CYAN}Backend:  http://localhost:8000${NC}"
echo -e "${CYAN}API Docs: http://localhost:8000/docs${NC}"
echo ""
echo -e "${CYAN}Presiona Ctrl+C para detener${NC}"
echo ""

# Wait for processes
wait
