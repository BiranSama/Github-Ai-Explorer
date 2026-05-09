@echo off
setlocal EnableDelayedExpansion

:: =============================================================================
:: GitHub AI Explorer - LLM Provider Setup Script
:: =============================================================================

set "PROJECT_DIR=D:\codeproject\github-ai-explorer"
set "ENV_FILE=%PROJECT_DIR%\.env"

title GitHub AI Explorer - LLM Setup

echo ============================================
echo   GitHub AI Explorer - LLM Provider Setup
echo ============================================
echo.

:: Check if .env exists and offer backup
if exist "%ENV_FILE%" (
    echo [INFO] .env file already exists.
    set /p BACKUP="Would you like to backup the existing .env file? (Y/N): "
    if /i "!BACKUP!"=="Y" (
        set "TIMESTAMP=%DATE:~-4%-%DATE:~4,2%-%DATE:~7,2%_%TIME:~0,2%-%TIME:~3,2%-%TIME:~6,2%"
        set "TIMESTAMP=!TIMESTAMP: =0!"
        copy "%ENV_FILE%" "%PROJECT_DIR%\.env.backup_!TIMESTAMP!"
        echo [OK] Backup created as .env.backup_!TIMESTAMP!
    )
)
echo.

:: =============================================================================
:: Step 1: Provider Selection
:: =============================================================================
echo Step 1: Select LLM Provider
echo ------------------------------
echo   [1] OpenAI (or OpenAI-compatible)
echo   [2] Anthropic
echo.

set /p PROVIDER_CHOICE="Enter choice (1 or 2): "
if "!PROVIDER_CHOICE!"=="1" set "LLM_PROVIDER=openai"
if "!PROVIDER_CHOICE!"=="2" set "LLM_PROVIDER=anthropic"

if not defined LLM_PROVIDER (
    echo [ERROR] Invalid provider selection.
    pause
    exit /b 1
)
echo [OK] Selected provider: !LLM_PROVIDER!
echo.

:: =============================================================================
:: Step 2: Base URL
:: =============================================================================
echo Step 2: Configure Base URL
echo ------------------------------
if "!LLM_PROVIDER!"=="openai" (
    set "DEFAULT_URL=https://api.openai.com/v1"
) else (
    set "DEFAULT_URL=https://api.anthropic.com"
)
echo Press Enter to use default: !DEFAULT_URL!
echo.

set /p BASE_URL="Enter Base URL: "
if "!BASE_URL!"=="" set "BASE_URL=!DEFAULT_URL!"
echo [OK] Base URL: !BASE_URL!
echo.

:: =============================================================================
:: Step 3: API Key
:: =============================================================================
echo Step 3: Enter API Key
echo ------------------------------
echo Note: Characters will not be displayed for security
echo.

:set_api_key
set /p "API_KEY=Enter API Key: "
if not defined API_KEY (
    echo [ERROR] API key cannot be empty.
    goto :set_api_key
)
echo [OK] API key received
echo.

:: =============================================================================
:: Step 4: Detect Available Models
:: =============================================================================
echo Step 4: Detecting Available Models
echo -----------------------------------
echo This may take a moment...
echo.

set "DETECTED_MODELS="
set "MODEL_COUNT=0"

if "!LLM_PROVIDER!"=="openai" (
    :: OpenAI-compatible: GET /models with Bearer token
    for /f "delims=" %%i in ('curl -s -X GET "!BASE_URL!/models" -H "Authorization: Bearer !API_KEY!" -H "Content-Type: application/json" 2^>nul') do set "MODELS_RESPONSE=%%i"
) else (
    :: Anthropic: GET /models with x-api-key
    for /f "delims=" %%i in ('curl -s -X GET "!BASE_URL!/models" -H "x-api-key: !API_KEY!" -H "Content-Type: application/json" 2^>nul') do set "MODELS_RESPONSE=%%i"
)

:: Parse models from JSON response
:: For OpenAI format: {"data":[{"id":"model-id",...},...]}
echo !MODELS_RESPONSE! | findstr /C:"id" >nul 2>&1
if !errorlevel!==0 (
    :: Extract model IDs - simple parsing for common formats
    for /f "tokens=*" %%a in ('echo !MODELS_RESPONSE! ^| findstr /R "id.*:"') do (
        set "LINE=%%a"
        for /f "tokens=2 delims=:, " %%m in ('echo %%a ^| findstr /R "id"') do (
            set "MODEL_ID=%%m"
            set "MODEL_ID=!MODEL_ID:"=!"
            if not "!MODEL_ID!"=="" (
                if not "!MODEL_ID!"=="id" (
                    set /a MODEL_COUNT+=1
                    set "DETECTED_MODELS=!DETECTED_MODELS!!MODEL_COUNT!. !MODEL_ID!<ECHO>"
                )
            )
        )
    )
)

:: Fallback: If no models detected, use defaults
if !MODEL_COUNT!==0 (
    if "!LLM_PROVIDER!"=="openai" (
        echo [WARN] Could not detect models. Using default model list.
        set "DETECTED_MODELS=1. gpt-4o-mini<ECHO>2. gpt-4o<ECHO>3. gpt-4-turbo<ECHO>4. gpt-4<ECHO>5. gpt-3.5-turbo"
        set "MODEL_COUNT=5"
    ) else (
        echo [WARN] Could not detect models. Using default model list.
        set "DETECTED_MODELS=1. claude-sonnet-4-20250514<ECHO>2. claude-opus-4-20250514<ECHO>3. claude-sonnet-3-20250507<ECHO>4. claude-3-5-sonnet-20241022<ECHO>5. claude-3-5-haiku-20241022"
        set "MODEL_COUNT=5"
    )
)

:: Display models
echo Available models:
for /f "tokens=1,2 delims=<" %%a in ('echo !DETECTED_MODELS!') do (
    if "%%a" neq "" echo   %%a
)
echo.

:: Model Selection
set /p MODEL_SELECTION="Enter model number (1-!MODEL_COUNT!) or 'M' for manual entry: "
if /i "!MODEL_SELECTION!"=="M" (
    set /p "LLM_MODEL=Enter model ID manually: "
) else (
    if !MODEL_SELECTION! geq 1 if !MODEL_SELECTION! leq !MODEL_COUNT! (
        :: Extract selected model
        set "COUNTER=0"
        for /f "tokens=1,2 delims=<" %%a in ('echo !DETECTED_MODELS!') do (
            set /a COUNTER+=1
            if !COUNTER!==!MODEL_SELECTION! set "LLM_MODEL=%%a"
            set "LLM_MODEL=!LLM_MODEL:~2!"
        )
    ) else (
        echo [ERROR] Invalid selection. Using default.
        if "!LLM_PROVIDER!"=="openai" set "LLM_MODEL=gpt-4o-mini"
        if "!LLM_PROVIDER!"=="anthropic" set "LLM_MODEL=claude-sonnet-4-20250514"
    )
)
echo [OK] Selected model: !LLM_MODEL!
echo.

:: =============================================================================
:: Step 5: Validate API Key
:: =============================================================================
echo Step 5: Validating API Key
echo ------------------------------
echo Testing connection...

if "!LLM_PROVIDER!=="openai" (
    for /f "delims=" %%i in ('curl -s -o nul -w "%%{http_code}" -X GET "!BASE_URL!/models" -H "Authorization: Bearer !API_KEY!"') do set "HTTP_CODE=%%i"
) else (
    for /f "delims=" %%i in ('curl -s -o nul -w "%%{http_code}" -X GET "!BASE_URL!/v1/models" -H "x-api-key: !API_KEY!" -H "anthropic-version: 2023-06-01"') do set "HTTP_CODE=%%i"
)

if "!HTTP_CODE!=="200" (
    echo [OK] API key validated successfully!
) else (
    echo [WARN] API validation failed ^(HTTP !HTTP_CODE!^). Please check your credentials.
    set /p "CONTINUE=Continue anyway? (Y/N): "
    if /i not "!CONTINUE!=="Y" exit /b 1
)
echo.

:: =============================================================================
:: Step 6: VAPID Email for Web Push
:: =============================================================================
echo Step 6: VAPID Email (Web Push Notifications)
echo ----------------------------------------------
echo This is used for Web Push notifications in format: mailto:you@example.com
echo.

set /p "VAPID_EMAIL=Enter VAPID email (mailto: format): "
if "!VAPID_EMAIL!"=="" set "VAPID_EMAIL=mailto:user@example.com"
echo [OK] VAPID Email: !VAPID_EMAIL!
echo.

:: =============================================================================
:: Step 7: VAPID Keys Generation
:: =============================================================================
echo Step 7: VAPID Keys (Web Push)
echo ------------------------------
set /p "GENERATE_VAPID=Would you like to generate VAPID keys now? (Y/N): "
if /i "!GENERATE_VAPID!"=="Y" (
    echo Generating VAPID keys...
    echo.

    :: Change to project directory and run web-push
    pushd %PROJECT_DIR%
    for /f "delims=" %%i in ('npx web-push generate-vapid-keys 2^>nul') do set "VAPID_OUTPUT=%%i"

    :: Parse VAPID output
    echo !VAPID_OUTPUT! | findstr "publicKey" >nul 2>&1
    if !errorlevel!==0 (
        for /f "tokens=2 delims=:" %%a in ('echo !VAPID_OUTPUT! ^| findstr "publicKey"') do (
            set "VAPID_PUBLIC_KEY=%%a"
            set "VAPID_PUBLIC_KEY=!VAPID_PUBLIC_KEY:,=!"
            set "VAPID_PUBLIC_KEY=!VAPID_PUBLIC_KEY:"=!"
            set "VAPID_PUBLIC_KEY=!VAPID_PUBLIC_KEY: =!"
        )
        for /f "tokens=2 delims=:" %%a in ('echo !VAPID_OUTPUT! ^| findstr "privateKey"') do (
            set "VAPID_PRIVATE_KEY=%%a"
            set "VAPID_PRIVATE_KEY=!VAPID_PRIVATE_KEY:"=!"
            set "VAPID_PRIVATE_KEY=!VAPID_PRIVATE_KEY: =!"
        )
        echo [OK] VAPID keys generated!
    ) else (
        echo [WARN] Could not parse VAPID output. Keys not generated.
        set "VAPID_PUBLIC_KEY="
        set "VAPID_PRIVATE_KEY="
    )
    popd
) else (
    set "VAPID_PUBLIC_KEY="
    set "VAPID_PRIVATE_KEY="
    echo [INFO] VAPID keys not generated. You can run 'npx web-push generate-vapid-keys' later.
)
echo.

:: =============================================================================
:: Step 8: Write .env File
:: =============================================================================
echo Step 8: Writing .env File
echo -------------------------

(
    echo LLM_PROVIDER=!LLM_PROVIDER!
    echo LLM_BASE_URL=!BASE_URL!
    echo LLM_API_KEY=!API_KEY!
    echo LLM_MODEL=!LLM_MODEL!
    echo VAPID_PUBLIC_KEY=!VAPID_PUBLIC_KEY!
    echo VAPID_PRIVATE_KEY=!VAPID_PRIVATE_KEY!
    echo VAPID_EMAIL=!VAPID_EMAIL!
) > "%ENV_FILE%"

if exist "%ENV_FILE%" (
    echo [OK] .env file created successfully at:
    echo       !ENV_FILE!
) else (
    echo [ERROR] Failed to create .env file.
    pause
    exit /b 1
)
echo.

:: =============================================================================
:: Summary
:: =============================================================================
echo ============================================
echo            Setup Complete!
echo ============================================
echo.
echo Configuration summary:
echo   Provider:    !LLM_PROVIDER!
echo   Base URL:    !BASE_URL!
echo   Model:       !LLM_MODEL!
echo   VAPID Email: !VAPID_EMAIL!
echo   VAPID Keys:  !VAPID_PUBLIC_KEY:~0,20!...
echo.
echo You can edit the .env file directly to make changes.
echo.

pause
