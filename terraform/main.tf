locals {
  prefix = "${var.project}-${var.environment}"
}

# ── Resource Group ─────────────────────────────────────────────
resource "azurerm_resource_group" "main" {
  name     = "${local.prefix}-rg"
  location = var.location
  tags     = var.tags
}

# ── Key Vault ──────────────────────────────────────────────────
data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "main" {
  name                       = "${local.prefix}-kv"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7
  purge_protection_enabled   = false
  tags                       = var.tags

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id
    secret_permissions = ["Get", "List", "Set", "Delete", "Purge"]
  }
}

resource "azurerm_key_vault_secret" "sql_password" {
  name         = "sql-admin-password"
  value        = var.sql_admin_password
  key_vault_id = azurerm_key_vault.main.id
}

# ── Storage Account ────────────────────────────────────────────
resource "azurerm_storage_account" "main" {
  name                     = "${replace(local.prefix, "-", "")}storage"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = var.tags
}

# ── SQL Server ─────────────────────────────────────────────────
resource "azurerm_mssql_server" "main" {
  name                         = "${local.prefix}-sql"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_login
  administrator_login_password = var.sql_admin_password
  tags                         = var.tags
}

resource "azurerm_mssql_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_mssql_database" "main" {
  name      = "employeedb"
  server_id = azurerm_mssql_server.main.id
  sku_name  = "Basic"
  tags      = var.tags
}

# ── App Service Plan ───────────────────────────────────────────
resource "azurerm_service_plan" "main" {
  name                = "${local.prefix}-asp"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "B2"
  tags                = var.tags
}

# ── Employee Service ───────────────────────────────────────────
resource "azurerm_linux_web_app" "employee_service" {
  name                = "${local.prefix}-employee-service"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id
  tags                = var.tags

  site_config {
    always_on = true
    application_stack {
      java_server         = "JAVA"
      java_server_version = "17"
      java_version        = "17"
    }
    health_check_path = "/api/v1/employees/health"
  }

  app_settings = {
    SPRING_DATASOURCE_URL      = "jdbc:sqlserver://${azurerm_mssql_server.main.fully_qualified_domain_name}:1433;database=employeedb;encrypt=true;trustServerCertificate=false"
    SPRING_DATASOURCE_USERNAME = var.sql_admin_login
    SPRING_DATASOURCE_PASSWORD = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=sql-admin-password)"
    SERVER_PORT                = "8080"
    WEBSITES_PORT              = "8080"
  }

  identity {
    type = "SystemAssigned"
  }
}

# ── Department Service ─────────────────────────────────────────
resource "azurerm_linux_web_app" "department_service" {
  name                = "${local.prefix}-department-service"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id
  tags                = var.tags

  site_config {
    always_on = true
    application_stack {
      java_server         = "JAVA"
      java_server_version = "17"
      java_version        = "17"
    }
    health_check_path = "/api/v1/departments/health"
  }

  app_settings = {
    SPRING_DATASOURCE_URL      = "jdbc:sqlserver://${azurerm_mssql_server.main.fully_qualified_domain_name}:1433;database=employeedb;encrypt=true;trustServerCertificate=false"
    SPRING_DATASOURCE_USERNAME = var.sql_admin_login
    SPRING_DATASOURCE_PASSWORD = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=sql-admin-password)"
    SERVER_PORT                = "8080"
    WEBSITES_PORT              = "8080"
  }

  identity {
    type = "SystemAssigned"
  }
}

# ── Frontend ───────────────────────────────────────────────────
resource "azurerm_linux_web_app" "frontend" {
  name                = "${local.prefix}-frontend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id
  tags                = var.tags

  site_config {
    always_on = true
    application_stack {
      node_version = "20-lts"
    }
    app_command_line = "npx serve -s /home/site/wwwroot -l 8080"
  }

  app_settings = {
    WEBSITES_PORT                  = "8080"
    SCM_DO_BUILD_DURING_DEPLOYMENT = "false"
    VITE_EMPLOYEE_SERVICE_URL      = "https://${local.prefix}-employee-service.azurewebsites.net"
    VITE_DEPARTMENT_SERVICE_URL    = "https://${local.prefix}-department-service.azurewebsites.net"
  }
}

# ── Key Vault Access for App Services ─────────────────────────
resource "azurerm_key_vault_access_policy" "employee_service" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = azurerm_linux_web_app.employee_service.identity[0].tenant_id
  object_id    = azurerm_linux_web_app.employee_service.identity[0].principal_id
  secret_permissions = ["Get", "List"]
}

resource "azurerm_key_vault_access_policy" "department_service" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = azurerm_linux_web_app.department_service.identity[0].tenant_id
  object_id    = azurerm_linux_web_app.department_service.identity[0].principal_id
  secret_permissions = ["Get", "List"]
}

# ── Azure Front Door ───────────────────────────────────────────
resource "azurerm_cdn_frontdoor_profile" "main" {
  name                = "${local.prefix}-afd"
  resource_group_name = azurerm_resource_group.main.name
  sku_name            = "Standard_AzureFrontDoor"
  tags                = var.tags
}

resource "azurerm_cdn_frontdoor_endpoint" "main" {
  name                     = "${local.prefix}-endpoint"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.main.id
}

resource "azurerm_cdn_frontdoor_origin_group" "frontend" {
  name                     = "frontend-og"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.main.id
  session_affinity_enabled = false

  health_probe {
    interval_in_seconds = 30
    path                = "/"
    protocol            = "Https"
    request_type        = "GET"
  }

  load_balancing {
    additional_latency_in_milliseconds = 0
    sample_size                        = 4
    successful_samples_required        = 2
  }
}

resource "azurerm_cdn_frontdoor_origin" "frontend" {
  name                          = "frontend-origin"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.frontend.id
  enabled                       = true
  host_name                     = azurerm_linux_web_app.frontend.default_hostname
  origin_host_header            = azurerm_linux_web_app.frontend.default_hostname
  priority                      = 1
  weight                        = 1000
  certificate_name_check_enabled = true
}

resource "azurerm_cdn_frontdoor_route" "frontend" {
  name                          = "frontend-route"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.main.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.frontend.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.frontend.id]
  supported_protocols           = ["Http", "Https"]
  patterns_to_match             = ["/*"]
  forwarding_protocol           = "HttpsOnly"
  https_redirect_enabled        = true
}
