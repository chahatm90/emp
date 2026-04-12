output "frontend_url" {
  value = "https://${azurerm_cdn_frontdoor_endpoint.main.host_name}"
}

output "employee_service_url" {
  value = "https://${azurerm_linux_web_app.employee_service.default_hostname}"
}

output "department_service_url" {
  value = "https://${azurerm_linux_web_app.department_service.default_hostname}"
}

output "sql_server_fqdn" {
  value = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "key_vault_uri" {
  value = azurerm_key_vault.main.vault_uri
}

output "storage_account_name" {
  value = azurerm_storage_account.main.name
}
