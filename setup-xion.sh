#!/bin/bash

# NoirCheck XION Integration Setup Script
# This script helps set up XION blockchain integration for NoirCheck

set -e

echo "🚀 NoirCheck XION Integration Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the NoirCheck root directory"
    exit 1
fi

echo "📋 Current Setup Status:"
echo "----------------------"

# Check if environment file exists
if [ -f "frontend/.env.local" ]; then
    print_status "Environment file exists"
    
    # Check for XION configuration
    if grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" frontend/.env.local; then
        CONTRACT_ADDR=$(grep "NEXT_PUBLIC_CONTRACT_ADDRESS" frontend/.env.local | cut -d'=' -f2 | tr -d '"')
        if [ -n "$CONTRACT_ADDR" ] && [ "$CONTRACT_ADDR" != "xion1..." ]; then
            print_status "Contract address configured: ${CONTRACT_ADDR:0:8}...${CONTRACT_ADDR: -6}"
        else
            print_warning "Contract address not configured"
        fi
    else
        print_warning "XION environment variables missing"
    fi
else
    print_warning "Environment file not found"
    
    echo ""
    print_info "Creating environment file from template..."
    cp frontend/.env.example frontend/.env.local
    print_status "Created frontend/.env.local from template"
fi

echo ""
echo "🔧 Setup Options:"
echo "---------------"
echo "1. Quick Setup with XION Quick Launch (Recommended)"
echo "2. Manual Environment Configuration"
echo "3. Development Mode (Simulated XION)"
echo "4. Check Current Configuration"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo ""
        print_info "🚀 Quick Setup with XION Quick Launch"
        echo ""
        echo "Follow these steps:"
        echo "1. Open https://quickstart.dev.testnet.burnt.com in your browser"
        echo "2. Connect with your Meta Account"
        echo "3. Select 'User Map' or 'Custom Contract'"
        echo "4. Click 'Launch User Map & Fund Treasury'"
        echo "5. Copy the generated environment variables"
        echo ""
        read -p "Have you completed the XION Quick Launch setup? (y/n): " completed
        
        if [ "$completed" = "y" ] || [ "$completed" = "Y" ]; then
            echo ""
            print_info "Please enter your XION contract details:"
            
            read -p "Content Registry Contract Address: " contract_addr
            read -p "Treasury Contract Address: " treasury_addr
            read -p "RPC URL (or press Enter for default): " rpc_url
            read -p "REST URL (or press Enter for default): " rest_url
            
            # Use defaults if not provided
            if [ -z "$rpc_url" ]; then
                rpc_url="https://rpc.xion-testnet-1.burnt.com:443"
            fi
            if [ -z "$rest_url" ]; then
                rest_url="https://api.xion-testnet-1.burnt.com"
            fi
            
            # Update environment file
            sed -i.bak "s|NEXT_PUBLIC_CONTRACT_ADDRESS=\"xion1...\"|NEXT_PUBLIC_CONTRACT_ADDRESS=\"$contract_addr\"|" frontend/.env.local
            sed -i.bak "s|NEXT_PUBLIC_TREASURY_ADDRESS=\"xion1...\"|NEXT_PUBLIC_TREASURY_ADDRESS=\"$treasury_addr\"|" frontend/.env.local
            sed -i.bak "s|NEXT_PUBLIC_RPC_URL=\"https://rpc.xion-testnet-1.burnt.com:443\"|NEXT_PUBLIC_RPC_URL=\"$rpc_url\"|" frontend/.env.local
            sed -i.bak "s|NEXT_PUBLIC_REST_URL=\"https://api.xion-testnet-1.burnt.com\"|NEXT_PUBLIC_REST_URL=\"$rest_url\"|" frontend/.env.local
            
            rm frontend/.env.local.bak
            
            print_status "XION configuration updated successfully!"
        else
            print_info "Please complete the XION Quick Launch setup first, then run this script again."
            echo "Visit: https://quickstart.dev.testnet.burnt.com"
        fi
        ;;
        
    2)
        echo ""
        print_info "📝 Manual Environment Configuration"
        echo ""
        print_info "Opening environment file for editing..."
        
        if command -v code &> /dev/null; then
            code frontend/.env.local
        elif command -v nano &> /dev/null; then
            nano frontend/.env.local
        else
            print_info "Please edit frontend/.env.local manually with your XION contract addresses"
        fi
        ;;
        
    3)
        echo ""
        print_info "🧪 Development Mode (Simulated XION)"
        echo ""
        print_info "NoirCheck will use simulated XION services for development."
        print_info "No blockchain configuration needed."
        print_status "Development mode ready!"
        ;;
        
    4)
        echo ""
        print_info "📊 Current Configuration Status"
        echo ""
        
        if [ -f "frontend/.env.local" ]; then
            echo "Environment file: ✅ Exists"
            
            # Check each required variable
            vars=("NEXT_PUBLIC_CONTRACT_ADDRESS" "NEXT_PUBLIC_TREASURY_ADDRESS" "NEXT_PUBLIC_RPC_URL" "NEXT_PUBLIC_REST_URL")
            
            for var in "${vars[@]}"; do
                if grep -q "$var" frontend/.env.local; then
                    value=$(grep "$var" frontend/.env.local | cut -d'=' -f2 | tr -d '"')
                    if [ -n "$value" ] && [ "$value" != "xion1..." ]; then
                        echo "$var: ✅ Configured"
                    else
                        echo "$var: ⚠️  Not configured"
                    fi
                else
                    echo "$var: ❌ Missing"
                fi
            done
        else
            echo "Environment file: ❌ Missing"
        fi
        ;;
        
    *)
        print_error "Invalid option selected"
        exit 1
        ;;
esac

echo ""
echo "🎯 Next Steps:"
echo "-------------"
echo "1. Start the backend: cd backend && python -m uvicorn main:app --reload"
echo "2. Start the frontend: cd frontend && npm run dev"
echo "3. Open http://localhost:3000 to see NoirCheck with XION integration!"
echo ""
print_status "Setup complete! 🎉"
