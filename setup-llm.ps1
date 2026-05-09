#Requires -Version 5.1

<#
.SYNOPSIS
    GitHub AI Explorer - LLM Provider Setup Script

.DESCRIPTION
    Interactive PowerShell script to configure LLM provider settings for the
    GitHub AI Explorer project. Supports OpenAI and Anthropic providers.

.NOTES
    Requires: PowerShell 5.1+, curl (or Invoke-WebRequest)
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'
$ProjectDir = "D:\codeproject\github-ai-explorer"
$EnvFile = Join-Path $ProjectDir ".env"

# Ensure project directory exists
if (-not (Test-Path $ProjectDir)) {
    Write-Error "Project directory not found: $ProjectDir"
    exit 1
}

# =============================================================================
# Helper Functions
# =============================================================================

function Write-Banner {
    param([string]$Text)
    $line = "=" * 50
    Write-Host ""
    Write-Host $line -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host $line -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([int]$Number, [string]$Title)
    Write-Host "Step $Number`: $Title" -ForegroundColor Yellow
    Write-Host ("-" * 40)
}

function Get-UserInput {
    param(
        [string]$Prompt,
        [string]$Default = "",
        [switch]$NoEcho
    )
    if ($NoEcho) {
        $securePass = Read-Host -AsSecureString -Prompt $Prompt
        $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
        $input = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        return $input
    } else {
        if ($Default) {
            Write-Host "$Prompt [$Default]: " -NoNewline
        } else {
            Write-Host "$Prompt`: " -NoNewline
        }
        $input = Read-Host
        if ([string]::IsNullOrWhiteSpace($input)) { return $Default } else { return $input }
    }
}

function Test-ApiKey {
    param(
        [string]$Provider,
        [string]$BaseUrl,
        [string]$ApiKey
    )

    try {
        if ($Provider -eq "openai") {
            $headers = @{
                "Authorization" = "Bearer $ApiKey"
                "Content-Type" = "application/json"
            }
            $response = Invoke-RestMethod -Uri "$BaseUrl/models" -Method Get -Headers $headers -TimeoutSec 15
            return $true
        } else {
            # Anthropic
            $headers = @{
                "x-api-key" = $ApiKey
                "Content-Type" = "application/json"
                "anthropic-version" = "2023-06-01"
            }
            $response = Invoke-RestMethod -Uri "$BaseUrl/v1/models" -Method Get -Headers $headers -TimeoutSec 15
            return $true
        }
    } catch {
        Write-Host "[WARN] API validation failed: $_" -ForegroundColor Red
        return $false
    }
}

function Get-AvailableModels {
    param(
        [string]$Provider,
        [string]$BaseUrl,
        [string]$ApiKey
    )

    try {
        if ($Provider -eq "openai") {
            $headers = @{
                "Authorization" = "Bearer $ApiKey"
                "Content-Type" = "application/json"
            }
            $response = Invoke-RestMethod -Uri "$BaseUrl/models" -Method Get -Headers $headers -TimeoutSec 15
            # Parse OpenAI format: {"data":[{"id":"model-id",...},...]}
            $models = $response.data | Select-Object -ExpandProperty id
            return $models
        } else {
            # Anthropic
            $headers = @{
                "x-api-key" = $ApiKey
                "Content-Type" = "application/json"
                "anthropic-version" = "2023-06-01"
            }
            $response = Invoke-RestMethod -Uri "$BaseUrl/v1/models" -Method Get -Headers $headers -TimeoutSec 15
            # Anthropic returns models array directly or nested
            if ($response.models) {
                $models = $response.models | Select-Object -ExpandProperty name
            } elseif ($response.data) {
                $models = $response.data | Select-Object -ExpandProperty name
            } else {
                $models = @()
            }
            return $models
        }
    } catch {
        Write-Host "[WARN] Could not fetch models: $_" -ForegroundColor Red
        return @()
    }
}

function Get-DefaultModels {
    param([string]$Provider)
    if ($Provider -eq "openai") {
        return @(
            "gpt-4o-mini",
            "gpt-4o",
            "gpt-4-turbo",
            "gpt-4",
            "gpt-3.5-turbo"
        )
    } else {
        return @(
            "claude-sonnet-4-20250514",
            "claude-opus-4-20250514",
            "claude-sonnet-3-20250507",
            "claude-3-5-sonnet-20241022",
            "claude-3-5-haiku-20241022"
        )
    }
}

function Generate-VapidKeys {
    Write-Host "Generating VAPID keys using npx web-push..." -ForegroundColor Cyan

    try {
        Push-Location $ProjectDir
        $output = npx web-push generate-vapid-keys 2>&1
        Pop-Location

        $outputStr = $output | Out-String

        # Parse JSON output
        $jsonMatch = $outputStr -match '\{[^}]+\}'
        if ($jsonMatch) {
            try {
                $vapidKeys = $outputStr -match '("publicKey"\s*:\s*"([^"]+)")' | Out-Null
                $publicKey = $matches[2]

                $outputStr -match '("privateKey"\s*:\s*"([^"]+)")' | Out-Null
                $privateKey = $matches[2]

                return @{
                    PublicKey = $publicKey
                    PrivateKey = $privateKey
                }
            } catch {
                Write-Host "[WARN] Could not parse VAPID JSON output" -ForegroundColor Yellow
            }
        }

        # Fallback: try to extract raw keys
        Write-Host "[INFO] Attempting to parse raw output..." -ForegroundColor Yellow
        return $null
    } catch {
        Pop-Location
        Write-Host "[WARN] Failed to generate VAPID keys: $_" -ForegroundColor Red
        return $null
    }
}

function Backup-EnvFile {
    if (Test-Path $EnvFile) {
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $backupPath = Join-Path $ProjectDir ".env.backup_$timestamp"
        Copy-Item $EnvFile $backupPath -Force
        Write-Host "[OK] Backup created: $backupPath" -ForegroundColor Green
    }
}

function Write-EnvFile {
    param(
        [string]$Provider,
        [string]$BaseUrl,
        [string]$ApiKey,
        [string]$Model,
        [string]$VapidPublicKey,
        [string]$VapidPrivateKey,
        [string]$VapidEmail
    )

    $content = @"
LLM_PROVIDER=$Provider
LLM_BASE_URL=$BaseUrl
LLM_API_KEY=$ApiKey
LLM_MODEL=$Model
VAPID_PUBLIC_KEY=$VapidPublicKey
VAPID_PRIVATE_KEY=$VapidPrivateKey
VAPID_EMAIL=$VapidEmail
"@

    $content | Out-File -FilePath $EnvFile -Encoding UTF8 -Force
}

# =============================================================================
# Main Script
# =============================================================================

Clear-Host
Write-Banner "GitHub AI Explorer - LLM Provider Setup"

# Check for existing .env
if (Test-Path $EnvFile) {
    Write-Host "[INFO] .env file already exists." -ForegroundColor Cyan
    $backup = Get-UserInput -Prompt "Would you like to backup the existing .env file" -Default "Y"
    if ($backup -match "^[Yy]") {
        Backup-EnvFile
    }
    Write-Host ""
}

# Step 1: Provider Selection
Write-Step 1 "Select LLM Provider"
Write-Host "  [1] OpenAI (or OpenAI-compatible)" -ForegroundColor White
Write-Host "  [2] Anthropic" -ForegroundColor White
Write-Host ""

$providerChoice = Get-UserInput -Prompt "Enter choice" -Default "1"
if ($providerChoice -eq "2") {
    $LLM_PROVIDER = "anthropic"
} else {
    $LLM_PROVIDER = "openai"
}
Write-Host "[OK] Selected provider: $LLM_PROVIDER" -ForegroundColor Green
Write-Host ""

# Step 2: Base URL
Write-Step 2 "Configure Base URL"
if ($LLM_PROVIDER -eq "openai") {
    $defaultUrl = "https://api.openai.com/v1"
} else {
    $defaultUrl = "https://api.anthropic.com"
}
Write-Host "Press Enter to use default: $defaultUrl" -ForegroundColor Gray
Write-Host "  Common: DeepSeek=https://api.deepseek.com/v1, 通义千问=https://dashscope.aliyuncs.com/compatible-mode/v1" -ForegroundColor Gray
Write-Host ""

$BASE_URL = Get-UserInput -Prompt "Enter Base URL" -Default $defaultUrl
Write-Host "[OK] Base URL: $BASE_URL" -ForegroundColor Green
Write-Host ""

# Step 3: API Key
Write-Step 3 "Enter API Key"
Write-Host "Note: Characters will not be displayed for security" -ForegroundColor Gray
Write-Host ""

$API_KEY = Get-UserInput -Prompt "Enter API Key" -NoEcho
if ([string]::IsNullOrWhiteSpace($API_KEY)) {
    Write-Error "API key cannot be empty."
    exit 1
}
Write-Host "[OK] API key received" -ForegroundColor Green
Write-Host ""

# Step 4: Detect Available Models
Write-Step 4 "Detecting Available Models"
Write-Host "This may take a moment..." -ForegroundColor Gray
Write-Host ""

$detectedModels = Get-AvailableModels -Provider $LLM_PROVIDER -BaseUrl $BASE_URL -ApiKey $API_KEY

if ($detectedModels.Count -eq 0) {
    Write-Host "[WARN] Could not detect models. Using default model list." -ForegroundColor Yellow
    $detectedModels = Get-DefaultModels -Provider $LLM_PROVIDER
}

Write-Host "Available models:" -ForegroundColor White
for ($i = 0; $i -lt $detectedModels.Count; $i++) {
    Write-Host "  $($i + 1). $($detectedModels[$i])" -ForegroundColor White
}
Write-Host ""

$modelSelection = Get-UserInput -Prompt "Enter model number (1-$($detectedModels.Count)) or 'M' for manual" -Default "1"

if ($modelSelection -match "^[Mm]$") {
    $LLM_MODEL = Get-UserInput -Prompt "Enter model ID manually"
} elseif ($modelSelection -match "^\d+$" -and [int]$modelSelection -ge 1 -and [int]$modelSelection -le $detectedModels.Count) {
    $LLM_MODEL = $detectedModels[[int]$modelSelection - 1]
} else {
    Write-Host "[WARN] Invalid selection. Using first model." -ForegroundColor Yellow
    $LLM_MODEL = $detectedModels[0]
}

Write-Host "[OK] Selected model: $LLM_MODEL" -ForegroundColor Green
Write-Host ""

# Step 5: Validate API Key
Write-Step 5 "Validating API Key"
Write-Host "Testing connection..." -ForegroundColor Gray
Write-Host ""

$isValid = Test-ApiKey -Provider $LLM_PROVIDER -BaseUrl $BASE_URL -ApiKey $API_KEY

if ($isValid) {
    Write-Host "[OK] API key validated successfully!" -ForegroundColor Green
} else {
    Write-Host "[WARN] Could not validate API key. Please check your credentials." -ForegroundColor Red
    $continue = Get-UserInput -Prompt "Continue anyway" -Default "N"
    if ($continue -notmatch "^[Yy]") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit 0
    }
}
Write-Host ""

# Step 6: VAPID Email
Write-Step 6 "VAPID Email (Web Push Notifications)"
Write-Host "This is used for Web Push notifications (mailto: format)" -ForegroundColor Gray
Write-Host ""

$VAPID_EMAIL = Get-UserInput -Prompt "Enter VAPID email" -Default "mailto:user@example.com"
Write-Host "[OK] VAPID Email: $VAPID_EMAIL" -ForegroundColor Green
Write-Host ""

# Step 7: VAPID Keys
Write-Step 7 "VAPID Keys (Web Push)"
Write-Host ""

$generateVapid = Get-UserInput -Prompt "Would you like to generate VAPID keys now" -Default "Y"

$VAPID_PUBLIC_KEY = ""
$VAPID_PRIVATE_KEY = ""

if ($generateVapid -match "^[Yy]") {
    $vapidKeys = Generate-VapidKeys

    if ($vapidKeys -and $vapidKeys.PublicKey -and $vapidKeys.PrivateKey) {
        $VAPID_PUBLIC_KEY = $vapidKeys.PublicKey
        $VAPID_PRIVATE_KEY = $vapidKeys.PrivateKey
        Write-Host "[OK] VAPID keys generated!" -ForegroundColor Green
    } else {
        Write-Host "[WARN] VAPID keys not generated. You can run 'npx web-push generate-vapid-keys' later." -ForegroundColor Yellow
    }
} else {
    Write-Host "[INFO] VAPID keys not generated. You can run 'npx web-push generate-vapid-keys' later." -ForegroundColor Cyan
}
Write-Host ""

# Step 8: Write .env File
Write-Step 8 "Writing .env File"

Write-EnvFile -Provider $LLM_PROVIDER -BaseUrl $BASE_URL -ApiKey $API_KEY -Model $LLM_MODEL `
    -VapidPublicKey $VAPID_PUBLIC_KEY -VapidPrivateKey $VAPID_PRIVATE_KEY -VapidEmail $VAPID_EMAIL

if (Test-Path $EnvFile) {
    Write-Host "[OK] .env file created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Location: $EnvFile" -ForegroundColor White
} else {
    Write-Error "Failed to create .env file."
    exit 1
}
Write-Host ""

# Summary
Write-Banner "Setup Complete!"

Write-Host "Configuration summary:" -ForegroundColor White
Write-Host "  Provider:    $LLM_PROVIDER" -ForegroundColor White
Write-Host "  Base URL:    $BASE_URL" -ForegroundColor White
Write-Host "  Model:       $LLM_MODEL" -ForegroundColor White
Write-Host "  VAPID Email: $VAPID_EMAIL" -ForegroundColor White
if ($VAPID_PUBLIC_KEY) {
    Write-Host "  VAPID Keys:  Generated" -ForegroundColor White
} else {
    Write-Host "  VAPID Keys:  Not configured" -ForegroundColor White
}
Write-Host ""
Write-Host "You can edit the .env file directly to make changes." -ForegroundColor Gray
Write-Host ""
